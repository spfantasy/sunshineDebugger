import {evalString, formatString} from "./util.js";
import JSON5 from 'json5';
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
export default async function graphWalk(connections, env, ctx, nodes) {
    // node.value -> [node.child.value]
    const graph = new Map();
    // node.value -> node.parents.length
    const inDegree = new Map();
    // node.value -> node
    const nodeMap = new Map();
    ctx.nodes = [];
    ctx.edges = [];

    // 初始化
    nodes.forEach(node => {
        graph.set(node.value, []);
        inDegree.set(node.value, 0);
        nodeMap.set(node.value, node);
    });
    nodes.forEach(node => {
        node.parents.forEach(parent => {
            graph.get(parent).push(node.value);
            inDegree.set(node.value, inDegree.get(node.value) + 1);
        });
    });

    // Function to process a node and its children
    async function processNodeAndChildren (nodeValue) {
        const node = nodeMap.get(nodeValue);
        await buildBean(connections, env, ctx, node);

        // Decrease the in-degree of all children and process them if they have no remaining parents
        const promises = graph.get(nodeValue).map(child => {
            inDegree.set(child, inDegree.get(child) - 1);
            if (inDegree.get(child) === 0) {
                processQueue.push(child);
                return processNext();
            } else {
                return Promise.resolve();
            }
        });
        // 等待所有 Promise 完成
        await Promise.all(promises);
    }

    // Queue to manage nodes to be processed
    const processQueue = [];

    // Function to process the next node in the queue
    async function processNext () {
        while (processQueue.length > 0) {
            const nextNodeValue = processQueue.shift();
            await processNodeAndChildren(nextNodeValue);
        }
    }

    // Start processing nodes with no parents (in-degree 0)
    inDegree.forEach((degree, nodeValue) => {
        if (degree === 0) {
            processQueue.push(nodeValue);
        }
    });

    // Start processing the queue
    await processNext();
    return ctx;
}


async function buildBean(connections, env, ctx, node) {
    try {
        console.log("ctx = " + JSON5.stringify(ctx));
        console.log("node = " + JSON5.stringify(node));
        // 为bean建立空context数据
        ctx[node.value] = {"label": node.label};
        // 执行retriever部分逻辑
        for (const retriever of node.attrs.retrievers) {
            const connection = connections[env + ":" + retriever.datasource];
            const query = formatString(retriever.query, ctx, "");
            const params =  (retriever.queryParams || []).map(p => evalString(p, ctx));
            const [results, metadata] = await connection.query(query, params);
            console.log(`${query}(${params}) => ${JSON5.stringify(results)}`);
            ctx[node.value].queryResult = results;
            for (const sinker of retriever.sink) {
                const result = evalString(sinker.if, ctx);
                console.log(`sinker.if: ${sinker.if} => ${result}`);
                if (sinker.if == null || result === true) {
                    console.log(`sinker.statement: ${sinker.statement}`);
                    evalString(sinker.statement, ctx);
                }
            }
        }
        // 执行drawer 部分逻辑
        ctx[node.value].queryResult = null;
        renderNode(ctx, node);
    } catch (error) {
        error.message = `执行节点${node.value}异常` + error.message;
        console.log(error.message);
        throw error;
    }
}

function renderNode(ctx, node) {
    ctx.nodes.push({
        id: node.value,
        type: node.type,
        data: ctx[node.value],
        position: {
            x: 0,
            y: 0,
        },
        style: {
            width: '200px',
            height: '100px',
        },
        freshness: 1,
        importance: 1,
    })
    node.parents.forEach(parentValue => ctx.edges.push({
        id: `e${parentValue}-${node.value}`,
        source: parentValue,
        target: node.value,
        animated: true,
    }))
}
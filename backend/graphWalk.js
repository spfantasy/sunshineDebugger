import {evalString, formatString, evalObject} from "./util.js";
import JSON5 from 'json5';
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
class Lock {
    constructor() {
        this._locked = false;
        this._waiting = [];
    }

    async acquire() {
        const unlock = () => {
            const nextResolve = this._waiting.shift();
            if (nextResolve) {
                nextResolve(unlock);
            } else {
                this._locked = false;
            }
        };

        if (this._locked) {
            return new Promise(resolve => this._waiting.push(resolve)).then(() => unlock);
        } else {
            this._locked = true;
            return Promise.resolve(unlock);
        }
    }
}

function makeFocusSet(focus, nodes) {
    const focusSet = new Set();
    const focusQueue = [focus];
    while (focusQueue.length > 0) {
        const node = nodes.get(focusQueue.shift());
        if (node != null) {
            focusSet.add(node.value);
            const parents = node.parents || [];
            parents.forEach(parent => focusQueue.push(parent));
        }
    }
    return focusSet;
}

export default async function graphWalk(connections, env, queryParam, focus, nodes) {
    // node.value -> [node.child.value]
    const graph = new Map();
    // node.value -> node.parents.length
    const inDegree = new Map();
    const inDegreeLock = new Lock();
    // node.value -> node
    const nodeMap = new Map();
    const ctx = {};
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
    const focusSet = makeFocusSet(focus, nodeMap);
    // 对于指定入度的节点，直接覆盖
    nodes.forEach(node => {
        if (node.inDegree != null) {
            inDegree.set(node.value, node.inDegree);
        }
    })

    // Function to process a node and its children
    async function processNodeAndChildren(nodeValue) {
        focusSet.delete(nodeValue);
        const node = nodeMap.get(nodeValue);
        const isSuccess = await buildBean(connections, env, ctx, node, queryParam);
        if (isSuccess === true) {
            // Decrease the in-degree of all children and process them if they have no remaining parents
            const children = graph.get(nodeValue);
            const promises = [];

            for (const child of children) {
                promises.push((async () => {
                    const unlock = await inDegreeLock.acquire();
                    const targetDegree = inDegree.get(child) - 1;
                    inDegree.set(child, targetDegree);
                    unlock();
                    if (targetDegree === 0) {
                        processQueue.push(child);
                        return processNext();
                    } else {
                        return Promise.resolve();
                    }
                })());
            }

            // 等待所有 Promise 完成
            await Promise.all(promises);
        }
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
    // 将未计算但在焦点路径的数据打印出来
    for (const nodeValue of focusSet) {
        renderNode(ctx, nodeMap.get(nodeValue));
    }
    return ctx;
}


async function buildBean(connections, env, ctx, node, queryParam) {
    try {
        console.log("ctx = " + JSON5.stringify(ctx));
        console.log("node = " + JSON5.stringify(node));
        // 为bean建立空context数据
        ctx[node.value] = {};
        // 执行retriever部分逻辑
        for (const retriever of node.inference.retrievers) {
            const connection = connections[env + ":" + retriever.datasource];
            const query = formatString(retriever.query, ctx, "");
            const params =  (retriever.queryParams || []).map(p => evalString(p, ctx));
            const [results, metadata] = await connection.query(query, params);
            console.log(`${query}(${params}) => ${JSON5.stringify(results)}`);
            ctx[node.value].queryResult = results;
            for (const sinker of retriever.sink) {
                const result = evalString(sinker.if, ctx);
                if (sinker.if == null || result === true) {
                    evalString(sinker.statement, ctx);
                }
            }
        }
        // 计算节点是否成功
        if (node.inference.success != null) {
            ctx[node.value].success = evalString(node.inference.success, ctx);
        } else {
            ctx[node.value].success = true;
        }
        if (node.type === 'input') {
            if(ctx[node.value].choices == null) {
                ctx[node.value].choices = []
            }
            // 入参覆盖query选项
            if (queryParam[node.value] != null) {
                ctx[node.value].selection = queryParam[node.value];
                if(ctx[node.value].choices.find(e => e.value === ctx[node.value].selection) == null) {
                    ctx[node.value].choices.push({
                        "value": ctx[node.value].selection,
                        "label": "?",
                    })
                }
            }
        } else {
            ctx[node.value].component = evalObject(node.inference.component, ctx);
        }
        // 执行drawer 部分逻辑
        ctx[node.value].queryResult = null;
        renderNode(ctx, node);
        return ctx[node.value].success;
    } catch (error) {
        error.message = `执行节点${node.value}异常` + error.message;
        console.log(error.message);
        throw error;
    }
}

function renderNode(ctx, node) {
    if (node.circuitBreaker === true && ctx[node.value]?.success !== true) {
        // 断路器启动且节点不生效 =》 跳过rendering
        return;
    }
    if (node.type === 'input') {
        ctx.nodes.push({
            id: node.value,
            type: 'input',
            data: {
                ...ctx[node.value],
                label: node.label,
                locked: false
            },
            position: {
                x: 0,
                y: 0,
            },
        })
    } else {
        ctx.nodes.push({
            id: node.value,
            type: 'output',
            data: {
                ...ctx[node.value],
                label: node.label,
            },
            position: {
                x: 0,
                y: 0,
            },
        })
    }

    node.parents.forEach(parentValue => ctx.edges.push({
        id: `e${parentValue}-${node.value}`,
        source: parentValue,
        target: node.value,
        animated: !ctx[node.value]?.success || !ctx[parentValue]?.success,
        markerEnd: "arrow"
    }))
}
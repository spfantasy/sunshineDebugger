import express from 'express';
import fs from 'fs';
import path from "path";
import {fileURLToPath} from "url";
import JSON5 from 'json5';
import hasCycle from './graphCheck.js';
import graphWalk from "./graphWalk.js";
import mysql from 'mysql2/promise';

// 获取 __filename 和 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT;

const sqlEngines = {};
const targetEnvJson = path.resolve(__dirname, '../config/targetEnv.json5');
const targetEnv = JSON5.parse(fs.readFileSync(targetEnvJson, 'utf8'));
for(const env of targetEnv) {
    for(const datasource of env.datasource || []) {
        const key = env.value+":"+datasource.value;
        const params = datasource.params;
        console.log(`初始化数据库${key}：${params.username}@${params.host}:${params.port}-${params.database}`);
        sqlEngines[key] = await mysql.createConnection({
            database: params.database,
            user: params.username,
            password: params.password,
            host: params.host,
            port: params.port,
        });
    }
}

app.use(express.json());

app.post('/api/json', async (req, res) => {
    try {
        const jsonEntity = path.resolve(__dirname, `../config/${req.body.filename}`);
        const jsonObject = JSON5.parse(fs.readFileSync(jsonEntity, 'utf8'));
        res.json(jsonObject);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/query', async (req, res) => {
    try {
        const [results, metadata] = await sqlEngines[req.body.env+":"+req.body.datasource].query(req.body.query);
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const flowMetaJson = path.resolve(__dirname, '../config/flowMeta.json5');
const flowMeta = JSON5.parse(fs.readFileSync(flowMetaJson, 'utf8'));
if (hasCycle(flowMeta)) {
    throw "flowMeta.json5 加载异常：数据成环";
}
app.post('/api/renderFlow', async(req,res) => {
    try {
        const newContext = await graphWalk(sqlEngines, req.body.env, JSON5.parse(req.body.query), flowMeta);
        res.json(newContext);
    } catch (error) {
        console.log(`server.js ${error.message}`)
        res.status(500).json({ message: error.message, name: error.name, stack: error.stack});
    }
});

app.get('/health_check', async (req, res) => {
    try {
        res.status(200).json();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
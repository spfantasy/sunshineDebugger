import express from 'express';
import { Sequelize } from 'sequelize';
import fs from 'fs';
import path from "path";
import {fileURLToPath} from "url";

// 获取 __filename 和 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT;

const targetEnv = path.resolve(__dirname, '../config/targetEnv.json');
const targetEnvJson = JSON.parse(fs.readFileSync(targetEnv, 'utf8'));

const targetAccount = path.resolve(__dirname, '../config/targetAccount.json');
const targetAccountFrontend = JSON.parse(fs.readFileSync(targetAccount, 'utf8'));

const sequelize = new Sequelize('testdb', 'root', 'rootpassword', {
    host: 'localhost',
    dialect: 'mysql',
    port: 3306
});

app.use(express.json());

// 右上角环境api
const targetEnvJsonFrontend = targetEnvJson.map(item => {
    return {
        key: item.key,
        name: item.name
    };
});
app.get('/api/target_env', async (req, res) => {
    try {
        res.json(targetEnvJsonFrontend);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// 右上角登陆信息api
app.get('/api/target_account', async (req, res) => {
    try {
        res.json(targetAccountFrontend);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/data', async (req, res) => {
    try {
        const [results, metadata] = await sequelize.query("SELECT * FROM my_table");
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/health_check', async (req, res) => {
    try {
        res.status(200).json();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
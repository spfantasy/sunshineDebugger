import express from 'express';
import { Sequelize } from 'sequelize';
import fs from 'fs';
import path from "path";
import {fileURLToPath} from "url";
import JSON5 from 'json5';

// 获取 __filename 和 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT;

const sequelize = new Sequelize('testdb', 'root', 'rootpassword', {
    host: 'localhost',
    dialect: 'mysql',
    port: 3306
});

app.use(express.json());

app.post('/api/json', async (req, res) => {
    try {
        const jsonEntity = path.resolve(__dirname, `../config/${req.body.filename}`);
        const jsonObject = JSON5.parse(fs.readFileSync(jsonEntity, 'utf8'));
        res.json(jsonObject);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/query', async (req, res) => {
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
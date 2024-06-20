import express from 'express';
import { Sequelize } from 'sequelize';

const app = express();
const port = 3000;

const sequelize = new Sequelize('testdb', 'root', 'rootpassword', {
    host: 'localhost',
    dialect: 'mysql',
    port: 3306
});

app.use(express.json());

app.get('/api/data', async (req, res) => {
    try {
        const [results, metadata] = await sequelize.query("SELECT * FROM my_table");
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
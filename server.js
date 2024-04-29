import express from 'express';
import { connectDatabase } from './src/db/db.js';
import categoryController from './src/controllers/categoryController.js';
const app = express();
const PORT = 3000;
app.use(express.json());
app.use('/categories', categoryController);
connectDatabase()
    .then(() => {
        // routes
        app.get("/", (req, res) => res.send("Ok!"));

        app.listen(PORT, () => console.log(`Server is running... http://localhost:${PORT}`));
    })
    .catch(() => {
        console.error('Erro ao conectar ao banco de dados:', error);
        process.exit(1);
    });
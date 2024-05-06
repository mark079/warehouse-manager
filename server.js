import express from 'express';
import { connectDatabase } from './src/db/db.js';
import categoryController from './src/controllers/categoryController.js';
import receiverController from './src/controllers/receiverController.js';
import productsController from './src/controllers/productController.js';
import transictionsController from './src/controllers/transactionController.js';
import transictionDetails from './src/controllers/transactionDetailsController.js';
const app = express();
const PORT = 3000;
app.use(express.json());
app.get("/", (req, res) => res.send("Ok!"));
app.use('/categories', categoryController);
app.use('/receivers', receiverController);
app.use('/products', productsController);
app.use('/transictions', transictionsController);
app.use('/transictions_details', transictionDetails);
connectDatabase()
    .then(() => {
        // routes

        app.listen(PORT, () => console.log(`Server is running... http://localhost:${PORT}`));
    })
    .catch(() => {
        console.error('Erro ao conectar ao banco de dados:', error);
        process.exit(1);
    });
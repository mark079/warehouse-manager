import express from 'express';
import { connectDatabase } from '../db/db.js';
const router = express.Router();
router.get('/', async (req, res) => {
    const db = await connectDatabase();
    try {
        const transactionDetails = await db.all("SELECT * FROM transaction_details WHERE flagN = 1;");
        return res.json(transactionDetails);
    } catch (error) {
        return res.status(500).json({ error: error });
    } finally {
        await db.close();
    }
});
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const db = await connectDatabase();
    try {
        const transactionDetail = await db.get("SELECT * FROM transaction_details WHERE id = ? AND flagN = 1", [id]);
        if (!transactionDetail) {
            return res.status(404).json({ error: "Transação detalhada não encontrada!" });
        }
        return res.json(transactionDetail);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    } finally {
        await db.close();
    }
});
router.post('/', async (req, res) => {
    const { productId, quantity, transactionId } = req.body;
    const db = await connectDatabase();
    const errors = {};
    try {
        if (!productId) {
            errors.productId = 'Id do produto é um campo obrigatório';
        } else {
            const prodctExists = await db.get(`SELECT * FROM products WHERE id = ${productId} AND flagN = 1;`);
            if (!prodctExists) {
                errors.productId = 'Produto não encontrado';
            }
        }

        if (!transactionId) {
            errors.transactionId = 'Id da transação é um campo obrigatório';
        } else {
            const transactionExists = await db.get(`SELECT * FROM transactions WHERE id = ${transactionId} AND flagN = 1;`);
            if (!transactionExists) {
                errors.transactionId = 'Transação não encontrada';
            }
        }
        if (!quantity) {
            errors.quantity = 'Quantidade é um campo obrigatório';
        }
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ errors });
        }
        const result = await db.run(`INSERT INTO transaction_details (productId, transactionId, quantity) VALUES (${productId}, ${transactionId}, ${quantity});`);
        return res.json({ message: 'Detalhes de transação adicionada com sucesso', ID: result.lastID });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    } finally {
        await db.close();
    }
});
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { productId, transactionId, quantity } = req.body;
    const db = await connectDatabase();
    try {
        const errors = {};
        if (!productId) {
            errors.productId = 'Id do produto é um campo obrigatório';
        } else {
            const prodctExists = await db.get(`SELECT * FROM products WHERE id = ${productId} AND flagN = 1;`);
            if (!prodctExists) {
                errors.productId = 'Produto não encontrado';
            }
        }
        if (!transactionId) {
            errors.transactionId = 'Id da transação é um campo obrigatório';
        } else {
            const transactionExists = await db.get(`SELECT * FROM transactions WHERE id = ${transactionId} AND flagN = 1;`);
            if (!transactionExists) {
                errors.transactionId = 'Transação não encontrada';
            }
        }
        if (!quantity) {
            errors.quantity = 'Quantidade é um campo obrigatório';
        }
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ errors });
        }
        await db.run(`UPDATE transaction_details SET productId = '${productId}', transactionId = ${transactionId}, quantity = ${quantity} WHERE id = ${id} AND flagN = 1;`);
        return res.json({ message: 'Detalhes de transação atualizados com sucesso' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    } finally {
        await db.close();
    }
});
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const db = await connectDatabase();
    try {
        const transactionDetailExistis = await db.get(`SELECT * FROM transaction_details WHERE id = ${id} AND flagN = 1;`);
        if (!transactionDetailExistis) {
            return res.status(400).json({ error: "Transação detalhada não encontrada" });
        }
        await db.run(`UPDATE transaction_details SET flagN = 0 WHERE id = ${id}`);
        return res.json({ message: 'Detalhe de transação removida com sucesso' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
export default router;

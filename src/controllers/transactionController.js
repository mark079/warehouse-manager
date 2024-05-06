import express from 'express';
import { connectDatabase } from '../db/db.js';
const router = express.Router();

router.get('/', async (req, res) => {
    const db = await connectDatabase();
    try {
        const transactions = await db.all("SELECT * FROM transactions WHERE flagN = 1;");
        return res.json(transactions);
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
        const transaction = await db.get(`SELECT * FROM transactions WHERE id = ${id} AND flagN = 1;`);
        if (!transaction) {
            return res.status(404).json({ error: "Transação não encontrada!" });
        }
        return res.json(transaction);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    } finally {
        await db.close();
    }
});

router.post('/', async (req, res) => {
    const { type, receiverId, letter, observation } = req.body;
    const db = await connectDatabase();
    try {
        const errors = {};
        if (!type) {
            errors.type = "Tipo é um campo obrigatório"
        } else {
            if (type !== "exit" && type !== "entry") {
                errors.type = "Tipo inválido";
            }

        }
        if (!receiverId) {
            errors.receiverId = 'Recebedor é um campo obrigatório';
        } else {
            const existingReceiver = await db.get(`SELECT * FROM receivers WHERE id = ${receiverId} AND flagN = 1;`);
            if (!existingReceiver) {
                errors.receiverId = 'Recebedor não encontrado';
            }
        }
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ errors });
        }
        // return res.send(`INSERT INTO transactions (type, receiverId, letter, observation) VALUES ('${type}', ${receiverId}, ${letter || "''"}, ${observation || "''"});`);
        const result = await db.run(`INSERT INTO transactions (type, receiverId, letter, observation) VALUES ('${type}', ${receiverId}, '${letter || ""}', '${observation || ""}');`);
        return res.json({ message: 'Transação adicionada com sucesso', ID: result.lastID });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    } finally {
        await db.close();
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { type, receiverId, letter, observation } = req.body;
    const db = await connectDatabase();
    try {
        const errors = {};
        if (!type) {
            errors.type = "Tipo é um campo obrigatório"
        } else {
            if (type !== "exit" && type !== "entry") {
                errors.type = "Tipo inválido";
            }

        }
        const transactionExist = await db.get(`SELECT * FROM transactions WHERE id = ${id} AND flagN = 1;`);
        if (!transactionExist) {
            errors.transactionId = 'Transação não encontrada';
        }
        if (!receiverId) {
            errors.receiverId = 'Recebedor é um campo obrigatório';
        } else {
            const existingReceiver = await db.get(`SELECT * FROM receivers WHERE id = ${receiverId} AND flagN = 1;`);
            if (!existingReceiver) {
                errors.receiverId = 'Recebedor não encontrado';
            }
        }
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ errors });
        }
        await db.run(`UPDATE transactions SET type = '${type}', receiverId = ${receiverId}, letter = ${letter}, observation = '${observation || ""}' WHERE id = ${id} AND flagN = 1;`);
        return res.json({ message: 'Transação atualizada com sucesso' });
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
        const existingtransaction = await db.get(`SELECT * FROM transactions WHERE id = ${id} AND flagN = 1;`);
        if (!existingtransaction) {
            return res.status(400).json({ error: "Transação não encontrada" });
        }
        await db.run(`UPDATE transactions SET flagN = 0 WHERE id = ${id}`);
        return res.json({ message: 'Transação removida com sucesso' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

export default router;

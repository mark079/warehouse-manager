import express from 'express';
import { connectDatabase } from '../db/db.js';
const router = express.Router();
router.get('/', async (req, res) => {
    const db = await connectDatabase();
    try {
        const receivers = await db.all("SELECT * FROM receivers WHERE flagN = 1;");
        return res.json(receivers);
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
        const receiver = await db.get("SELECT * FROM receivers WHERE id = ? AND flagN = 1", [id]);
        if (!receiver) {
            return res.status(404).json({ error: "Recebedor não encontrada!" });
        }
        return res.json(receiver);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    } finally {
        await db.close();
    }
});

router.post('/', async (req, res) => {
    const { name, description } = req.body;
    const db = await connectDatabase();
    const errors = {};
    if (!name) {
        errors.name = "Nome é um campo obrigatório";
    }
    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ errors });
    }
    try {
        const result = await db.run(`INSERT INTO receivers (name${description ? ', description' : ''}) VALUES (${"'" + name + "'"}${description ? ", '" + description + "'" : ''});`);
        return res.json({ message: 'Recebedor adicionado com sucesso', ID: result.lastID });
    } catch (error) {
        return res.status(500).json({ error: error.message })
    } finally {
        db.close();
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    const db = await connectDatabase();
    try {
        const existingReceiver = await db.get("SELECT * FROM receivers WHERE id = ? AND flagN = ?", [id, 1]);
        if (!existingReceiver) {
            return res.status(404).json({ error: 'Recebedor não encontrado.' });
        }
        const errors = {};
        if (!name) {
            errors.name = ["Nome é um campo obrigatório"];
        }

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ errors });
        }

        await db.run(`UPDATE receivers SET name = ${"'" + name + "'"}${description ? ', description = ' + "'" + description + "'" : ''} WHERE id = ${id} AND flagN = 1;`);

        return res.json({ message: 'Recebedor atualizado com sucesso' });
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
        await db.run("UPDATE receivers SET flagN = 0 WHERE id = ?", [id]);
        return res.json({ message: 'Recebedor removida com sucesso' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

export default router;
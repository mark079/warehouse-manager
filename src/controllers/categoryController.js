import express from 'express';
import { connectDatabase } from '../db/db.js';
const router = express.Router();

router.get('/', async (req, res) => {
    const db = await connectDatabase();
    try {
        const rows = await db.all("SELECT * FROM categories where flagN = 1");
        return res.json(rows);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    } finally {
        await db.close();
    }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const db = await connectDatabase();
    try {
        const category = await db.get("SELECT * FROM categories WHERE id = ? AND flagN = 1", [id]);
        if (!category) {
            return res.status(404).json({ error: "Categoria não encontrada!" });
        }
        return res.json(category);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    } finally {
        await db.close();
    }
});

router.post('/', async (req, res) => {

    const { name, description } = req.body;
    const errors = [];
    if (!name) {
        errors.push("Nome é um campo obrigatório");
    }
    if (!description) {
        errors.push("Descrição é um campo obrigatório");
    }
    if (errors.length >= 1) {
        return res.status(400).json({ errors });
    }
    const db = await connectDatabase();
    try {
        // Inserindo os dados no banco de dados
        const result = await db.run("INSERT INTO categories (name, description) VALUES (?, ?)", [name, description]);
        return res.json({ message: 'Categoria adicionada com sucesso', ID: result.lastID });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    } finally {
        await db.close();
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    const db = await connectDatabase();
    try {
        const existingCategory = await db.get("SELECT * FROM categories WHERE id = ? AND flagN = ?", [id, 1]);
        if (!existingCategory) {
            return res.status(404).json({ error: 'Categoria não encontrada.' });
        }
        const errors = {};
        if (!name) {
            errors.name = ["Nome é um campo obrigatório"];
        }
        if (!description) {
            errors.description = ["Descrição é um campo obrigatório"];
        }

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ errors });
        }
        await db.run("UPDATE categories SET name = ?, description = ? WHERE id = ?", [name, description, id]);

        return res.json({ message: 'Categoria atualizada com sucesso' });
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
        await db.run("UPDATE categories SET flagN = 0 WHERE id = ?", [id]);
        return res.json({ message: 'Categoria removida com sucesso' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

export default router;
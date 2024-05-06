import express from 'express';
import { connectDatabase } from '../db/db.js';
const router = express.Router();

router.get('/', async (req, res) => {
    const db = await connectDatabase();
    try {
        const products = await db.all("SELECT * FROM products WHERE flagN = 1;");
        return res.json({ products });
    } catch (error) {
        return res.json({ error: error.message });
    } finally {
        await db.close();
    }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const db = await connectDatabase();
    try {
        const product = await db.get(`SELECT * FROM products WHERE id = ${id} AND flagN = 1;`);
        if (!product) {
            return res.status(404).json({ error: "Produto não encontrado!" });
        }
        return res.json(product);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    } finally {
        await db.close();
    }
});

router.post('/', async (req, res) => {
    const { name, description, quantity, categoryId } = req.body;
    const db = await connectDatabase();
    try {
        const errors = {};
        if (!categoryId) {
            errors.categoryId = 'Id Categoria é um campo obrigatório.';
        } else {
            const exixtingCategory = await db.get(`SELECT * FROM categories WHERE id = ${categoryId} AND flagN = 1;`);
            if (!exixtingCategory) {
                errors.categoryId = 'Categoria não encontrada.';
            }
        }
        if (!name) {
            errors.name = 'Nome é um campo obrigatório';
        }
        if (!quantity) {
            errors.quantity = 'Quantidade é um campo obrigatório';
        }
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ errors });
        }
        const result = await db.run(`INSERT INTO products (name, description, quantity, categoryId) VALUES ('${name}', '${description || ''}', ${quantity}, ${categoryId});`);
        return res.json({ message: 'Produto adicionado com sucesso', ID: result.lastID });
    } catch (error) {
        return res.status(500).json({ error: error.message })
    } finally {
        await db.close();
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, quantity, categoryId } = req.body;
    const db = await connectDatabase();
    try {
        const errors = {};
        const exixtingProduct = await db.get(`SELECT * FROM products WHERE id = ${id} AND flagN = 1;`);

        if (!exixtingProduct) {
            errors.id = 'Produto não encontrado.';
        }
        if (!categoryId) {
            errors.categoryId = 'Id Categoria é um campo obrigatório';
        } else {
            const exixtingCategory = await db.get(`SELECT * FROM categories WHERE id = ${categoryId} AND flagN = 1;`);
            if (!exixtingCategory) {
                errors.categoryId = 'Categoria não encontrada';
            }
        }
        if (!name) {
            errors.name = 'Nome é um campo obrigatório';
        }
        if (!quantity) {
            errors.quantity = 'Quantidade é um campo obrigatório';
        }
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ errors });
        }
        await db.run(`UPDATE products SET name = '${name}', description = '${description || ""}', quantity = ${quantity}, categoryId = ${categoryId} WHERE id = ${id} AND flagN = 1;`);
        return res.json({ message: 'Produto atualizadp com sucesso' });
    } catch (error) {
        return res.status(500).json({ error: error.message })
    } finally {
        await db.close();
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const db = await connectDatabase();
    try {
        const existingProduct = await db.get(`SELECT * FROM products WHERE id = ${id} AND flagN = 1;`);
        if (!existingProduct) {
            return res.status(400).json({ error: "Produto não encontrado" });
        }
        await db.run(`UPDATE products SET flagN = 0 WHERE id = ${id}`);
        return res.json({ message: 'Produto removido com sucesso' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

export default router;
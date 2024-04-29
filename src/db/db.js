import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const dbFile = 'database.sqlite';

export async function connectDatabase() {
    try {
        const db = await open({
            filename: dbFile,
            driver: sqlite3.Database
        });

        // await db.exec("DROP TABLE IF EXISTS categories;");
        // await db.exec("DROP TABLE IF EXISTS products;");
        // await db.exec("DROP TABLE IF EXISTS receivers;");
        // await db.exec("DROP TABLE IF EXISTS transactions;");
        // await db.exec("DROP TABLE IF EXISTS transaction_details;");

        await db.exec("CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, description TEXT, flagN BOOLEAN DEFAULT 1);");
        await db.exec("CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, description TEXT, quantity INTEGER CHECK(quantity >= 0) NOT NULL, categoryId INTEGER, flagN BOOLEAN DEFAULT 1, FOREIGN KEY (categoryId) REFERENCES categories(id));");
        await db.exec("CREATE TABLE IF NOT EXISTS receivers (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, description TEXT, flagN BOOLEAN DEFAULT 1);");
        await db.exec("CREATE TABLE IF NOT EXISTS transactions (id INTEGER PRIMARY KEY AUTOINCREMENT, type TEXT CHECK(type IN ('entry', 'exit')), flagN BOOLEAN DEFAULT 1, datetime DATETIME DEFAULT CURRENT_TIMESTAMP);");
        await db.exec("CREATE TABLE IF NOT EXISTS transaction_details (id INTEGER PRIMARY KEY AUTOINCREMENT, productId INTEGER, quantity INTEGER CHECK(quantity > 0), transactionId INTEGER, flagN BOOLEAN DEFAULT 1, FOREIGN KEY (productId) REFERENCES products(id), FOREIGN KEY (transactionId) REFERENCES transactions(id));");

        console.log("Conexão com o banco de dados estabelecida");
        return db;
    } catch (error) {
        console.error('Erro ao conectar ao banco de dados:', error);
        throw error;
    }
}
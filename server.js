import express from 'express';
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// Switching to the Direct Database connection port (5432) 
const pool = new Pool({
    user: 'postgres.fxscigkpgtzcrelhcemn',
    host: 'aws-1-ap-northeast-1.pooler.supabase.com', // IPv4 Connection Pooler Host
    database: 'postgres',
    password: 'Manikanta@043028', // This MUST be your Database Password
    port: 6543, // Connection Pooler Port
    ssl: {
        rejectUnauthorized: false
    },
    connectionTimeoutMillis: 10000 // Stops the server from freezing if it drops
});

// Middleware Configuration
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Force Express to serve static files from the client/dist directory explicitly
app.use(express.static(path.join(__dirname, 'client', 'dist')));

// =========================================================
// 1. API DATA ROUTES (MUST BE FIRST)
// =========================================================

app.get('/api/products', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error("DATABASE FETCH CRASH LOG:", err.message);
        res.status(500).json({ error: 'Database connection failed', message: err.message });
    }
});

app.post('/api/products', async (req, res) => {
    const { id, name, price } = req.body;
    try {
        const query = `
            INSERT INTO products (id, name, price)
            VALUES ($1, $2, $3)
            ON CONFLICT (id)
            DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price
            RETURNING *;
        `;
        const result = await pool.query(query, [id, name, price]);
        res.status(200).json({ message: 'Success', product: result.rows[0] });
    } catch (err) {
        console.error("DATABASE WRITE CRASH LOG:", err.message);
        res.status(500).json({ error: 'Database save failed', message: err.message });
    }
});

// =========================================================
// 2. FRONTEND ROUTING (MUST BE LAST)
// =========================================================
app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Srinivasa Traders server running on port ${PORT}`);
});
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(bodyParser.json());

// Serve static files from the 'client' directory
app.use(express.static(path.join(__dirname, 'client')));

// Database Connection
// Zeabur automatically injects these environment variables for MySQL services
const dbConfig = {
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'apk_data',
    port: process.env.MYSQL_PORT || 3306
};

let pool;

async function initDB() {
    try {
        // Create connection pool
        pool = mysql.createPool(dbConfig);

        // Test connection
        const connection = await pool.getConnection();
        console.log('Connected to MySQL database!');

        // Initialize Table if not exists
        await connection.query(`
            CREATE TABLE IF NOT EXISTS device_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                device_id VARCHAR(255) NOT NULL,
                ip_address VARCHAR(255),
                log_message TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Table initialized.');
        connection.release();
    } catch (err) {
        console.error('Database connection failed:', err.message);
        console.log('Running in "No Database" mode. Data will not be persisted.');
    }
}

// Initialize DB on start
initDB();

// API: Login (Simulated)
app.post('/api/login', (req, res) => {
    const { phone, code } = req.body;

    // Simulate +86 11-digit phone validation
    const phoneRegex = /^1[3-9]\d{9}$/;

    if (!phone || !phoneRegex.test(phone)) {
        return res.status(400).json({ success: false, message: '请输入有效的11位中国手机号' });
    }

    // In a real app, you would verify the code via SMS. 
    // Here we accept any code that is 4 digits.
    if (!code || code.length !== 4) {
        return res.status(400).json({ success: false, message: '验证码错误' });
    }

    res.json({ success: true, message: '登录成功', token: 'mock-jwt-token-123456' });
});

// API: Log Data (App uploads data here)
app.post('/api/log-data', async (req, res) => {
    const { deviceId, message } = req.body;
    const ip = req.ip;

    console.log(`Received log from ${deviceId}: ${message}`);

    if (pool) {
        try {
            await pool.query(
                'INSERT INTO device_logs (device_id, ip_address, log_message) VALUES (?, ?, ?)',
                [deviceId, ip, message]
            );
            res.json({ success: true, saved: true });
        } catch (err) {
            console.error('Insert failed:', err);
            res.status(500).json({ success: false, error: 'Database error' });
        }
    } else {
        // No DB mode
        res.json({ success: true, saved: false, warning: 'No database connection' });
    }
});

// API: Get Recent Logs (For Dashboard)
app.get('/api/logs', async (req, res) => {
    if (pool) {
        try {
            const [rows] = await pool.query('SELECT * FROM device_logs ORDER BY created_at DESC LIMIT 10');
            res.json({ success: true, data: rows });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    } else {
        res.json({
            success: true, data: [
                { id: 0, device_id: 'mock-device-01', ip_address: '127.0.0.1', log_message: 'Database not connected (Mock Data)', created_at: new Date() }
            ]
        });
    }
});

// Fallback for SPA (if we had client-side routing, but we don't really here)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

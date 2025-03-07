const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');

const app = express();
app.use(express.json());

// ✅ Improved CORS configuration
app.use(cors({
  origin: "http://192.168.49.2:3000", // Change to frontend URL in production
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));

const server = http.createServer(app);

// ✅ WebSocket should listen on `/ws`
const wss = new WebSocket.Server({ noServer: true });
server.on('upgrade', (request, socket, head) => {
  if (request.url === '/ws') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

const pool = new Pool({
  user: 'neondb_owner',
  host: 'ep-odd-darkness-a4vnxb1b-pooler.us-east-1.aws.neon.tech',
  database: 'neondb',
  password: 'npg_bRUADE7BJkm5',
  ssl: { rejectUnauthorized: false },
  port: 5432,
});

// ✅ WebSocket handling
wss.on('connection', (ws) => {
  console.log('WebSocket Client Connected');

  ws.on('message', (message) => {
    console.log('Received:', message);
    ws.send('Message received');
  });

  ws.on('close', () => {
    console.log('WebSocket Client Disconnected');
  });
});

// ✅ Improved error handling
app.get('/api/data', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sample_table');
    res.json(result.rows);
  } catch (err) {
    console.error('Database Error:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/data', async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO sample_table (name) VALUES ($1) RETURNING *',
      [name]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Database Insert Error:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start server with WebSocket support
server.listen(5000, () => console.log('Backend running on port 5000'));


const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Endpoint de prueba
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'CORRIENDO BACKEND EN JS'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend listening on http://localhost:${PORT}`);
});
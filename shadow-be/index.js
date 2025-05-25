const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();
const cors = require('cors');
const path = require('path');
const testMiddleware = require('./middlewares');
const routes = require('./routes');

const app = express();

// middlewares
app.use(cors());
app.use(testMiddleware);
app.use('/api/v1', routes);

// Serve static files from /mock-json under the /cdn route
app.use('/cdn', express.static(path.join(__dirname, 'public', 'cdn')));

app.get('/', (req, res) => res.status(200).json({message:"Welcome boss"}))

const PORT = process.env.PORT || 3210;
app.listen(PORT, () => console.log(`App running on ${PORT}`))

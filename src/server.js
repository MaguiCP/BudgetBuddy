import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';  // Importando o CORS
import userRoutes from './routes/userRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';

dotenv.config();

const app = express();

// Configuração CORS
app.use(cors({ origin: 'http://localhost:3000' }));

app.use(bodyParser.json());

// API Routes
app.use('/api/user', userRoutes);
app.use('/api/transaction', transactionRoutes);

// Frontend
const __dirname = path.resolve();

app.use(express.static(path.join(__dirname, 'frontend/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/build/index.html'));
});

export default app;

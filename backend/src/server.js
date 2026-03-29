import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';  // Importando o CORS
import userRoutes from './routes/userRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app = express();

const defaultLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

// Configuração CORS
app.use(cors({ origin: 'http://localhost:3000' }));

app.use(bodyParser.json());

// Limiter global para todas as requisições
app.use(defaultLimiter);

// API Routes
app.use('/api/user', userRoutes);
app.use('/api/transaction', transactionRoutes);

// Frontend
app.use(express.static(path.join(__dirname, 'frontend/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/build/index.html'));
});

export default app;

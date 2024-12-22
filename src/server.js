import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import path from 'path';
import userRoutes from './routes/userRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';

dotenv.config();

const app = express();
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
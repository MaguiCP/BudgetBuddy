import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';

dotenv.config();

const app = express();
app.use(bodyParser.json());

app.use('/api/user', userRoutes);
app.use('/api/transaction', transactionRoutes);

export default app;
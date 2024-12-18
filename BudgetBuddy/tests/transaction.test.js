import request from 'supertest';
import app from '../src/server';

describe('Transaction API', () => {
  
  // Teste de criação de transação
  it('should create a new transaction', async () => {
    const transactionData = {
      description: 'Groceries',
      amount: -100,
      category: 'food'
    };

    const response = await request(app)
      .post('/api/transaction')
      .send(transactionData);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Transaction created successfully!');
    expect(response.body.transaction).toHaveProperty('id');
    expect(response.body.transaction.description).toBe(transactionData.description);
  });

  // Teste de obtenção de todas as transações
  it('should get all transactions', async () => {
    const response = await request(app)
      .get('/api/transaction')
      .query({ page: 1, limit: 10, sort: 'date' });

    expect(response.status).toBe(200);
    expect(response.body.transactions).toBeInstanceOf(Array);
    expect(response.body.transactions.length).toBeGreaterThan(0);
  });
});

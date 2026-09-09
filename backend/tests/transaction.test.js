import request from 'supertest';
import app from '../src/server';
import http from 'http';

describe('Transaction API', () => {
  let server;
  let token;
  let transactionId;
  let secondTransactionId;

  beforeAll(async () => {
    server = http.createServer(app);

    await new Promise((resolve) => server.listen(resolve));

    const registerResponse = await request(server)
      .post('/api/user')
      .send({
        username: 'transactionuser',
        password: 'transactionpassword',
        email: 'transactionuser@example.com',
      });

    expect(registerResponse.status).toBe(201);

    const loginResponse = await request(server)
      .post('/api/user/login')
      .send({
        username: 'transactionuser',
        password: 'transactionpassword',
      });

    expect(loginResponse.status).toBe(200);

    token = loginResponse.body.token;
    expect(token).toBeDefined();
  });

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  it('should create a new transaction', async () => {
    const response = await request(server)
      .post('/api/transaction')
      .set('Authorization', `Bearer ${token}`)
      .send({
        description: 'Groceries',
        amount: -100,
        category: 'groceries',
        date: '2026-08-15',
      });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Transaction created successfully!');
    expect(response.body.transaction).toHaveProperty('id');
    expect(response.body.transaction.description).toBe('Groceries');

    transactionId = response.body.transaction.id;
  });

  it('should reject transaction creation without authentication', async () => {
    const response = await request(server)
      .post('/api/transaction')
      .send({
        description: 'Unauthorized',
        amount: -50,
        category: 'groceries',
      });

    expect(response.status).toBe(401);
  });

  it('should reject invalid transaction data', async () => {
    const response = await request(server)
      .post('/api/transaction')
      .set('Authorization', `Bearer ${token}`)
      .send({
        description: '',
        amount: 'invalid',
        category: '',
      });

    expect(response.status).toBe(400);
  });

  it('should create an income transaction', async () => {
    const response = await request(server)
      .post('/api/transaction')
      .set('Authorization', `Bearer ${token}`)
      .send({
        description: 'Salary',
        amount: 2500,
        category: 'salary',
        date: '2026-08-01',
      });

    expect(response.status).toBe(201);
    expect(response.body.transaction.amount).toBe(2500);

    secondTransactionId = response.body.transaction.id;
  });

  it('should get all transactions', async () => {
    const response = await request(server)
      .get('/api/transaction')
      .set('Authorization', `Bearer ${token}`)
      .query({
        page: 1,
        limit: 10,
        sort: 'date',
      });

    expect(response.status).toBe(200);
    expect(response.body.transactions).toBeInstanceOf(Array);
    expect(response.body.totalTransactions).toBeGreaterThanOrEqual(2);
    expect(response.body.page).toBe(1);
    expect(response.body.limit).toBe(10);
  });

  it('should filter transactions by month, category and type', async () => {
    const response = await request(server)
      .get('/api/transaction')
      .set('Authorization', `Bearer ${token}`)
      .query({
        month: '2026-08',
        category: 'GROCERIES',
        type: 'expense',
      });

    expect(response.status).toBe(200);
    expect(response.body.transactions).toBeInstanceOf(Array);
    expect(response.body.transactions.length).toBeGreaterThan(0);
  });

  it('should sort transactions by amount', async () => {
    const response = await request(server)
      .get('/api/transaction')
      .set('Authorization', `Bearer ${token}`)
      .query({
        page: 1,
        limit: 10,
        sort: 'amount',
      });

    expect(response.status).toBe(200);
    expect(response.body.transactions).toBeInstanceOf(Array);
  });

  it('should use the default limit when an invalid limit is provided', async () => {
    const response = await request(server)
      .get('/api/transaction')
      .set('Authorization', `Bearer ${token}`)
      .query({
        page: 1,
        limit: 0,
      });

    expect(response.status).toBe(200);
    expect(response.body.limit).toBe(10);
  });

  it('should get a transaction by id', async () => {
    const response = await request(server)
      .get(`/api/transaction/${transactionId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.transaction.id).toBe(transactionId);
    expect(response.body.transaction.description).toBe('Groceries');
  });

  it('should return 404 for a transaction that does not exist', async () => {
    const response = await request(server)
      .get('/api/transaction/999999')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Transaction not found.');
  });

  it('should update a transaction', async () => {
    const response = await request(server)
      .put(`/api/transaction/${transactionId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        description: 'Updated groceries',
        amount: -150,
        category: 'groceries',
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Transaction updated successfully!');
    expect(response.body.transaction.description).toBe('Updated groceries');
    expect(response.body.transaction.amount).toBe(-150);
  });

  it('should return 404 when updating a transaction that does not exist', async () => {
    const response = await request(server)
      .put('/api/transaction/999999')
      .set('Authorization', `Bearer ${token}`)
      .send({
        description: 'Updated',
        amount: -50,
        category: 'groceries',
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Transaction not found.');
  });

  it('should reject invalid transaction id when updating', async () => {
    const response = await request(server)
      .put('/api/transaction/invalid-id')
      .set('Authorization', `Bearer ${token}`)
      .send({
        description: 'Updated',
        amount: -50,
        category: 'groceries',
      });

    expect(response.status).toBe(400);
  });

  it('should delete a transaction', async () => {
    const response = await request(server)
      .delete(`/api/transaction/${transactionId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Transaction deleted successfully!');
  });

  it('should return 404 when deleting a transaction that does not exist', async () => {
    const response = await request(server)
      .delete('/api/transaction/999999')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Transaction not found.');
  });

  it('should reject transaction deletion without authentication', async () => {
    const response = await request(server)
      .delete(`/api/transaction/${secondTransactionId}`);

    expect(response.status).toBe(401);
  });

  it('should get filtered transactions by type', async () => {
    const response = await request(server)
      .get('/api/transaction/category')
      .set('Authorization', `Bearer ${token}`)
      .query({
        type: 'income',
      });

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });

  it('should get filtered transactions by category', async () => {
    const response = await request(server)
      .get('/api/transaction/category')
      .set('Authorization', `Bearer ${token}`)
      .query({
        category: 'salary',
      });

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });

  it('should get transaction summary', async () => {
    await request(server)
      .post('/api/transaction')
      .set('Authorization', `Bearer ${token}`)
      .send({
        description: 'Summary expense',
        amount: -150,
        category: 'groceries',
        date: '2026-08-20',
      });

    const response = await request(server)
      .get('/api/transaction/summary')
      .set('Authorization', `Bearer ${token}`)
      .query({
        month: '2026-08',
      });

    expect(response.status).toBe(200);
    expect(response.body.month).toBe('2026-08');
    expect(response.body.totalIncome).toBeGreaterThanOrEqual(2500);
    expect(response.body.totalExpenses).toBeGreaterThanOrEqual(150);
    expect(response.body.balance).toBeDefined();
    expect(response.body.byCategory).toBeInstanceOf(Array);
    expect(response.body.recentTransactions).toBeInstanceOf(Array);
  });

  it('should get transaction summary filtered by category', async () => {
    const response = await request(server)
      .get('/api/transaction/summary')
      .set('Authorization', `Bearer ${token}`)
      .query({
        month: '2026-08',
        category: 'groceries',
      });

    expect(response.status).toBe(200);
    expect(response.body.totalExpenses).toBeGreaterThanOrEqual(150);
    expect(response.body.totalIncome).toBe(0);
  });

  it('should get transactions by category', async () => {
    const response = await request(server)
      .get('/api/transaction/by-category')
      .set('Authorization', `Bearer ${token}`)
      .query({
        month: '2026-08',
      });

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });

  it('should get a monthly transaction report', async () => {
    const response = await request(server)
      .get('/api/transaction/report')
      .set('Authorization', `Bearer ${token}`)
      .query({
        interval: 'monthly',
      });

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });

  it('should get a daily transaction report', async () => {
    const response = await request(server)
      .get('/api/transaction/report')
      .set('Authorization', `Bearer ${token}`)
      .query({
        interval: 'daily',
      });

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });

  it('should get a weekly transaction report', async () => {
    const response = await request(server)
      .get('/api/transaction/report')
      .set('Authorization', `Bearer ${token}`)
      .query({
        interval: 'weekly',
      });

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });

  it('should use monthly report interval by default', async () => {
    const response = await request(server)
      .get('/api/transaction/report')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });
});
import request from 'supertest';
import app from '../src/server';
import http from 'http';

describe('Transaction API', () => {
  let server;
  let token;
  let transactionId;

  beforeAll(async () => {
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(resolve));

    const registerResponse = await request(server)
      .post('/api/user')
      .send({
        username: 'testuser',
        password: 'testpassword',
        email: 'testuser@example.com',
      });

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body.message).toBe('User registered successfully!');

    const loginResponse = await request(server)
      .post('/api/user/login')
      .send({
        username: 'testuser',
        password: 'testpassword',
      });

    token = loginResponse.body.token;
    expect(token).toBeDefined();
  });

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  it('should create a new transaction', async () => {
    const transactionData = {
      description: 'Groceries',
      amount: -100,
      category: 'groceries',
    };

    const response = await request(server)
      .post('/api/transaction')
      .set('Authorization', `Bearer ${token}`)
      .send(transactionData);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Transaction created successfully!');
    expect(response.body.transaction).toHaveProperty('id');
    expect(response.body.transaction.description).toBe(transactionData.description);

    transactionId = response.body.transaction.id;
  });

  it('should get all transactions', async () => {
    const response = await request(server)
      .get('/api/transaction')
      .set('Authorization', `Bearer ${token}`)
      .query({ page: 1, limit: 10, sort: 'date' });

    expect(response.status).toBe(200);
    expect(response.body.transactions).toBeInstanceOf(Array);
    expect(response.body.transactions.length).toBeGreaterThan(0);
  });

  it('should update a transaction', async () => {
    const transactionData = {
      description: 'Updated groceries',
      amount: -150,
      category: 'groceries',
    };

    const response = await request(server)
      .put(`/api/transaction/${transactionId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(transactionData);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Transaction updated successfully!');
    expect(response.body.transaction.description).toBe(transactionData.description);
  });

  it('should delete a transaction', async () => {

    const response = await request(server)
      .delete(`/api/transaction/${transactionId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Transaction deleted successfully!');
  });
});
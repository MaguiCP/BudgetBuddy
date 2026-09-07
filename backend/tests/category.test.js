import request from 'supertest';
import app from '../src/server';
import http from 'http';

describe('Category and financial summary API', () => {
  let server;
  let token;

  beforeAll(async () => {
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(resolve));

    const registerResponse = await request(server)
      .post('/api/user')
      .send({
        username: 'catuser',
        password: 'catpassword',
        email: 'catuser@example.com',
        role: 'user',
      });

    expect(registerResponse.status).toBe(201);

    const loginResponse = await request(server)
      .post('/api/user/login')
      .send({
        username: 'catuser',
        password: 'catpassword',
      });

    expect(loginResponse.status).toBe(200);
    token = loginResponse.body.token;
  });

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  it('should create a category', async () => {
    const response = await request(server)
      .post('/api/category')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Food',
        type: 'expense',
      });

    expect(response.status).toBe(201);
    expect(response.body.category).toHaveProperty('id');
    expect(response.body.category.name).toBe('Food');
  });

  it('should create income and expense transactions and calculate summary by category', async () => {
    await request(server)
      .post('/api/transaction')
      .set('Authorization', `Bearer ${token}`)
      .send({
        description: 'Monthly salary',
        amount: 2500,
        category: 'salary',
        date: '2026-08-01',
      });

    await request(server)
      .post('/api/transaction')
      .set('Authorization', `Bearer ${token}`)
      .send({
        description: 'Groceries',
        amount: -120,
        category: 'Food',
        date: '2026-08-15',
      });

    const summaryResponse = await request(server)
      .get('/api/transaction/summary')
      .set('Authorization', `Bearer ${token}`)
      .query({ month: '2026-08' });

    expect(summaryResponse.status).toBe(200);
    expect(summaryResponse.body.totalIncome).toBeGreaterThanOrEqual(2500);
    expect(summaryResponse.body.totalExpenses).toBeGreaterThanOrEqual(120);
    expect(summaryResponse.body.balance).toBeGreaterThanOrEqual(2380);

    const byCategoryResponse = await request(server)
      .get('/api/transaction/by-category')
      .set('Authorization', `Bearer ${token}`)
      .query({ month: '2026-08' });

    expect(byCategoryResponse.status).toBe(200);
    expect(Array.isArray(byCategoryResponse.body)).toBe(true);

    const filteredByMonthAndCategoryResponse = await request(server)
      .get('/api/transaction')
      .set('Authorization', `Bearer ${token}`)
      .query({ month: '2026-08', category: 'Food' });

    expect(filteredByMonthAndCategoryResponse.status).toBe(200);
    expect(filteredByMonthAndCategoryResponse.body.transactions).toBeInstanceOf(Array);

    const monthlySummaryResponse = await request(server)
      .get('/api/transaction/summary')
      .set('Authorization', `Bearer ${token}`)
      .query({ month: '2026-08', category: 'Food' });

    expect(monthlySummaryResponse.status).toBe(200);
    expect(monthlySummaryResponse.body.totalExpenses).toBeGreaterThanOrEqual(120);
    expect(monthlySummaryResponse.body.totalIncome).toBe(0);

    const fullMonthlySummaryResponse = await request(server)
      .get('/api/transaction/summary')
      .set('Authorization', `Bearer ${token}`)
      .query({ month: '2026-08' });

    expect(fullMonthlySummaryResponse.status).toBe(200);
    expect(fullMonthlySummaryResponse.body.totalIncome).toBeGreaterThanOrEqual(2500);
  });
});

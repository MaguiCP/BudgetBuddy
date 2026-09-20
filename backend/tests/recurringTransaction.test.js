import request from 'supertest';
import app from '../src/server';
import http from 'http';

describe('Recurring transactions API', () => {
  let server;
  let token;
  let recurringId;

  beforeAll(async () => {
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(resolve));
    await request(server).post('/api/user').send({ username: 'recurringuser', password: 'recurringpassword', email: 'recurring@example.com' });
    const login = await request(server).post('/api/user/login').send({ username: 'recurringuser', password: 'recurringpassword' });
    token = login.body.token;
  });

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  it('creates and generates a recurring expense', async () => {
    const create = await request(server)
      .post('/api/recurring-transaction')
      .set('Authorization', `Bearer ${token}`)
      .send({ description: 'Rent', amount: 700, type: 'expense', category: 'Housing', nextDate: '2026-10-01' });

    expect(create.status).toBe(201);
    recurringId = create.body.recurringTransaction.id;

    const generate = await request(server)
      .post(`/api/recurring-transaction/${recurringId}/generate`)
      .set('Authorization', `Bearer ${token}`);

    expect(generate.status).toBe(201);
    expect(generate.body.recurringTransaction.nextDate).toContain('2026-11');

    const transactions = await request(server)
      .get('/api/transaction')
      .set('Authorization', `Bearer ${token}`);
    expect(transactions.body.transactions).toEqual(expect.arrayContaining([
      expect.objectContaining({ description: 'Rent', amount: -700, type: 'expense' }),
    ]));
  });
});

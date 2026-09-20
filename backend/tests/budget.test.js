import request from 'supertest';
import app from '../src/server';
import http from 'http';

describe('Budget API', () => {
  let server;
  let token;
  let budgetId;

  beforeAll(async () => {
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(resolve));

    await request(server)
      .post('/api/user')
      .send({
        username: 'budgetuser',
        password: 'budgetpassword',
        email: 'budgetuser@example.com',
      });

    const loginResponse = await request(server)
      .post('/api/user/login')
      .send({ username: 'budgetuser', password: 'budgetpassword' });

    token = loginResponse.body.token;
  });

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  it('creates and lists a monthly budget', async () => {
    const createResponse = await request(server)
      .post('/api/budget')
      .set('Authorization', `Bearer ${token}`)
      .send({ month: '2026-09', category: 'Food', amount: 400 });

    expect(createResponse.status).toBe(201);
    budgetId = createResponse.body.budget.id;

    const listResponse = await request(server)
      .get('/api/budget')
      .set('Authorization', `Bearer ${token}`)
      .query({ month: '2026-09' });

    expect(listResponse.status).toBe(200);
    expect(listResponse.body).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: budgetId, category: 'Food', amount: 400 }),
    ]));
  });

  it('rejects a duplicate budget for the same month and category', async () => {
    const response = await request(server)
      .post('/api/budget')
      .set('Authorization', `Bearer ${token}`)
      .send({ month: '2026-09', category: 'Food', amount: 500 });

    expect(response.status).toBe(409);
    expect(response.body.error).toMatch(/already exists/i);
  });

  it('updates and deletes a monthly budget', async () => {
    const updateResponse = await request(server)
      .put(`/api/budget/${budgetId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ month: '2026-09', category: 'Food', amount: 450 });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.budget.amount).toBe(450);

    const deleteResponse = await request(server)
      .delete(`/api/budget/${budgetId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(deleteResponse.status).toBe(200);
  });
});

import request from 'supertest';
import app from '../src/server';
import http from 'http';

describe('Savings goals API', () => {
  let server;
  let token;
  let goalId;

  beforeAll(async () => {
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(resolve));
    await request(server).post('/api/user').send({ username: 'goaluser', password: 'goalpassword', email: 'goaluser@example.com' });
    const login = await request(server).post('/api/user/login').send({ username: 'goaluser', password: 'goalpassword' });
    token = login.body.token;
  });

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  it('creates, updates, lists and deletes a savings goal', async () => {
    const create = await request(server)
      .post('/api/savings-goal')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Emergency fund', targetAmount: 1000, currentAmount: 200, deadline: '2027-01-01' });

    expect(create.status).toBe(201);
    goalId = create.body.goal.id;
    expect(create.body.goal.currentAmount).toBe(200);

    const list = await request(server).get('/api/savings-goal').set('Authorization', `Bearer ${token}`);
    expect(list.status).toBe(200);
    expect(list.body).toEqual(expect.arrayContaining([expect.objectContaining({ id: goalId, name: 'Emergency fund' })]));

    const update = await request(server)
      .put(`/api/savings-goal/${goalId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Emergency fund', targetAmount: 1000, currentAmount: 500, deadline: '2027-01-01' });
    expect(update.status).toBe(200);
    expect(update.body.goal.currentAmount).toBe(500);

    const remove = await request(server).delete(`/api/savings-goal/${goalId}`).set('Authorization', `Bearer ${token}`);
    expect(remove.status).toBe(200);
  });
});

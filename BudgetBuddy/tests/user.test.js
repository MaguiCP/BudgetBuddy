import request from 'supertest';
import app from '../src/server';
import http from 'http';

describe('User API', () => {
  let server;
  let token;
  let userId;

  beforeAll(async () => {
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(resolve));

    const loginResponse = await request(server)
      .post('/api/user/login')
      .send({
        username: 'testuser',
        password: 'testpassword',
      });

    token = loginResponse.body.token;
  });

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  it('Should register a new User', async () => {
    const userData = {
      username: "testuser",
      password: "testpassword",
      email: "test@example.com",
      role: "user"
    };

    const response = await request(server)
      .post('/api/user')
      .send(userData);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('User registered successfully!');
    userId = response.body.user.id;
  });

  it('Should login a User and return a token', async () => {
    const loginData = {
      username: 'testuser',
      password: 'testpassword',
    };

    const response = await request(server)
      .post('/api/user/login')
      .send(loginData);

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
  });

  it('Should get User details', async () => {

    const response = await request(server)
      .get(`/api/user/${userId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.users).toBeDefined();
  });

  it('Should delete a User', async () => {

    const response = await request(server)
      .delete(`/api/user/${userId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('User deleted successfully!');
  });
});

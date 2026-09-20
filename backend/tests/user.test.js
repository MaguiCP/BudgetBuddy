import request from 'supertest';

import app from '../src/server';

import http from 'http';

describe('User API', () => {
  let server;
  let token;
  let secondaryUserId;

  beforeAll(async () => {
    server = http.createServer(app);

    await new Promise((resolve) => server.listen(resolve));

    const registerResponse = await request(server)
      .post('/api/user')
      .send({
        username: 'testuser',
        password: 'testpassword',
        email: 'testuser@example.com',
        role: 'user',
      });

    expect(registerResponse.status).toBe(201);

    const loginResponse = await request(server)
      .post('/api/user/login')
      .send({
        username: 'testuser',
        password: 'testpassword',
      });

    expect(loginResponse.status).toBe(200);

    token = loginResponse.body.token;
  });

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  it('should register a new user', async () => {
    const response = await request(server)
      .post('/api/user')
      .send({
        username: 'testuserregister',
        password: 'testpassword',
        email: 'testregister@example.com',
        role: 'user',
      });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('User registered successfully!');
    expect(response.body.user).toHaveProperty('id');
    expect(response.body.user.username).toBe('testuserregister');
    expect(response.body.user.email).toBe('testregister@example.com');
    expect(response.body.user.password).toBeUndefined();

    secondaryUserId = response.body.user.id;
  });

  it('should reject duplicate usernames', async () => {
    const response = await request(server)
      .post('/api/user')
      .send({
        username: 'testuser',
        password: 'anotherpassword',
        email: 'another@example.com',
        role: 'user',
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Username already exists.');
  });

  it('should reject invalid registration data', async () => {
    const response = await request(server)
      .post('/api/user')
      .send({
        username: '',
        password: '',
        email: 'invalid-email',
        role: 'invalid-role',
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  it('should login a user and return a token', async () => {
    const response = await request(server)
      .post('/api/user/login')
      .send({
        username: 'testuser',
        password: 'testpassword',
      });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
  });

  it('should reject login with an unknown username', async () => {
    const response = await request(server)
      .post('/api/user/login')
      .send({
        username: 'unknownuser',
        password: 'testpassword',
      });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Invalid credentials.');
  });

  it('should reject login with an incorrect password', async () => {
    const response = await request(server)
      .post('/api/user/login')
      .send({
        username: 'testuser',
        password: 'wrongpassword',
      });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Invalid credentials.');
  });

  it('should reject invalid login data', async () => {
    const response = await request(server)
      .post('/api/user/login')
      .send({
        username: '',
        password: '',
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  it('should reject access to users without authentication', async () => {
    const response = await request(server)
      .get('/api/user');

    expect(response.status).toBe(401);
  });

  it('should get all users', async () => {
    const response = await request(server)
      .get('/api/user')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThanOrEqual(2);

    response.body.forEach((user) => {
      expect(user.password).toBeUndefined();
    });
  });

  it('should get user details', async () => {
    const response = await request(server)
      .get(`/api/user/${secondaryUserId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.user).toBeDefined();
    expect(response.body.user.id).toBe(secondaryUserId);
    expect(response.body.user.username).toBe('testuserregister');
    expect(response.body.user.password).toBeUndefined();
  });

  it('should reject getting a user with an invalid id', async () => {
    const response = await request(server)
      .get('/api/user/invalid-id')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  it('should return 404 when getting a user that does not exist', async () => {
    const response = await request(server)
      .get('/api/user/999999')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('User not found.');
  });

  it('should update user details', async () => {
    const response = await request(server)
      .put(`/api/user/${secondaryUserId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        username: 'updateduser',
        email: 'updated@example.com',
        role: 'user',
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('User updated successfully!');
    expect(response.body.user).toBeDefined();
    expect(response.body.user.id).toBe(secondaryUserId);
    expect(response.body.user.username).toBe('updateduser');
    expect(response.body.user.email).toBe('updated@example.com');
    expect(response.body.user.password).toBeUndefined();
  });

  it('should update the user password', async () => {
    const response = await request(server)
      .put(`/api/user/${secondaryUserId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        password: 'newpassword',
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('User updated successfully!');
    expect(response.body.user.password).toBeUndefined();

    const loginResponse = await request(server)
      .post('/api/user/login')
      .send({
        username: 'updateduser',
        password: 'newpassword',
      });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.token).toBeDefined();
  });

  it('should reject updating a user with an invalid id', async () => {
    const response = await request(server)
      .put('/api/user/invalid-id')
      .set('Authorization', `Bearer ${token}`)
      .send({
        email: 'invalid@example.com',
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  it('should return 404 when updating a user that does not exist', async () => {
    const response = await request(server)
      .put('/api/user/999999')
      .set('Authorization', `Bearer ${token}`)
      .send({
        email: 'notfound@example.com',
      });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('User not found.');
  });

  it('should reject updating a user without authentication', async () => {
    const response = await request(server)
      .put(`/api/user/${secondaryUserId}`)
      .send({
        email: 'unauthorized@example.com',
      });

    expect(response.status).toBe(401);
  });

  it('should delete a user', async () => {
    const response = await request(server)
      .delete(`/api/user/${secondaryUserId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('User deleted successfully!');
  });

  it('should return 404 when deleting a user that does not exist', async () => {
    const response = await request(server)
      .delete(`/api/user/${secondaryUserId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('User not found.');
  });

  it('should reject deleting a user with an invalid id', async () => {
    const response = await request(server)
      .delete('/api/user/invalid-id')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  it('should reject deleting a user without authentication', async () => {
    const response = await request(server)
      .delete('/api/user/999999');

    expect(response.status).toBe(401);
  });
});
import request from 'supertest';
import app from '../src/server';
import http from 'http';

describe('Category API', () => {
  let server;
  let token;
  let categoryId;

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

    categoryId = response.body.category.id;
  });

  it('should reject category creation without authentication', async () => {
    const response = await request(server)
      .post('/api/category')
      .send({
        name: 'Unauthorized',
        type: 'expense',
      });

    expect(response.status).toBe(401);
  });

  it('should reject duplicate category names', async () => {
    const response = await request(server)
      .post('/api/category')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Food',
        type: 'expense',
      });

    expect(response.status).toBe(409);
    expect(response.body.error).toBe('Category already exists.');
  });

  it('should reject invalid category data', async () => {
    const response = await request(server)
      .post('/api/category')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: '',
        type: 'invalid',
      });

    expect(response.status).toBe(400);
  });

  it('should get all categories', async () => {
    const response = await request(server)
      .get('/api/category')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should get a category by id', async () => {
    const response = await request(server)
      .get(`/api/category/${categoryId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(categoryId);
    expect(response.body.name).toBe('Food');
  });

  it('should return 404 when category does not exist', async () => {
    const response = await request(server)
      .get('/api/category/999999')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Category not found.');
  });

  it('should reject invalid category id', async () => {
    const response = await request(server)
      .get('/api/category/invalid-id')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
  });

  it('should update a category', async () => {
    const response = await request(server)
      .put(`/api/category/${categoryId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Groceries',
        type: 'expense',
      });

    expect(response.status).toBe(200);
    expect(response.body.category.name).toBe('Groceries');
  });

  it('should return 404 when updating a category that does not exist', async () => {
    const response = await request(server)
      .put('/api/category/999999')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Updated',
        type: 'expense',
      });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Category not found.');
  });

  it('should reject invalid category data when updating', async () => {
    const response = await request(server)
      .put(`/api/category/${categoryId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: '',
        type: 'invalid',
      });

    expect(response.status).toBe(400);
  });

  it('should delete a category', async () => {
    const response = await request(server)
      .delete(`/api/category/${categoryId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Category deleted successfully!');
  });

  it('should return 404 when deleting a category that does not exist', async () => {
    const response = await request(server)
      .delete('/api/category/999999')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Category not found.');
  });

  it('should reject invalid category id when deleting', async () => {
    const response = await request(server)
      .delete('/api/category/invalid-id')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
  });
});
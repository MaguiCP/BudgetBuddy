import request from 'supertest';
import app from '../src/server';
import http from 'http';

describe('Own profile API', () => {
  let server;
  let token;
  let userId;

  beforeAll(async () => {
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(resolve));

    const register = await request(server)
      .post('/api/user')
      .send({ username: 'profileuser', password: 'profilepassword', email: 'profile@example.com' });

    userId = register.body.user.id;

    const login = await request(server)
      .post('/api/user/login')
      .send({ username: 'profileuser', password: 'profilepassword' });

    token = login.body.token;
  });

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  it('gets and updates the authenticated user profile', async () => {
    const profile = await request(server)
      .get('/api/user/me')
      .set('Authorization', `Bearer ${token}`);

    expect(profile.status).toBe(200);
    expect(profile.body.user).toEqual(expect.objectContaining({ id: userId, username: 'profileuser' }));
    expect(profile.body.user.password).toBeUndefined();

    const update = await request(server)
      .put('/api/user/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ username: 'updatedprofile', email: 'updated@example.com' });

    expect(update.status).toBe(200);
    expect(update.body.user.username).toBe('updatedprofile');
    expect(update.body.token).toBeDefined();
  });

  it('requires the current password before changing password', async () => {
    const invalid = await request(server)
      .put('/api/user/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ username: 'updatedprofile', email: 'updated@example.com', currentPassword: 'wrong-password', password: 'newpassword' });

    expect(invalid.status).toBe(400);
    expect(invalid.body.error).toBe('Current password is incorrect.');

    const valid = await request(server)
      .put('/api/user/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ username: 'updatedprofile', email: 'updated@example.com', currentPassword: 'profilepassword', password: 'newpassword' });

    expect(valid.status).toBe(200);
    expect(valid.body.token).toBeDefined();
  });
});

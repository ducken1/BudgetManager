const request = require('supertest');
const mongoose = require('mongoose');
const { app, server } = require('../server'); // Import server
const Budget = require('../models/Budget');
const User = require('../models/User');

// Mock environment variables
require('dotenv').config({ path: '.env.test' });

// Setup database connection for tests
beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await User.deleteMany();
  await Budget.deleteMany();
});

afterAll(async () => {
  await mongoose.connection.close();
  server.close();
});

// Variables to store test data
let userToken;

describe('Budget Routes', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/budgets/register')
      .send({ username: 'testuser', password: 'testpass', email: 'test@example.com' });

      console.log(res.body)

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    userToken = res.body.token;
  });

  it('should log in an existing user', async () => {
    const res = await request(app)
      .post('/budgets/login')
      .send({ username: 'testuser', password: 'testpass' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should fetch budgets for a user', async () => {
    const res = await request(app)
      .get('/budgets')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should add a new budget', async () => {
    const res = await request(app)
      .post('/budgets/add')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Groceries', amount: 100, type: 'Expense' });
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('Budget added successfully');
  });

  it('should update an existing budget', async () => {
    const budget = await Budget.findOne({ name: 'Groceries' });
    const res = await request(app)
      .put(`/budgets/${budget._id}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Groceries', amount: 150, type: 'Expense' });
    expect(res.statusCode).toBe(200);
    expect(res.body.amount).toBe(150);
  });

  it('should delete a budget', async () => {
    const budget = await Budget.findOne({ name: 'Groceries' });
    const res = await request(app)
      .delete(`/budgets/${budget._id}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Budget deleted successfully');
  });

  it('should set a user limit', async () => {
    const res = await request(app)
      .post('/budgets/setLimit')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ limit: 1000 });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Limit set successfully');
    expect(res.body.limit).toBe(1000);
  });

  it('should get the user limit', async () => {
    const res = await request(app)
      .get('/budgets/getLimit')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.limit).toBe(1000);
  });

  it('should verify user existence', async () => {
    const res = await request(app)
      .get('/budgets/verify-user')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('User exists');
  });

  it('should recover a password', async () => {
    const res = await request(app)
      .post('/budgets/recover-password')
      .send({ email: 'test@example.com' });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Recovery email sent successfully');
  });
});

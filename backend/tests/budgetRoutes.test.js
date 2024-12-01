const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server'); // Import the backend Express app
const jwt = require('jsonwebtoken');

// Mock a user and generate a token for authentication
const mockUser = { id: 'mockUserId', username: 'testuser' };
const token = jwt.sign(mockUser, process.env.JWT_SECRET || 'test-secret', { expiresIn: '1h' });

jest.mock('mongoose', () => require('jest-mongoose-mock'));

// Helper function to make authenticated requests
const authenticatedRequest = (method, url, data = {}) => {
  return request(app)
    [method](url)
    .set('Authorization', `Bearer ${token}`)
    .send(data);
};

describe('Budget API', () => {
  let createdBudgetId; // Store a budget ID to use across tests

  // Connect to the database before running tests (if necessary)
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/testdb', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }
  });

  // Close database connection after all tests
  afterAll(async () => {
    await mongoose.connection.close();
  });

  // 1. Fetch budgets
  it('fetches all budgets successfully', async () => {
    const res = await authenticatedRequest('get', '/budgets');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    if (res.body.length > 0) {
      expect(res.body[0]).toHaveProperty('name');
      expect(res.body[0]).toHaveProperty('amount');
      expect(res.body[0]).toHaveProperty('type');
    }
  });

  // 2. Add a new budget
  it('adds a new budget successfully', async () => {
    const newBudget = { name: 'Groceries', amount: 100, type: 'necessity' };
    const res = await authenticatedRequest('post', '/budgets/add', newBudget);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id'); // Ensure response has an ID
    expect(res.body).toHaveProperty('name', 'Groceries');
    createdBudgetId = res.body._id;
  });

  // 3. Fetch a budget by ID
  it('fetches a single budget by ID', async () => {
    const res = await authenticatedRequest('get', `/budgets/${createdBudgetId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('_id', createdBudgetId);
    expect(res.body).toHaveProperty('name', 'Groceries');
  });

  // 4. Prevent adding budget with missing fields
  it('returns an error when adding a budget with missing fields', async () => {
    const invalidBudget = { name: 'Invalid Budget' };
    const res = await authenticatedRequest('post', '/budgets/add', invalidBudget);
    expect(res.statusCode).toBe(400); // Bad Request
    expect(res.body).toHaveProperty('error');
  });

  // 5. Update an existing budget
  it('updates an existing budget successfully', async () => {
    const updatedBudget = { name: 'Updated Budget', amount: 150, type: 'luxury' };
    const res = await authenticatedRequest('put', `/budgets/${createdBudgetId}`, updatedBudget);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('name', 'Updated Budget');
  });

  // 6. Handle update with invalid ID
  it('returns an error when updating a budget with an invalid ID', async () => {
    const updatedBudget = { name: 'Invalid Update', amount: 150, type: 'luxury' };
    const res = await authenticatedRequest('put', '/budgets/invalid-id', updatedBudget);
    expect(res.statusCode).toBe(404); // Not Found
    expect(res.body).toHaveProperty('error', 'Budget not found');
  });

  // 7. Delete a budget
  it('deletes a budget successfully', async () => {
    const res = await authenticatedRequest('delete', `/budgets/${createdBudgetId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Budget deleted successfully');
  });

  // 8. Handle delete with invalid ID
  it('returns an error when deleting a budget with an invalid ID', async () => {
    const res = await authenticatedRequest('delete', '/budgets/invalid-id');
    expect(res.statusCode).toBe(404); // Not Found
    expect(res.body).toHaveProperty('error', 'Budget not found');
  });

  // 9. Set a budget limit
  it('sets a budget limit successfully', async () => {
    const limitData = { limit: 500 };
    const res = await authenticatedRequest('post', '/budgets/setLimit', limitData);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('limit', 500);
  });

  // 10. Handle invalid limit input
  it('returns an error for invalid limit input', async () => {
    const invalidLimitData = { limit: -100 };
    const res = await authenticatedRequest('post', '/budgets/setLimit', invalidLimitData);
    expect(res.statusCode).toBe(400); // Bad Request
    expect(res.body).toHaveProperty('error', 'Invalid limit value');
  });
});

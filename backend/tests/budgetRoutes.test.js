const request = require('supertest');
const app = require('../app'); // Your Express app

describe('Budget API', () => {
  // 1. Fetch budgets
  it('fetches all budgets successfully', async () => {
    const res = await request(app).get('/api/budgets');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true); // Ensure the response is an array
    expect(res.body[0]).toHaveProperty('name'); // Check for required properties
  });

  // 2. Fetch a budget by ID
  it('fetches a single budget by ID', async () => {
    const res = await request(app).get('/api/budgets/1'); // Replace "1" with a valid ID
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('_id', '1'); // Ensure ID matches
  });

  // 3. Add a new budget
  it('adds a new budget successfully', async () => {
    const newBudget = { name: 'Groceries', amount: 100, type: 'necessity' };
    const res = await request(app).post('/api/budgets/add').send(newBudget);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('name', 'Groceries');
  });

  // 4. Prevent adding budget with missing fields
  it('returns an error when adding a budget with missing fields', async () => {
    const invalidBudget = { name: 'Invalid Budget' }; // Missing amount and type
    const res = await request(app).post('/api/budgets/add').send(invalidBudget);
    expect(res.statusCode).toBe(400); // Bad Request
    expect(res.body).toHaveProperty('error');
  });

  // 5. Update an existing budget
  it('updates an existing budget successfully', async () => {
    const updatedBudget = { name: 'Updated Budget', amount: 150, type: 'luxury' };
    const res = await request(app).put('/api/budgets/1').send(updatedBudget); // Replace "1" with a valid ID
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('name', 'Updated Budget');
  });

  // 6. Handle update with invalid ID
  it('returns an error when updating a budget with an invalid ID', async () => {
    const updatedBudget = { name: 'Invalid Update', amount: 150, type: 'luxury' };
    const res = await request(app).put('/api/budgets/invalid-id').send(updatedBudget);
    expect(res.statusCode).toBe(404); // Not Found
    expect(res.body).toHaveProperty('error');
  });

  // 7. Delete a budget
  it('deletes a budget successfully', async () => {
    const res = await request(app).delete('/api/budgets/1'); // Replace "1" with a valid ID
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Budget deleted successfully');
  });

  // 8. Handle delete with invalid ID
  it('returns an error when deleting a budget with an invalid ID', async () => {
    const res = await request(app).delete('/api/budgets/invalid-id');
    expect(res.statusCode).toBe(404); // Not Found
    expect(res.body).toHaveProperty('error');
  });

  // 9. Set a budget limit
  it('sets a budget limit successfully', async () => {
    const limitData = { limit: 500 };
    const res = await request(app).post('/api/budgets/setLimit').send(limitData);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('limit', 500);
  });

  // 10. Handle invalid limit input
  it('returns an error for invalid limit input', async () => {
    const invalidLimitData = { limit: -100 }; // Negative value
    const res = await request(app).post('/api/budgets/setLimit').send(invalidLimitData);
    expect(res.statusCode).toBe(400); // Bad Request
    expect(res.body).toHaveProperty('error', 'Invalid limit value');
  });
});

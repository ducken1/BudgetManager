const assert = require('assert'); // Use Node.js assert module
const sinon = require('sinon');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const express = require('express');
const Budget = require('../models/Budget');
const User = require('../models/User');
const budgetRoutes = require('../routes/budgetRoutes');

// Mock the server setup
const app = express();
app.use(express.json());
app.use('/api/budgets', budgetRoutes);

describe("Budget Routes", () => {
    let sandbox;

    before(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe("POST /register", () => {
        it("should register a new user", async () => {
            const userStub = sandbox.stub(User.prototype, 'save').resolves({});
            const bcryptStub = sandbox.stub(bcrypt, 'hash').resolves("hashedpassword");
            const createTokenStub = sandbox.stub(jwt, 'sign').returns("mockToken");

            const res = await request(app)
                .post('/api/budgets/register')
                .send({ username: 'testuser', password: 'testpassword', email: 'test@example.com' });

            sinon.assert.calledOnce(userStub);
            sinon.assert.calledOnce(bcryptStub);
            sinon.assert.calledOnce(createTokenStub);
            assert.strictEqual(res.status, 201);
            assert.strictEqual(res.body.message, 'User registered successfully');
        });
    });

    describe("POST /login", () => {
        it("should log in an existing user", async () => {
            const userStub = sandbox.stub(User, 'findOne').resolves({ username: 'testuser', password: 'hashedpassword' });
            const bcryptStub = sandbox.stub(bcrypt, 'compare').resolves(true);
            const createTokenStub = sandbox.stub(jwt, 'sign').returns("mockToken");

            const res = await request(app)
                .post('/api/budgets/login')
                .send({ username: 'testuser', password: 'testpassword' });

            sinon.assert.calledOnce(userStub);
            sinon.assert.calledOnce(bcryptStub);
            sinon.assert.calledOnce(createTokenStub);
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.body.message, 'Login successful');
        });
    });

    describe("POST /recover-password", () => {
        it("should send a recovery email", async () => {
            const userStub = sandbox.stub(User, 'findOne').resolves({ email: 'test@example.com' });
            const transporterStub = sandbox.stub(nodemailer, 'createTransport').returns({
                sendMail: (options, callback) => callback(null, { response: 'Email sent' })
            });

            const res = await request(app)
                .post('/api/budgets/recover-password')
                .send({ email: 'test@example.com' });

            sinon.assert.calledOnce(userStub);
            sinon.assert.calledOnce(transporterStub);
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.body.message, 'Recovery email sent successfully');
        });
    });

    describe("POST /add", () => {
        it("should add a new budget", async () => {
            sandbox.stub(Budget.prototype, 'save').resolves({});
            sandbox.stub(jwt, 'verify').callsFake((token, secret, cb) => cb(null, { id: 'userId' }));

            const res = await request(app)
                .post('/api/budgets/add')
                .set('Authorization', 'Bearer mockToken')
                .send({ name: 'Test Budget', amount: 100, type: 'Income' });

            assert.strictEqual(res.status, 201);
            assert.strictEqual(res.body.message, 'Budget added successfully');
        });
    });

    describe("GET /", () => {
        it("should fetch all budgets for a user", async () => {
            sandbox.stub(Budget, 'find').resolves([{ name: 'Test Budget', amount: 100, type: 'Income' }]);
            sandbox.stub(jwt, 'verify').callsFake((token, secret, cb) => cb(null, { id: 'userId' }));

            const res = await request(app)
                .get('/api/budgets')
                .set('Authorization', 'Bearer mockToken');

            assert.strictEqual(res.status, 200);
            assert(Array.isArray(res.body));
            assert.strictEqual(res.body[0].name, 'Test Budget');
        });
    });

    describe("PUT /:id", () => {
        it("should update a budget", async () => {
            sandbox.stub(Budget, 'findByIdAndUpdate').resolves({ name: 'Updated Budget', amount: 200, type: 'Expense' });
            sandbox.stub(jwt, 'verify').callsFake((token, secret, cb) => cb(null, { id: 'userId' }));

            const res = await request(app)
                .put('/api/budgets/123')
                .set('Authorization', 'Bearer mockToken')
                .send({ name: 'Updated Budget', amount: 200, type: 'Expense' });

            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.body.name, 'Updated Budget');
        });
    });

    describe("DELETE /:id", () => {
        it("should delete a budget", async () => {
            sandbox.stub(Budget, 'findByIdAndDelete').resolves({});
            sandbox.stub(jwt, 'verify').callsFake((token, secret, cb) => cb(null, { id: 'userId' }));

            const res = await request(app)
                .delete('/api/budgets/123')
                .set('Authorization', 'Bearer mockToken');

            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.body.message, 'Budget deleted successfully');
        });
    });
});

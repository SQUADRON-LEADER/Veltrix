// =============================================================================
// Veltrix Backend Jest Unit Suite — CI Quality Gate Check
// Author: Aayush | Module 2: CI/CD Pipeline & Automated Testing
// =============================================================================

const request = require('supertest');
const express = require('express');
const mainRouter = require('../routes/main.router');

const app = express();
app.use(express.json());
app.use('/', mainRouter);

describe('Veltrix API Health & Status Endpoints', () => {
  it('GET / should return welcome message', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('Welcome to Veltrix API!');
  });

  it('GET /health should return 200 OK with status UP', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'UP');
    expect(res.body).toHaveProperty('timestamp');
  });
});

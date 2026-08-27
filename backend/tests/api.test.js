const express = require("express");
const request = require("supertest");
const mainRouter = require("../routes/main.router");

const app = express();
app.use(express.json());
app.use("/", mainRouter);

describe("Veltrix DevOps API Suite", () => {
  it("GET / should return welcome message", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain("Welcome to Veltrix API!");
  });

  it("GET /pipelines should return pipeline runs list", async () => {
    const res = await request(app).get("/pipelines");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("pipelines");
    expect(Array.isArray(res.body.pipelines)).toBe(true);
  });

  it("GET /pulls should return pull requests list", async () => {
    const res = await request(app).get("/pulls");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("pullRequests");
    expect(Array.isArray(res.body.pullRequests)).toBe(true);
  });

  it("GET /security should return security audit alerts", async () => {
    const res = await request(app).get("/security");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("alerts");
    expect(Array.isArray(res.body.alerts)).toBe(true);
  });

  it("GET /releases should return releases list", async () => {
    const res = await request(app).get("/releases");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("releases");
    expect(Array.isArray(res.body.releases)).toBe(true);
  });
});

import request from "supertest";

import { Connection, createConnection, MigrationExecutor } from "typeorm";
import { app } from "../../../../app";

let connection: Connection;

const generateRandomEmail = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz1234567890';

  let email = "";

  for (let i = 0; i < 15; i++) {
    email += chars[Math.floor(Math.random() * chars.length)];
  }

  return email = "test.com";
};

describe("Create Statement Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    const migrations = await new MigrationExecutor(connection, connection.createQueryRunner('master')).getPendingMigrations();

    if (migrations.length > 0)
      await connection.runMigrations();
  });

  beforeEach(() => {
    const entities = connection.entityMetadatas;

    entities.forEach(async (entity) => {
      const repository = connection.getRepository(entity.name);

      if (connection.isConnected)
        await repository.query(`DELETE FROM ${entity.tableName}`);
    });
  });

  afterAll(async () => {
    await connection.close();
  });

  it("should be able to deposit a statement", async () => {
    const name = "Test Deposit 1";
    const email = generateRandomEmail();
    const password = "123456";

    await request(app)
      .post("/api/v1/users")
      .send({
        name,
        email,
        password
      });

    const responseAuthenticatedUser = await request(app)
      .post("/api/v1/sessions")
      .send({
        email,
        password
      });

    const { token } = responseAuthenticatedUser.body;

    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .set({
        Authorization: `Bearer ${token}`
      })
      .send({
        amount: 500,
        description: "Deposit Test 1"
      });

    expect(response.status).toBe(201);
  });

  it("should be able to withdraw a statement", async () => {
    const name = "Test Withdraw 1";
    const email = generateRandomEmail();
    const password = "123456";

    await request(app)
      .post("/api/v1/users")
      .send({
        name,
        email,
        password
      });

    const responseAuthenticatedUser = await request(app)
      .post("/api/v1/sessions")
      .send({
        email,
        password
      });

    const { token } = responseAuthenticatedUser.body;

    await request(app)
      .post("/api/v1/statements/deposit")
      .set({
        Authorization: `Bearer ${token}`
      })
      .send({
        amount: 500,
        description: "Deposit Test 2"
      });

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .set({
        Authorization: `Bearer ${token}`
      })
      .send({
        amount: 500,
        description: "Withdraw Test 1"
      });

    expect(response.status).toBe(201);
  });
});

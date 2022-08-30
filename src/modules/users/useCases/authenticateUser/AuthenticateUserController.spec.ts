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

describe("Authenticate User Controller", () => {
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

  it("should be able to authenticate a user", async () => {
    const name = "Test Authenticate 1";
    const email = generateRandomEmail();
    const password = "123456";

    await request(app)
      .post("/api/v1/users")
      .send({
        name,
        email,
        password
      });

    const response = await request(app)
      .post("/api/v1/sessions")
      .send({
        email,
        password
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("user");
    expect(response.body).toHaveProperty("token");
  });

  it("should not be able to authenticate a user with invalid email", async () => {
    const name = "Test Authenticate 2";
    const email = generateRandomEmail();
    const password = "123456";
    const wrongEmail = "test1@test.com";

    await request(app)
      .post("/api/v1/users")
      .send({
        name,
        email,
        password
      });

    const response = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: wrongEmail,
        password
      });

    expect(response.status).toBe(401);
  });

  it("should not be able to authenticate a user with wrong password", async () => {
    const name = "Test Authenticate 3";
    const email = generateRandomEmail();
    const password = "123456";
    const wrongPassword = "123455";

    await request(app)
      .post("/api/v1/users")
      .send({
        name,
        email,
        password
      });

    const response = await request(app)
      .post("/api/v1/sessions")
      .send({
        email,
        password: wrongPassword
      });

    expect(response.status).toBe(401);
  });
});

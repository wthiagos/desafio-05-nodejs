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

describe("Show Profile User Controller", () => {
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

  it("should be able to show a profile from a valid user", async () => {
    const name = "Test Show User Profile 1";
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
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${token}`
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
  });

  it("should not be able to show a profile from a invalid user", async () => {
    const response = await request(app)
      .post("/api/v1/profile")
      .set({
        Authorization: `Bearer`
      });

    expect(response.status).toBe(401);
  });
});

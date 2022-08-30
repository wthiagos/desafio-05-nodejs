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

describe("Get Balance Controller", () => {
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

  it("should be able to get the balance", async () => {
    const name = "Test Get Balance 1";
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

    const responseStatement = await request(app)
      .post("/api/v1/statements/deposit")
      .set({
        Authorization: `Bearer ${token}`
      })
      .send({
        amount: 500,
        description: "Deposit Test 1"
      });

    const response = await request(app)
      .get(`/api/v1/statements/${responseStatement.body.id}`)
      .set({
        Authorization: `Bearer ${token}`
      });

    expect(response.status).toBe(200);
  });
});

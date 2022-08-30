import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { ICreateStatementDTO } from "./ICreateStatementDTO";

let createStatementUseCase: CreateStatementUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe("Create Statement Use Case", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should be able to deposit a statement", async () => {
    const user = await inMemoryUsersRepository
      .create({
        email: "test@test.com",
        name: "Test",
        password: "admin"
      });

    const statement: ICreateStatementDTO = {
      amount: 500,
      description: "Deposit",
      type: OperationType.DEPOSIT,
      user_id: user.id as string
    };

    const response = await createStatementUseCase.execute(statement);

    expect(response).toHaveProperty("id");
  });

  it("should be able to withdraw a statement", async () => {
    const user = await inMemoryUsersRepository
      .create({
        email: "test@test.com",
        name: "Test",
        password: "admin"
      });

    const statement: ICreateStatementDTO = {
      amount: 500,
      description: "Deposit",
      type: OperationType.DEPOSIT,
      user_id: user.id as string
    };

    await createStatementUseCase.execute(statement);

    statement.type = OperationType.WITHDRAW;

    const response = await createStatementUseCase.execute(statement);

    expect(response).toHaveProperty("id");
  });

  it("should not be able to deposit a statement with invalid user", async () => {
    expect(async () => {
      await inMemoryUsersRepository
        .create({
          email: "test@test.com",
          name: "Test",
          password: "admin"
        });

      const statement: ICreateStatementDTO = {
        amount: 500,
        description: "Deposit",
        type: OperationType.DEPOSIT,
        user_id: "123"
      };

      await createStatementUseCase.execute(statement);
    })
      .rejects
      .toBeInstanceOf(AppError);
  });

  it("should not be able to withdraw a statement", async () => {
    expect(async () => {
      const user = await inMemoryUsersRepository
        .create({
          email: "test@test.com",
          name: "Test",
          password: "admin"
        });

      const statement: ICreateStatementDTO = {
        amount: 500,
        description: "Deposit",
        type: OperationType.DEPOSIT,
        user_id: user.id as string
      };

      await createStatementUseCase.execute(statement);

      statement.type = OperationType.WITHDRAW;
      statement.amount = 1000;

      await createStatementUseCase.execute(statement);
    })
      .rejects
      .toBeInstanceOf(AppError);
  });
});

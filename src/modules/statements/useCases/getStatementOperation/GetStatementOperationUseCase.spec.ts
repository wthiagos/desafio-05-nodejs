import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let getStatementOperationUseCase: GetStatementOperationUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe("Get Statement Operation Use Case", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should be able to get the balance", async () => {
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

    const statementCreated = await inMemoryStatementsRepository.create(statement);

    const response = await getStatementOperationUseCase.execute({
      user_id: user.id as string,
      statement_id: statementCreated.id as string
    });

    expect(response).toHaveProperty("id");
  });

  it("should not be able to get the balance with invalid user", async () => {
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

      const statementCreated = await inMemoryStatementsRepository.create(statement);

      await getStatementOperationUseCase.execute({
        user_id: "123",
        statement_id: statementCreated.id as string
      });
    })
      .rejects
      .toBeInstanceOf(AppError);
  });

  it("should not be able to get the balance with invalid statement", async () => {
    expect(async () => {
      const user = await inMemoryUsersRepository
        .create({
          email: "test@test.com",
          name: "Test",
          password: "admin"
        });

      await getStatementOperationUseCase.execute({
        user_id: user.id as string,
        statement_id: "123"
      });
    })
      .rejects
      .toBeInstanceOf(AppError);
  });
});

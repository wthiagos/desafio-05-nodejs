import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let getBalanceUseCase: GetBalanceUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe("get Balance Use Case", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
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

    await inMemoryStatementsRepository.create(statement);

    const response = await getBalanceUseCase.execute({ user_id: user.id as string });

    expect(response.balance).toBe(500);
  });

  it("should not be able to get the balance with invalid user", async () => {
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

      await getBalanceUseCase.execute(statement);
    })
      .rejects
      .toBeInstanceOf(AppError);
  });
});

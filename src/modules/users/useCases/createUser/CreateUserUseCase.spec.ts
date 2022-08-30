import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";

let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("Create User Use Case", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able to create a new user", async () => {
    const name = "Test 1";
    const email = "test1@test.com";
    const password = "123456";

    const response = await createUserUseCase.execute({
      name,
      email,
      password
    });

    expect(response).toHaveProperty("id");
  });

  it("should not be able to create a new user", async () => {
    expect(async () => {
      const name = "Test 1";
      const email = "test1@test.com";
      const password = "123456";

      await createUserUseCase.execute({
        name,
        email,
        password
      });

      await createUserUseCase.execute({
        name,
        email,
        password
      });
    })
      .rejects
      .toBeInstanceOf(AppError);
  });
});

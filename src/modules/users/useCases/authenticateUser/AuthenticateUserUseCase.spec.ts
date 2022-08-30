import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";

let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("Authenticate User Use Case", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able to authenticate a valid user", async () => {
    const name = "Test 1";
    const email = "test1@test.com";
    const password = "123456";

    await createUserUseCase.execute({
      name,
      email,
      password
    });

    const response = await authenticateUserUseCase.execute({
      email,
      password
    });

    expect(response).toHaveProperty("user");
    expect(response).toHaveProperty("token");
  });

  it("should not be able to authenticate a user with invalid email", async () => {
    expect(async () => {
      const name = "Test 2";
      const email = "test2@test.com";
      const password = "123456";
      const invalidEmail = "invalid@test.com";

      await createUserUseCase.execute({
        name,
        email,
        password
      });

      await authenticateUserUseCase.execute({
        email: invalidEmail,
        password
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able to authenticate a user with invalid password", async () => {
    expect(async () => {
      const name = "Test 3";
      const email = "test3@test.com";
      const password = "123456";
      const invalidPassword = "123";

      await createUserUseCase.execute({
        name,
        email,
        password
      });

      await authenticateUserUseCase.execute({
        email,
        password: invalidPassword
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});

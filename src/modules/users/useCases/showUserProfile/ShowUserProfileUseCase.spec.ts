import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let createUserUseCase: CreateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("Show User Profile Use Case", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able to show a profile from a valid user", async () => {
    const name = "Test 1";
    const email = "test1@test.com";
    const password = "123456";

    const user = await createUserUseCase.execute({
      name,
      email,
      password
    });

    const { id: user_id } = user;

    const response = await showUserProfileUseCase.execute(user_id as string);

    expect(response).toHaveProperty("id");
  });

  it("should not be able to show a profile from a invalid user", async () => {
    expect(async () => {
      const name = "Test 1";
      const email = "test1@test.com";
      const password = "123456";

      await createUserUseCase.execute({
        name,
        email,
        password
      });

      await showUserProfileUseCase.execute("132");
    })
      .rejects
      .toBeInstanceOf(AppError);
  });
});

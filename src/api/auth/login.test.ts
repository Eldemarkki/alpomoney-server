import { FastifyInstance } from "fastify";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { build } from "../../app";
import { getUserIdPlugin } from "../../utils/sessionUtils";
import { database } from "../../utils/mockDatabase";
import { UserId } from "../../types/types";

describe("login", () => {
  beforeEach(async () => {
    await database.reset();
  });

  afterEach(async () => {
    await database.reset();
  });

  test("should return 400 bad request if password is missing", async () => {
    const app = await build();
    const response = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: {
        username: "myUsername"
      }
    });

    expect(response.statusCode).toBe(400);
  });

  test("should return 400 bad request if username is missing", async () => {
    const app = await build();
    const response = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: {
        password: "myPassword"
      }
    });

    expect(response.statusCode).toBe(400);
  });

  const login = async (app: FastifyInstance, username = "myUsername", password = "myPassword") => {
    return await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: {
        username,
        password
      }
    });
  };

  test("should return 401 if password is incorrect", async () => {
    await database.signUp("myUsername", "myPassword");
    const app = await build();
    const response = await login(app, "myUsername", "wrongPassword");
    expect(response.statusCode).toBe(401);
  });

  test("should return 401 if user doesn't exist", async () => {
    const app = await build();
    const response = await login(app);
    expect(response.statusCode).toBe(401);
  });

  test("should return 200 and user data if credentials are correct", async () => {
    await database.signUp("myUsername", "myPassword");
    const app = await build();
    const response = await login(app);
    expect(response.statusCode).toBe(200);
  });

  test("when using correct credentials, cookie should be returned", async () => {
    await database.signUp("myUsername", "myPassword");
    const app = await build();
    await app.register(getUserIdPlugin, { prefix: "/session" });

    const loginResponse = await login(app);

    const sessionResponse = await app.inject({
      method: "GET",
      url: "/session",
      headers: {
        cookie: loginResponse.headers["set-cookie"]
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const userId = loginResponse.json().id as UserId;

    expect(sessionResponse.json()).toEqual({ userId });
  });

  test("when using wrong credentials, cookie should not be returned", async () => {
    await database.signUp("myUsername", "myPassword");
    const app = await build();
    await app.register(getUserIdPlugin, { prefix: "/session" });

    const loginResponse = await login(app, "myUsername", "wrongPassword");

    const sessionResponse = await app.inject({
      method: "GET",
      url: "/session",
      headers: {
        cookie: loginResponse.headers["set-cookie"]
      }
    });

    expect(sessionResponse.json()).toEqual({});
  });
});

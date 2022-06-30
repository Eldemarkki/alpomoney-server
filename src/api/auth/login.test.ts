import { FastifyInstance } from "fastify";
import { beforeEach, describe, expect, test } from "vitest";
import { build } from "../../app";
import { getUserIdPlugin } from "../../utils/sessionUtils";
import { database } from "../../utils/mockDatabase";
import { hasKey } from "../../types/types";

describe("login", async () => {
  const app = await build();
  await app.register(getUserIdPlugin, { prefix: "/session" });

  beforeEach(async () => {
    await database.reset();
    await database.signUp("myUsername", "myPassword");
  });

  test("should return 400 bad request if password is missing", async () => {
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
    const response = await login(app, "myUsername", "wrongPassword");
    expect(response.statusCode).toBe(401);
  });

  test("should return 401 if user doesn't exist", async () => {
    const response = await login(app, "shrek", "myPassword");
    expect(response.statusCode).toBe(401);
  });

  test("should return 200 and user data if credentials are correct", async () => {
    const response = await login(app);
    expect(response.statusCode).toBe(200);
  });

  test("when using correct credentials, cookie should be returned", async () => {

    const loginResponse = await login(app);

    const sessionResponse = await app.inject({
      method: "GET",
      url: "/session",
      headers: {
        cookie: loginResponse.headers["set-cookie"]
      }
    });

    const responseData: unknown = loginResponse.json();
    if (!hasKey(responseData, "id") || typeof responseData.id !== "string") {
      throw new Error("This should never happen");
    }

    expect(sessionResponse.json()).toEqual({ userId: responseData.id });
  });

  test("when using wrong credentials, cookie should not be returned", async () => {
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

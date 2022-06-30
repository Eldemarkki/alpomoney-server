import { FastifyInstance } from "fastify";
import { test, expect, afterEach, describe, beforeEach } from "vitest";
import { build } from "../../app";
import { getUserIdPlugin } from "../../utils/sessionUtils";
import { database } from "../../utils/mockDatabase";
import { UserId } from "../../types/types";

describe("signup", () => {
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
      url: "/auth/signup",
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
      url: "/auth/signup",
      payload: {
        password: "myPassword"
      }
    });

    expect(response.statusCode).toBe(400);
  });

  const signUp = async (app: FastifyInstance, username = "myUsername", password = "myPassword") => {
    return await app.inject({
      method: "POST",
      url: "/auth/signup",
      payload: {
        username,
        password
      }
    });
  };

  test("should return username", async () => {
    const response = await signUp(await build());
    expect(response.json()).toMatchObject({ username: "myUsername" });
  });

  test("should return status 200 if user is created", async () => {
    const response = await signUp(await build());
    expect(response.statusCode).toBe(200);
  });

  test("should return status 409 if user already exists", async () => {
    const app = await build();
    await signUp(app);
    const response = await signUp(app);
    expect(response.statusCode).toBe(409);
  });

  test("should return userId in session", async () => {
    const app = await build();
    await app.register(getUserIdPlugin, { prefix: "/session" });
    const signupResponse = await signUp(app);

    const sessionResponse = await app.inject({
      method: "GET",
      url: "/session",
      headers: {
        cookie: signupResponse.headers["set-cookie"]
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const userId = signupResponse.json().id as UserId;

    expect(sessionResponse.json()).toEqual({ userId });
  });

  test("shouldn't return userId in session if user already exists", async () => {
    const app = await build();
    await app.register(getUserIdPlugin, { prefix: "/session" });
    await signUp(app);
    const signupResponse = await signUp(app);

    const sessionResponse = await app.inject({
      method: "GET",
      url: "/session",
      headers: {
        cookie: signupResponse.headers["set-cookie"]
      }
    });

    expect(sessionResponse.json()).toEqual({});
  });
});

import { test, expect, describe, beforeEach } from "vitest";
import { build } from "../../app";
import { getUserIdPlugin } from "../../utils/sessionUtils";
import { database } from "../../utils/mockDatabase";
import { signUp } from "../../api/auth/authTestUtils";

describe("signup", async () => {
  const app = await build();
  await app.register(getUserIdPlugin, { prefix: "/session" });

  beforeEach(async () => {
    await database.reset();
  });

  test("should return 400 bad request if password is missing", async () => {
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
    const response = await app.inject({
      method: "POST",
      url: "/auth/signup",
      payload: {
        password: "myPassword"
      }
    });

    expect(response.statusCode).toBe(400);
  });

  test("should return username", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/auth/signup",
      payload: {
        username: "myUsername",
        password: "myPassword"
      }
    });
    expect(response.json()).toMatchObject({ username: "myUsername" });
    expect(response.statusCode).toBe(200);
  });

  test("should return status 409 if user already exists", async () => {
    await signUp(app, "myUsername", "myPassword");
    const response = await app.inject({
      method: "POST",
      url: "/auth/signup",
      payload: {
        username: "myUsername",
        password: "myPassword"
      }
    });
    expect(response.statusCode).toBe(409);
  });

  test("should return userId in session", async () => {
    const signupResponse = await signUp(app, "myUsername", "myPassword");

    const sessionResponse = await app.inject({
      method: "GET",
      url: "/session",
      headers: {
        cookie: signupResponse.cookie
      }
    });

    expect(sessionResponse.json()).toEqual({ userId: signupResponse.id });
  });

  test("shouldn't return userId in session if user already exists", async () => {
    await app.inject({
      method: "POST",
      url: "/auth/signup",
      payload: {
        username: "myUsername",
        password: "myPassword"
      }
    });
    const signupResponse = await app.inject({
      method: "POST",
      url: "/auth/signup",
      payload: {
        username: "myUsername",
        password: "myPassword"
      }
    });

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

import { beforeEach, describe, expect, Mock, test, vi } from "vitest";
import { build } from "../../../../app";
import { UserId } from "../../../../types/types";
import { signUp } from "../../../auth/authTestUtils";
import { getSingleRoute } from "./getSingleRoute";

describe("getSingleRoute", async () => {
  const app = await build();
  let fn: Mock<[UserId, unknown], number[]>;

  beforeEach(async () => {
    fn = vi.fn();
  });

  await app.register(getSingleRoute(async (userId, id) => {
    fn(userId, id);
    if (id === "1") {
      return {
        id,
        userId,
        price: 3
      };
    }
    return undefined;
  }), { prefix: "/resources" });

  const user = await signUp(app, "user1", "password1");

  test("should return a single object", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/resources/1",
      headers: {
        cookie: user.cookie
      }
    });

    expect(fn).toHaveBeenCalledOnce();
    expect(fn).toHaveBeenCalledWith(user.id, "1");
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      id: "1",
      userId: "0",
      price: 3
    });
  });

  test("non-existing resource should return 404", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/resources/2",
      headers: {
        cookie: user.cookie
      }
    });

    expect(fn).toHaveBeenCalledOnce();
    expect(fn).toHaveBeenCalledWith(user.id, "2");
    expect(response.statusCode).toBe(404);
  });

  test("should return 401 if user is not logged in", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/resources/1"
    });

    expect(fn).not.toHaveBeenCalled();
    expect(response.statusCode).toBe(401);
  });
});

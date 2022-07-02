import { beforeEach, describe, expect, Mock, test, vi } from "vitest";
import { build } from "../../../../app";
import { UserId } from "@alpomoney/shared";
import { signUp } from "../../../auth/authTestUtils";
import { getAllRoute } from "./getAllRoute";

describe("getAllRoute", async () => {
  const app = await build();
  let fn: Mock<[UserId], number[]>;

  beforeEach(async () => {
    fn = vi.fn();
  });

  await app.register(getAllRoute(async userId => {
    fn(userId);
    return [1, 2, 3];
  }), { prefix: "/resources" });
  const user = await signUp(app, "user1", "password1");

  test("should return an array of resources", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/resources",
      headers: {
        cookie: user.cookie
      }
    });

    expect(fn).toHaveBeenCalledOnce();
    expect(fn).toHaveBeenCalledWith(user.id);
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual([1, 2, 3]);
  });

  test("should return 401 if user is not logged in", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/resources"
    });

    expect(fn).not.toHaveBeenCalled();
    expect(response.statusCode).toBe(401);
  });
});

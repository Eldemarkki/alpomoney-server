import { beforeEach, describe, expect, Mock, test, vi } from "vitest";
import { build } from "../../../../app";
import { UserId } from "@alpomoney/shared";
import { signUp } from "../../../auth/authTestUtils";
import { deleteRoute } from "./deleteRoute";

describe("deleteRoute", async () => {
  const app = await build();
  let fn: Mock<[UserId, unknown], boolean>;
  await app.register(deleteRoute(async (userId, id) => {
    fn(userId, id);
    return id === "1";
  }), { prefix: "/resources" });
  const user1 = await signUp(app, "user1", "password1");

  beforeEach(async () => {
    fn = vi.fn();
  });

  test("should be able to delete own resources", async () => {
    const response = await app.inject({
      method: "DELETE",
      url: "/resources/1",
      headers: {
        cookie: user1.cookie
      }
    });

    expect(response.statusCode).toBe(200);
    expect(fn).toHaveBeenCalledOnce();
    expect(fn).toHaveBeenCalledWith(user1.id, "1");
  });

  test("non-existing resource should return 404", async () => {
    const response = await app.inject({
      method: "DELETE",
      url: "/resources/2",
      headers: {
        cookie: user1.cookie
      }
    });

    expect(response.statusCode).toBe(404);
    expect(fn).toHaveBeenCalledOnce();
    expect(fn).toHaveBeenCalledWith(user1.id, "2");
  });

  test("unauthenticated users should not be able to delete resources", async () => {
    const response = await app.inject({
      method: "DELETE",
      url: "/resources/1"
    });

    expect(fn).not.toHaveBeenCalled();
    expect(response.statusCode).toBe(401);
  });
});

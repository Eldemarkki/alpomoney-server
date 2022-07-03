import { beforeEach, describe, expect, Mock, test, vi } from "vitest";
import { build } from "../../../../app";
import { UserId } from "@alpomoney/shared";
import { signUp } from "../../../auth/authTestUtils";
import { deleteRoute } from "./deleteRoute";

describe("deleteRoute", async () => {
  const app = await build();
  let fn: Mock<[UserId, unknown], boolean>;
  let user: { id: UserId, cookie: string };

  await app.register(deleteRoute(async (userId, id) => {
    fn(userId, id);
    return id === "1";
  }), { prefix: "/resources" });

  beforeEach(async () => {
    await app.database.reset();
    user = await signUp(app, "user", "password1");
    fn = vi.fn();
  });

  test("should be able to delete own resources", async () => {
    const response = await app.inject({
      method: "DELETE",
      url: "/resources/1",
      headers: {
        cookie: user.cookie
      }
    });

    expect(response.statusCode).toBe(200);
    expect(fn).toHaveBeenCalledOnce();
    expect(fn).toHaveBeenCalledWith(user.id, "1");
  });

  test("non-existing resource should return 404", async () => {
    const response = await app.inject({
      method: "DELETE",
      url: "/resources/2",
      headers: {
        cookie: user.cookie
      }
    });

    expect(response.statusCode).toBe(404);
    expect(fn).toHaveBeenCalledOnce();
    expect(fn).toHaveBeenCalledWith(user.id, "2");
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

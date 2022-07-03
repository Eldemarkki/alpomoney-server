import { UserId } from "@alpomoney/shared";
import { Type } from "@sinclair/typebox";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { build } from "../../../../app";
import { signUp } from "../../../auth/authTestUtils";
import { editRoute } from "./editRoute";

const Validator = Type.Object({
  price: Type.Optional(Type.Number())
});

describe("editRoute", async () => {
  const app = await build();
  const fn = vi.fn();
  let user: { id: UserId, cookie: string };

  await app.register(editRoute(Validator, async (userId, id, data) => {
    fn(userId, id, data);
    if (id !== "1") return undefined;
    return {
      id,
      userId,
      ...data
    };
  }), { prefix: "/resources" });

  beforeEach(async () => {
    await app.database.reset();
    user = await signUp(app, "user1", "password1");
  });

  test("edit function should be called with correct values", async () => {
    const response = await app.inject({
      method: "PUT",
      url: "/resources/1",
      headers: {
        cookie: user.cookie
      },
      payload: {
        price: 10
      }
    });

    expect(fn).toHaveBeenCalledWith(user.id, "1", { price: 10 });
    expect(response.statusCode).toBe(200);
  });

  test("non-existing resource should return 404", async () => {
    const response = await app.inject({
      method: "PUT",
      url: "/resources/2",
      headers: {
        cookie: user.cookie
      },
      payload: {
        price: 10
      }
    });

    expect(fn).toHaveBeenCalledWith(user.id, "2", { price: 10 });
    expect(response.statusCode).toBe(404);
  });

  test("should return 401 if user is not logged in", async () => {
    const response = await app.inject({
      method: "PUT",
      url: "/resources/1",
      payload: {
        price: 10
      }
    });
    expect(response.statusCode).toBe(401);
  });
});

import { Static, Type } from "@sinclair/typebox";
import { beforeEach, describe, expect, Mock, test, vi } from "vitest";
import { build } from "../../../../app";
import { Brand, UserId, WithIds } from "@alpomoney/shared";
import { createRoute } from "./createRoute";
import { signUp } from "../../../auth/authTestUtils";

const Validator = Type.Object({
  price: Type.Number()
});

type PriceTagId = Brand<string, "PriceId">;

let runningId = 0;
const getRandomId = () => String(runningId++);

describe("createRoute", async () => {
  const app = await build();
  let fn: Mock<[UserId, Static<typeof Validator>], WithIds<Static<typeof Validator>, PriceTagId>>;
  await app.register(createRoute<typeof Validator, PriceTagId>(Validator, async (userId, data) => {
    fn(userId, data);
    return {
      id: getRandomId() as PriceTagId,
      userId,
      ...data
    };
  }), { prefix: "/resources" });
  let user: { id: UserId, cookie: string };

  beforeEach(async () => {
    await app.database.reset();
    user = await signUp(app, "user1", "password1");
    runningId = 0;
    fn = vi.fn();
  });

  test("should be able to create resources if user is logged in", async () => {
    await app.inject({
      method: "POST",
      url: "/resources",
      headers: {
        cookie: user.cookie
      },
      payload: {
        price: 3.14
      }
    });

    expect(fn).toHaveBeenCalledOnce();
    expect(fn).toHaveBeenCalledWith(user.id, { price: 3.14 });
  });

  test("should return the created resource", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/resources",
      headers: {
        cookie: user.cookie
      },
      payload: {
        price: 3.14
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      id: "0",
      userId: user.id,
      price: 3.14
    });
  });

  test("should return 401 if user is not logged in", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/resources",
      payload: {
        price: 3.14
      }
    });

    expect(response.statusCode).toBe(401);
    expect(fn).not.toHaveBeenCalled();
  });

  test("should return 400 if bad request", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/resources",
      headers: {
        cookie: user.cookie
      },
      payload: {
        hmmm: 4
      }
    });

    expect(response.statusCode).toBe(400);
    expect(fn).not.toHaveBeenCalled();
  });
});

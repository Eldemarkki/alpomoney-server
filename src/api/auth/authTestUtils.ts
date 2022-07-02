import { FastifyInstance } from "fastify";
import { UserId } from "@alpomoney/shared";
import { hasKey } from "../../types/types";

export const signUp = async (app: FastifyInstance, username: string, password: string) => {
  const response = await app.inject({
    method: "POST",
    url: "/auth/signup",
    payload: {
      username,
      password
    }
  });

  const responseData: unknown = response.json();
  if (!hasKey(responseData, "id") || typeof responseData.id !== "string") {
    throw new Error("This should never happen");
  }

  return {
    id: responseData.id as UserId,
    cookie: response.headers["set-cookie"]?.toString() || ""
  };
};

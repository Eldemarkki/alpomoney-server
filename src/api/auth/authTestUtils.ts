/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { FastifyInstance } from "fastify";

export const signUp = async (app: FastifyInstance, username: string, password: string) => {
  const response = await app.inject({
    method: "POST",
    url: "/auth/signup",
    payload: {
      username,
      password
    }
  });

  return {
    id: response.json().id as string,
    cookie: response.headers["set-cookie"]?.toString() || ""
  };
};

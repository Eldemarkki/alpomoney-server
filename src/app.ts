import fastify, { FastifyServerOptions } from "fastify";
import { authRoutes } from "./api/auth/authRoutes";
import fastifyCookie from "@fastify/cookie";
import fastifySession from "@fastify/session";
import { DatabaseAdapter } from "./types/DatabaseAdapter";
import { database } from "./utils/mockDatabase";
import { storageRoutes } from "./api/resources/storages";

declare module "fastify" {
  interface FastifyInstance {
    database: DatabaseAdapter
  }
  export interface Session {
    userId?: string
  }
}

const build = async (opts: FastifyServerOptions = {}) => {
  const app = fastify({
    ...opts,
    ajv: {
      customOptions: {
        strict: "log",
        keywords: ["kind", "modifier"]
      }
    },
    ignoreTrailingSlash: true,
    bodyLimit: 1024 * 1024 * 10
  });

  app.decorate("database", database);

  await app.register(fastifyCookie);
  await app.register(fastifySession, {
    secret: "SOMETHING_VERY_VERY_VERY_VERY_VERY_SECRET_1234", // TODO: Move to .env
    cookieName: "alpomoneySessionId", // TODO: Move to .env
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: false,
      maxAge: 60 * 60 * 60
    }
  });

  await app.register(authRoutes, { prefix: "/auth" });
  await app.register(storageRoutes, { prefix: "/storages" });

  return app;
};

export { build };

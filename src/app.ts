import fastify, { FastifyServerOptions } from "fastify";
import { authRoutes } from "./api/auth/authRoutes";
import fastifyCookie from "@fastify/cookie";
import fastifySession from "@fastify/session";
import { DatabaseAdapter } from "./types/DatabaseAdapter";
import { database } from "./utils/mockDatabase";
import { storageRoutes } from "./api/resources/storages";
import { UserId } from "./types/types";
import { sinkRoutes } from "./api/resources/sinks";

declare module "fastify" {
  interface FastifyInstance {
    database: DatabaseAdapter
  }
  export interface Session {
    userId?: UserId
  }
}

const build = async (opts: FastifyServerOptions = {}) => {
  const app = fastify({
    ...opts,
    ignoreTrailingSlash: true,
    bodyLimit: 1024 * 1024 * 10
  });

  app.decorate("database", database);

  await app.register(fastifyCookie);
  await app.register(fastifySession, {
    secret: process.env.SESSION_SECRET || "REPLACE_THIS_WITH_SOMETHING_SECRET_123456789",
    cookieName: process.env.COOKIE_NAME || "alpomoneySessionId",
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: false,
      maxAge: 60 * 60 * 60
    }
  });

  await app.register(authRoutes, { prefix: "/auth" });
  await app.register(storageRoutes, { prefix: "/storages" });
  await app.register(sinkRoutes, { prefix: "/sinks" });

  return app;
};

export { build };

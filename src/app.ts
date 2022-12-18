import fastify, { FastifyServerOptions } from "fastify";
import { authRoutes } from "./api/auth/authRoutes";
import fastifyCookie from "@fastify/cookie";
import fastifySession from "@fastify/session";
import { storageRoutes } from "./api/resources/storages";
import { sinkRoutes } from "./api/resources/sinks";
import { transactionRoutes } from "./api/resources/transactions";
import { recurringTransactionRoutes } from "./api/resources/recurringTransactions";
import { UserId } from "@alpomoney/shared";
import { DatabaseAdapter } from "./types/DatabaseAdapter";
import { createPrismaDatabase } from "./database/prismaDatabase";
import { PrismaClient } from "@prisma/client";

declare module "fastify" {
  export interface Session {
    userId?: UserId
  }
  interface FastifyInstance {
    database: DatabaseAdapter
  }
}

const prisma = new PrismaClient();

const build = async (opts: FastifyServerOptions = {}) => {
  const app = fastify({
    ...opts,
    ignoreTrailingSlash: true,
    bodyLimit: 1024 * 1024 * 10
  });

  const database = createPrismaDatabase(prisma);
  app.decorate("database", database);

  await app.register(fastifyCookie);
  await app.register(fastifySession, {
    secret: process.env.SESSION_SECRET || "REPLACE_THIS_WITH_SOMETHING_SECRET_123456789",
    cookieName: process.env.COOKIE_NAME || "alpomoneySessionId",
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: false,
      maxAge: 86400000 // 24 hours
    }
  });

  await app.register(authRoutes, { prefix: "/auth" });
  await app.register(storageRoutes, { prefix: "/storages" });
  await app.register(sinkRoutes, { prefix: "/sinks" });
  await app.register(transactionRoutes, { prefix: "/transactions" });
  await app.register(recurringTransactionRoutes, { prefix: "/recurringTransactions" });

  return app;
};

export { build };

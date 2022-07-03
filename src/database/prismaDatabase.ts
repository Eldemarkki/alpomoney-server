import { PrismaClient } from "@prisma/client";
import { DatabaseAdapter } from "../types/DatabaseAdapter";
import bcrypt from "bcryptjs";
import { UserId } from "@alpomoney/shared";

export const createPrismaDatabase = (prisma: PrismaClient) => {
  const notImplementedResource = {
    create: async () => { throw new Error("Not implemented"); },
    delete: async () => { throw new Error("Not implemented"); },
    getAll: async () => { throw new Error("Not implemented"); },
    get: async () => { throw new Error("Not implemented"); },
    edit: async () => { throw new Error("Not implemented"); }
  };

  const database: DatabaseAdapter = {
    signUp: async (username: string, password: string) => {
      const alreadyExistingUser = await prisma.user.findFirst({ where: { username } });
      if (alreadyExistingUser !== null) {
        return undefined;
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          username,
          passwordHash
        }
      });

      return {
        id: user.id as UserId,
        username: user.username
      };
    },
    getUser: async (userId: UserId) => {
      const user = await prisma.user.findUnique({
        where: {
          id: userId
        }
      });

      if (!user) return undefined;

      return {
        id: user.id as UserId,
        username: user.username
      };
    },
    login: async (username: string, password: string) => {
      const user = await prisma.user.findUnique({
        where: {
          username
        }
      });

      if (!user) return undefined;

      const passwordMatches = await bcrypt.compare(password, user.passwordHash);
      if (!passwordMatches) return undefined;

      return {
        id: user.id as UserId,
        username: user.username
      };
    },
    reset: async () => {
      await prisma.user.deleteMany({});
    },
    storage: notImplementedResource,
    recurringTransaction: notImplementedResource,
    sink: notImplementedResource,
    transaction: notImplementedResource
  };

  return database;
};

import { PrismaClient } from "@prisma/client";
import { DatabaseAdapter } from "../types/DatabaseAdapter";
import bcrypt from "bcryptjs";
import {
  RecurringTransaction,
  RecurringTransactionFrequency,
  RecurringTransactionId,
  Sink,
  SinkId,
  StorageId,
  Transaction,
  TransactionId,
  UserId
} from "@alpomoney/shared";

export const createPrismaDatabase = (prisma: PrismaClient) => {
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
      await prisma.storage.deleteMany({});
      await prisma.sink.deleteMany({});
      await prisma.transaction.deleteMany({});
      await prisma.recurringTransaction.deleteMany({});
    },
    storage: {
      create: async (userId, data) => {
        const storage = await prisma.storage.create({ data: { userId, ...data } });

        return {
          ...storage,
          id: storage.id as StorageId,
          userId: storage.userId as UserId
        };
      },
      delete: async (userId, id) => {
        const exists = await prisma.storage.findFirst({ where: { id, userId } });
        if (!exists) return false;

        const deleted = await prisma.storage.delete({ where: { id } });
        return !!deleted;
      },
      getAll: async userId => {
        const storages = await prisma.storage.findMany({ where: { userId } });

        return storages.map(storage => ({
          ...storage,
          id: storage.id as StorageId,
          userId: storage.userId as UserId
        }));
      },
      get: async (userId, id) => {
        const storage = await prisma.storage.findFirst({ where: { id, userId } });

        if (!storage) return undefined;

        return {
          ...storage,
          id: storage.id as StorageId,
          userId: storage.userId as UserId
        };
      },
      edit: async (userId, id, data) => {
        const storage = await prisma.storage.findFirst({ where: { id, userId } });

        if (!storage) return undefined;

        const updated = await prisma.storage.update({
          where: { id },
          data
        });

        return {
          ...updated,
          id: updated.id as StorageId,
          userId: updated.userId as UserId
        };
      }
    },
    recurringTransaction: {
      create: async (userId, data) => {
        const recurringTransaction = await prisma.recurringTransaction.create({ data: { userId, ...data } });

        return {
          ...recurringTransaction,
          id: recurringTransaction.id as RecurringTransactionId,
          userId: recurringTransaction.userId as UserId,
          frequency: recurringTransaction.frequency as RecurringTransactionFrequency,
          storageId: recurringTransaction.storageId as StorageId,
          sinkId: recurringTransaction.sinkId as SinkId
        };
      },
      delete: async (userId, id) => {
        const exists = await prisma.recurringTransaction.findFirst({ where: { id, userId } });
        if (!exists) return false;

        const deleted = await prisma.recurringTransaction.delete({ where: { id } });
        return !!deleted;
      },
      get: async (userId, id) => {
        const recurringTransaction = await prisma.recurringTransaction.findFirst({ where: { id, userId } });

        if (!recurringTransaction) return undefined;

        return {
          ...recurringTransaction,
          id: recurringTransaction.id as RecurringTransactionId,
          userId: recurringTransaction.userId as UserId,
          frequency: recurringTransaction.frequency as RecurringTransactionFrequency,
          storageId: recurringTransaction.storageId as StorageId,
          sinkId: recurringTransaction.sinkId as SinkId
        };
      },
      getAll: async userId => {
        const recurringTransactions = await prisma.recurringTransaction.findMany({ where: { userId } });

        return recurringTransactions.map(recurringTransaction => {
          const rt: RecurringTransaction = {
            ...recurringTransaction,
            id: recurringTransaction.id as RecurringTransactionId,
            userId: recurringTransaction.userId as UserId,
            frequency: recurringTransaction.frequency as RecurringTransactionFrequency,
            storageId: recurringTransaction.storageId as StorageId,
            sinkId: recurringTransaction.sinkId as SinkId
          };

          return rt;
        });
      },
      edit: async (userId, id, data) => {
        const recurringTransaction = await prisma.recurringTransaction.findFirst({ where: { id, userId } });

        if (!recurringTransaction) return undefined;

        const updated = await prisma.recurringTransaction.update({
          where: { id },
          data
        });

        return {
          ...updated,
          id: updated.id as RecurringTransactionId,
          userId: updated.userId as UserId,
          frequency: updated.frequency as RecurringTransactionFrequency,
          storageId: updated.storageId as StorageId,
          sinkId: updated.sinkId as SinkId
        };
      }
    },
    sink: {
      create: async (userId, data) => {
        const sink = await prisma.sink.create({ data: { userId, name: data.name } });

        return {
          ...sink,
          id: sink.id as SinkId,
          userId: sink.userId as UserId
        };
      },
      delete: async (userId, id) => {
        const exists = await prisma.sink.findFirst({ where: { id, userId } });
        if (!exists) return false;

        const deleted = await prisma.sink.delete({ where: { id } });
        return !!deleted;
      },
      get: async (userId, id) => {
        const sink = await prisma.sink.findFirst({ where: { id, userId } });

        if (!sink) return undefined;

        return {
          ...sink,
          id: sink.id as SinkId,
          userId: sink.userId as UserId
        };
      },
      getAll: async userId => {
        const sinks = await prisma.sink.findMany({ where: { userId } });

        return sinks.map(sink => {
          const s: Sink = {
            ...sink,
            id: sink.id as SinkId,
            userId: sink.userId as UserId
          };

          return s;
        });
      },
      edit: async (userId, id, data) => {
        const sink = await prisma.sink.findFirst({ where: { id, userId } });

        if (!sink) return undefined;

        const updated = await prisma.sink.update({
          where: { id },
          data
        });

        return {
          ...updated,
          id: updated.id as SinkId,
          userId: updated.userId as UserId
        };
      }
    },
    transaction: {
      create: async (userId, data) => {
        const transaction = await prisma.transaction.create({ data: { userId, ...data } });

        return {
          ...transaction,
          id: transaction.id as TransactionId,
          userId: transaction.userId as UserId,
          storageId: transaction.storageId as StorageId,
          sinkId: transaction.sinkId as SinkId
        };
      },
      getAll: async userId => {
        const transactions = await prisma.transaction.findMany({ where: { userId } });

        return transactions.map(transaction => {
          const t: Transaction = {
            ...transaction,
            id: transaction.id as TransactionId,
            userId: transaction.userId as UserId,
            storageId: transaction.storageId as StorageId,
            sinkId: transaction.sinkId as SinkId
          };

          return t;
        });
      },
      delete: async (userId, id) => {
        const exists = await prisma.transaction.findFirst({ where: { id, userId } });
        if (!exists) return false;

        const deleted = await prisma.transaction.delete({ where: { id } });
        return !!deleted;
      },
      get: async (userId, id) => {
        const transaction = await prisma.transaction.findFirst({ where: { id, userId } });

        if (!transaction) return undefined;

        return {
          ...transaction,
          id: transaction.id as TransactionId,
          userId: transaction.userId as UserId,
          storageId: transaction.storageId as StorageId,
          sinkId: transaction.sinkId as SinkId
        };
      },
      edit: async (userId, id, data) => {
        const transaction = await prisma.transaction.findFirst({ where: { id, userId } });

        if (!transaction) return undefined;

        const updated = await prisma.transaction.update({
          where: { id },
          data
        });

        return {
          ...updated,
          id: updated.id as TransactionId,
          userId: updated.userId as UserId,
          storageId: updated.storageId as StorageId,
          sinkId: updated.sinkId as SinkId
        };
      }
    }
  };

  return database;
};

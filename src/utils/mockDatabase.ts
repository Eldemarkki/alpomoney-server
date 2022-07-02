import {
  RecurringTransaction,
  Sink,
  Storage,
  Transaction,
  UserWithPasswordHash
} from "@alpomoney/shared";
import { RecurringTransactionId, SinkId, StorageId, TransactionId, UserId } from "@alpomoney/shared";
import { DatabaseAdapter } from "../types/DatabaseAdapter";
import { NotFoundError } from "./errors";

interface Tables {
  users: UserWithPasswordHash[],
  storages: Storage[],
  sinks: Sink[],
  transactions: Transaction[],
  recurringTransactions: RecurringTransaction[]
}

const tables: Tables = {
  users: [],
  storages: [],
  sinks: [],
  transactions: [],
  recurringTransactions: []
};

let runningId = 0;
const getRandomId = () => runningId++;

export const database: DatabaseAdapter = {
  signUp: async (username: string, password: string) => {
    if (tables.users.find(user => user.username === username)) {
      return undefined;
    }

    const user = {
      id: getRandomId().toString() as UserId,
      username,
      passwordHash: password
    };

    tables.users.push(user);

    return {
      id: user.id,
      username: user.username
    };
  },
  login: async (username: string, password: string) => {
    const user = tables.users.find(user => user.username === username && user.passwordHash === password);
    if (!user) return undefined;

    return { username: user.username, id: user.id };
  },
  getUser: async (userId: UserId) => {
    const user = tables.users.find(user => user.id === userId);
    if (!user) return undefined;

    return { username: user.username, id: user.id };
  },
  reset: async () => {
    tables.users = [];
    tables.storages = [];
  },
  storage: {
    create: async (userId, data) => {
      console.log(data);
      const storage = {
        id: getRandomId().toString() as StorageId,
        userId,
        ...data
      };
      tables.storages.push(storage);
      return storage;
    },
    delete: async (userId, id) => {
      const index = tables.storages.findIndex(storage => storage.id === id && storage.userId === userId);
      if (index === -1) return false;

      tables.storages.splice(index, 1);
      return true;
    },
    getAll: async userId => {
      return tables.storages.filter(storage => storage.userId === userId);
    },
    get: async (userId, id) => {
      return tables.storages.find(storage => storage.id === id && storage.userId === userId);
    },
    edit: async (userId, id, data) => {
      const resource = tables.storages.find(storage => storage.id === id && storage.userId === userId);
      if (!resource) return undefined;

      if (data.name !== undefined) resource.name = data.name;
      if (data.initialBalance !== undefined) resource.initialBalance = data.initialBalance;

      tables.storages[tables.storages.indexOf(resource)] = resource;

      return resource;
    }
  },
  sink: {
    create: async (userId, data) => {
      const sink = {
        id: getRandomId().toString() as SinkId,
        userId,
        ...data
      };
      tables.sinks.push(sink);
      return sink;
    },
    delete: async (userId, id) => {
      const index = tables.sinks.findIndex(sink => sink.id === id && sink.userId === userId);
      if (index === -1) return false;

      tables.sinks.splice(index, 1);
      return true;
    },
    getAll: async userId => {
      return tables.sinks.filter(sink => sink.userId === userId);
    },
    get: async (userId, id) => {
      return tables.sinks.find(sink => sink.id === id && sink.userId === userId);
    },
    edit: async (userId, id, data) => {
      const resource = tables.sinks.find(sink => sink.id === id && sink.userId === userId);
      if (!resource) return undefined;

      if (data.name !== undefined) resource.name = data.name;

      tables.sinks[tables.sinks.indexOf(resource)] = resource;

      return resource;
    }
  },
  transaction: {
    create: async (userId, data) => {
      if (!tables.storages.find(storage => storage.id === data.storageId && storage.userId === userId)) {
        throw new NotFoundError("Storage", data.storageId);
      }

      if (!tables.sinks.find(sink => sink.id === data.sinkId && sink.userId === userId)) {
        throw new NotFoundError("Sink", data.sinkId);
      }

      const transaction = {
        id: getRandomId().toString() as TransactionId,
        userId,
        ...data
      };
      tables.transactions.push(transaction);
      return transaction;
    },
    delete: async (userId, id) => {
      const index = tables.transactions
        .findIndex(transaction => transaction.id === id && transaction.userId === userId);
      if (index === -1) return false;

      tables.transactions.splice(index, 1);
      return true;
    },
    getAll: async userId => {
      return tables.transactions.filter(transaction => transaction.userId === userId);
    },
    get: async (userId, id) => {
      return tables.transactions.find(transaction => transaction.id === id && transaction.userId === userId);
    },
    edit: async (userId, id, data) => {
      const resource = tables.transactions.find(transaction => transaction.id === id && transaction.userId === userId);
      if (!resource) return undefined;

      if (data.description !== undefined) resource.description = data.description;
      if (data.amount !== undefined) resource.amount = data.amount;
      if (data.storageId !== undefined) {
        if (!tables.storages.find(storage => storage.id === data.storageId && storage.userId === userId)) {
          throw new NotFoundError("Storage", data.storageId);
        }
        resource.storageId = data.storageId;
      }
      if (data.sinkId !== undefined) {
        if (!tables.sinks.find(sink => sink.id === data.sinkId && sink.userId === userId)) {
          throw new NotFoundError("Sink", data.sinkId);
        }
        resource.sinkId = data.sinkId;
      }
      if (data.category !== undefined) resource.category = data.category;
      if (data.createdAt !== undefined) resource.createdAt = data.createdAt;

      tables.transactions[tables.transactions.indexOf(resource)] = resource;

      return resource;
    }
  },
  recurringTransaction: {
    create: async (userId, data) => {
      if (!tables.storages.find(storage => storage.id === data.storageId && storage.userId === userId)) {
        throw new NotFoundError("Storage", data.storageId);
      }

      if (!tables.sinks.find(sink => sink.id === data.sinkId && sink.userId === userId)) {
        throw new NotFoundError("Sink", data.sinkId);
      }

      const recurringTransaction = {
        id: getRandomId().toString() as RecurringTransactionId,
        userId,
        ...data
      };
      tables.recurringTransactions.push(recurringTransaction);
      return recurringTransaction;
    },
    delete: async (userId, id) => {
      const index = tables.recurringTransactions
        .findIndex(recurringTransaction => recurringTransaction.id === id && recurringTransaction.userId === userId);
      if (index === -1) return false;

      tables.recurringTransactions.splice(index, 1);
      return true;
    },
    getAll: async userId => {
      return tables.recurringTransactions.filter(recurringTransaction => recurringTransaction.userId === userId);
    },
    get: async (userId, id) => {
      return tables.recurringTransactions.find(
        recurringTransaction => recurringTransaction.id === id &&
          recurringTransaction.userId === userId
      );
    },
    edit: async (userId, id, data) => {
      const resource = tables.recurringTransactions.find(
        recurringTransaction => recurringTransaction.id === id &&
          recurringTransaction.userId === userId
      );
      if (!resource) return undefined;


      if (data.name !== undefined) resource.name = data.name;
      if (data.amount !== undefined) resource.amount = data.amount;
      if (data.storageId !== undefined) {
        if (!tables.storages.find(storage => storage.id === data.storageId && storage.userId === userId)) {
          throw new NotFoundError("Storage", data.storageId);
        }
        resource.storageId = data.storageId;
      }
      if (data.sinkId !== undefined) {
        if (!tables.sinks.find(sink => sink.id === data.sinkId && sink.userId === userId)) {
          throw new NotFoundError("Sink", data.sinkId);
        }
        resource.sinkId = data.sinkId;
      }
      if (data.category !== undefined) resource.category = data.category;
      if (data.frequency !== undefined) resource.frequency = data.frequency;
      if (data.startDate !== undefined) resource.startDate = data.startDate;

      tables.recurringTransactions[tables.recurringTransactions.indexOf(resource)] = resource;

      return resource;
    }
  }
};

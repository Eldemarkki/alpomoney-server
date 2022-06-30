import { DatabaseAdapter, Sink, Storage, UserWithPasswordHash } from "../types/DatabaseAdapter";
import { SinkId, StorageId, UserId } from "../types/types";

interface Tables {
  users: UserWithPasswordHash[],
  storages: Storage[],
  sinks: Sink[]
}

const tables: Tables = {
  users: [],
  storages: [],
  sinks: []
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
  reset: async () => {
    tables.users = [];
    tables.storages = [];
  },
  storage: {
    create: async (userId, data) => {
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
      return resource;
    }
  }
};

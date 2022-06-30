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
    get: async id => {
      return tables.storages.find(storage => storage.id === id);
    },
    getAll: async () => {
      return tables.storages;
    },
    create: async (userId, data) => {
      const storage = {
        id: String(getRandomId()) as StorageId,
        userId,
        ...data
      };
      tables.storages.push(storage);
      return storage;
    },
    delete: async id => {
      const contains = tables.storages.some(storage => storage.id === id);
      if (contains) {
        tables.storages = tables.storages.filter(storage => storage.id !== id);
      }
      return contains;
    },
    edit: async (id, data) => {
      const original = tables.storages.find(storage => storage.id === id);
      if (original) {
        const edited = original;
        if (data.name) edited.name = data.name;
        if (data.initialBalance) edited.initialBalance = data.initialBalance;

        tables.storages = tables.storages.filter(storage => storage.id !== id).concat(edited);
        return edited;
      }
    }
  },
  sink: {
    create: async (userId, data) => {
      const sink = {
        id: String(getRandomId()) as SinkId,
        userId,
        ...data
      };
      return sink;
    },
    get: async id => {
      return tables.sinks.find(sink => sink.id === id);
    },
    getAll: async () => {
      return tables.sinks;
    },
    delete: async id => {
      const contains = tables.sinks.some(sink => sink.id === id);
      if (contains) {
        tables.sinks = tables.sinks.filter(sink => sink.id !== id);
      }
      return contains;
    },
    edit: async (id, data) => {
      const original = tables.sinks.find(sink => sink.id === id);
      if (original) {
        const edited = original;
        if (data.name) edited.name = data.name;

        tables.sinks = tables.sinks.filter(sink => sink.id !== id).concat(edited);
        return edited;
      }
    }
  }
};

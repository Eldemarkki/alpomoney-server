import { DatabaseAdapter, Storage, UserWithPasswordHash } from "../types/DatabaseAdapter";

interface Tables {
  users: UserWithPasswordHash[],
  storages: Storage[]
}

const tables: Tables = {
  users: [],
  storages: []
};

let runningId = 0;
const getRandomId = () => runningId++;

export const database: DatabaseAdapter = {
  signUp: async (username: string, password: string) => {
    if (tables.users.find(user => user.username === username)) {
      return undefined;
    }

    const user = {
      id: getRandomId().toString(),
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
  createStorage: async (userId, data) => {
    const storage: Storage = {
      id: getRandomId().toString(),
      userId,
      initialBalance: data.initialBalance || 0, // TODO: Remove this 0 default
      name: data.name
    };

    tables.storages.push(storage);
    return storage;
  },
  deleteStorage: async (userId: string, id: string) => {
    const storage = tables.storages.find(storage => storage.id === id && storage.userId === userId);
    if (!storage) return false;

    tables.storages = tables.storages.filter(storage => storage.id !== id);
    return true;
  },
  getStorages: async (userId: string) => {
    return tables.storages.filter(storage => storage.userId === userId);
  },
  getStorage: async (userId: string, id: string) => {
    return tables.storages.find(storage => storage.id === id && storage.userId === userId) || undefined;
  },
  editStorage: async (userId: string, id: string, { name, initialBalance }) => {
    const storage = tables.storages.find(storage => storage.id === id && storage.userId === userId);
    if (!storage) return undefined;

    if (name !== undefined) storage.name = name;
    if (initialBalance !== undefined) storage.initialBalance = initialBalance;

    return storage;
  }
};

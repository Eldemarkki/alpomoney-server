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
      return null;
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
    if (!user) return null;

    return { username: user.username, id: user.id };
  },
  reset: async () => {
    tables.users = [];
  },
  createStorage: async (userId: string, storageName: string, initialBalance: number) => {
    const storage: Storage = {
      id: getRandomId().toString(),
      userId,
      storageName,
      initialBalance
    };

    tables.storages.push(storage);
    return storage;
  },
  deleteStorage: async (userId: string, storageId: string) => {
    const storage = tables.storages.find(storage => storage.id === storageId && storage.userId === userId);
    if (!storage) return false;

    tables.storages = tables.storages.filter(storage => storage.id !== storageId);
    return true;
  },
  getStorages: async (userId: string) => {
    return tables.storages.filter(storage => storage.userId === userId);
  },
  getStorage: async (userId: string, storageId: string) => {
    return tables.storages.find(storage => storage.id === storageId && storage.userId === userId);
  },
  editStorage: async (userId: string, storageId: string, storageName?: string, initialBalance?: number) => {
    const storage = tables.storages.find(storage => storage.id === storageId && storage.userId === userId);
    if (!storage) return null;

    if (storageName !== undefined) storage.storageName = storageName;
    if (initialBalance !== undefined) storage.initialBalance = initialBalance;

    return storage;
  }
};

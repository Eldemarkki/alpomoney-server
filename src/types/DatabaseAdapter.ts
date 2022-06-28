export interface UserWithPasswordHash {
  id: string,
  username: string,
  passwordHash: string
}

export type User = Omit<UserWithPasswordHash, "passwordHash">;

export interface Storage {
  id: string,
  userId: string,
  storageName: string,
  initialBalance: number
}

export interface DatabaseAdapter {
  signUp: (email: string, password: string) => Promise<User | null>,
  login: (email: string, password: string) => Promise<User | null>,
  reset: () => Promise<void>,
  createStorage: (userId: string, storageName: string, initialBalance: number) => Promise<Storage | null>,
  deleteStorage: (userId: string, storageId: string) => Promise<boolean>,
  getStorages: (userId: string) => Promise<Storage[] | null>,
  getStorage: (userId: string, storageId: string) => Promise<Storage | null | undefined>,
  editStorage: (userId: string, storageId: string, storageName?: string, initialBalance?: number)
    => Promise<Storage | null>
}

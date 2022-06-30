import { WithoutIds } from "./types";

export interface UserWithPasswordHash {
  id: string,
  username: string,
  passwordHash: string
}

export type User = Omit<UserWithPasswordHash, "passwordHash">;

export interface Storage {
  id: string,
  userId: string,
  name: string,
  initialBalance: number
}

export interface DatabaseAdapter {
  signUp: (email: string, password: string) => Promise<User | undefined>,
  login: (email: string, password: string) => Promise<User | undefined>,
  reset: () => Promise<void>,
  createStorage: (userId: string, data: WithoutIds<Storage>) => Promise<Storage>,
  deleteStorage: (userId: string, id: string) => Promise<boolean>,
  getStorages: (userId: string) => Promise<Storage[]>,
  getStorage: (userId: string, id: string) => Promise<Storage | undefined>,
  editStorage: (userId: string, id: string, data: Partial<WithoutIds<Storage>>)
    => Promise<Storage | undefined>
}

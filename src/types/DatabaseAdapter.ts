import { StorageId, UserId, WithIds, WithoutIds } from "./types";

export interface UserWithPasswordHash {
  id: UserId,
  username: string,
  passwordHash: string
}

export type User = Omit<UserWithPasswordHash, "passwordHash">;

export type Storage = WithIds<{
  name: string,
  initialBalance: number
}, StorageId>

export interface Resource<ResourceType, ResourceId> {
  create: (userId: UserId, data: WithoutIds<ResourceType>) => Promise<ResourceType>,
  delete: (id: ResourceId) => Promise<boolean>,
  getAll: () => Promise<ResourceType[]>,
  get: (id: ResourceId) => Promise<ResourceType | undefined>,
  edit: (id: ResourceId, data: WithoutIds<ResourceType>) => Promise<ResourceType | undefined>
}

export interface DatabaseAdapter {
  signUp: (email: string, password: string) => Promise<User | undefined>,
  login: (email: string, password: string) => Promise<User | undefined>,
  reset: () => Promise<void>,
  storage: Resource<Storage, StorageId>
}

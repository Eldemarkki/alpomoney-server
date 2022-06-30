import { SinkId, StorageId, UserId, WithIds, WithoutIds } from "./types";

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

export type Sink = WithIds<{
  name: string
}, SinkId>;

export interface Resource<ResourceType, ResourceId> {
  create: (userId: UserId, data: WithoutIds<ResourceType>) => Promise<ResourceType>,
  delete: (userId: UserId, id: ResourceId) => Promise<boolean>,
  getAll: (userId: UserId) => Promise<ResourceType[]>,
  get: (userId: UserId, id: ResourceId) => Promise<ResourceType | undefined>,
  edit: (userId: UserId, id: ResourceId, data: WithoutIds<ResourceType>) => Promise<ResourceType | undefined>
}

export interface DatabaseAdapter {
  signUp: (email: string, password: string) => Promise<User | undefined>,
  login: (email: string, password: string) => Promise<User | undefined>,
  reset: () => Promise<void>,
  storage: Resource<Storage, StorageId>,
  sink: Resource<Sink, SinkId>
}

import {
  RecurringTransaction,
  RecurringTransactionId,
  Sink,
  SinkId,
  Storage,
  StorageId,
  Transaction,
  TransactionId,
  User,
  UserId,
  WithoutIds
} from "@alpomoney/shared";
import { ConvertDates } from "./types";

export interface UserWithPasswordHash {
  id: UserId,
  username: string,
  passwordHash: string
}

export interface Resource<ResourceType, ResourceId> {
  create: (userId: UserId, data: WithoutIds<ConvertDates<ResourceType>>) => Promise<ResourceType>,
  delete: (userId: UserId, id: ResourceId) => Promise<boolean>,
  getAll: (userId: UserId) => Promise<ResourceType[]>,
  get: (userId: UserId, id: ResourceId) => Promise<ResourceType | undefined>,
  edit: (userId: UserId, id: ResourceId, data: WithoutIds<ConvertDates<ResourceType>>)
    => Promise<ResourceType | undefined>
}

export interface DatabaseAdapter {
  signUp: (username: string, password: string) => Promise<User | undefined>,
  login: (username: string, password: string) => Promise<User | undefined>,
  getUser: (userId: UserId) => Promise<User | undefined>,
  reset: () => Promise<void>,
  storage: Resource<Storage, StorageId>,
  sink: Resource<Sink, SinkId>,
  transaction: Resource<Transaction, TransactionId>,
  recurringTransaction: Resource<RecurringTransaction, RecurringTransactionId>
}

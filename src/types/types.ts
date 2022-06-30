import { Type } from "@sinclair/typebox";

export const AccessSingleResource = Type.Object({
  id: Type.String()
});

export type AccessSingleResourceType<ResourceId> = { id: ResourceId };

export type WithoutIds<ResourceType> = Omit<ResourceType, "id" | "userId">;
export type WithIds<ResourceType, ResourceId> = ResourceType & { id: ResourceId, userId: UserId };

export type Brand<T, B> = T & { __brand: B };

export type UserId = Brand<string, "UserId">;
export type StorageId = Brand<string, "StorageId">;

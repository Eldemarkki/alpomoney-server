import { Static, Type } from "@sinclair/typebox";

export const AccessSingleResource = Type.Object({
  id: Type.String()
});

export type AccessSingleResourceType = Static<typeof AccessSingleResource>;

export type WithoutIds<T> = Omit<T, "id" | "userId">;
export type WithIds<T> = T & { id: string, userId: string };

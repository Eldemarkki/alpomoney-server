import { Type } from "@sinclair/typebox";

export const AccessSingleResource = Type.Object({
  id: Type.String()
});

export type AccessSingleResourceType<ResourceId> = { id: ResourceId };

export function hasKey<K extends string>(o: unknown, k: K): o is { [_ in K]: unknown } {
  return o !== null && typeof o === "object" && k in o;
}

export type ConvertDates<T> = {
  [k in keyof T]: (T[k] extends Date ? number : T[k]);
};

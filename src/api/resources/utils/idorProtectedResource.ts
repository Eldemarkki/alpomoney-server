import { TSchema } from "@sinclair/typebox";
import { FastifyPluginAsync } from "fastify";
import { WithIds, WithoutIds } from "../../../types/types";
import { NotFoundError } from "../../../utils/errors";
import { createRoute } from "./createRoute/createRoute";
import { deleteRoute } from "./deleteRoute/deleteRoute";
import { editRoute } from "./editRoute/editRoute";
import { getAllRoute } from "./getAllRoute/getAllRoute";
import { getSingleRoute } from "./getSingleRoute/getSingleRoute";

type SimplestPossible<T> = {
  getAll_UNSAFE: () => Promise<WithIds<T>[]>,
  get_UNSAFE: (id: string) => Promise<WithIds<T> | undefined>,
  delete_UNSAFE: (id: string) => Promise<boolean>,
  edit_UNSAFE: (id: string, data: WithoutIds<T>) => Promise<WithIds<T> | undefined>,
  create: (userId: string, data: WithoutIds<T>) => Promise<WithIds<T>>
}

export const idorProtectedResource = <T>(validator: TSchema, methods: SimplestPossible<T>) => {
  const plugin: FastifyPluginAsync = async fastify => {
    await fastify.register(getSingleRoute(async (id, userId) => {
      const resource = await methods.get_UNSAFE(id);
      if (!resource) throw new NotFoundError();
      if (resource.userId !== userId) throw new NotFoundError();
      return resource;
    }));
    await fastify.register(getAllRoute(async userId => {
      const resources = await methods.getAll_UNSAFE();
      return resources.filter(resource => resource.userId === userId);
    }));
    await fastify.register(deleteRoute(async (userId, id) => {
      const resource = await methods.get_UNSAFE(id);
      if (!resource) throw new NotFoundError();
      if (resource.userId !== userId) throw new NotFoundError();
      return await methods.delete_UNSAFE(id);
    }));
    await fastify.register(createRoute(validator, async (userId, data) => {
      const resource = await methods.create(userId, data as WithoutIds<T>);
      return resource;
    }));
    await fastify.register(editRoute(validator, async (userId, id, data) => {
      const resource = await methods.get_UNSAFE(id);
      if (!resource) throw new NotFoundError();
      if (resource.userId !== userId) throw new NotFoundError();
      return await methods.edit_UNSAFE(id, data as WithoutIds<T>);
    }));
  };

  return plugin;
};

import { TProperties, TSchema } from "@sinclair/typebox";
import { FastifyPluginAsync } from "fastify";
import { UserId, WithIds, WithoutIds } from "../../../types/types";
import { NotFoundError } from "../../../utils/errors";
import { createRoute } from "./createRoute/createRoute";
import { deleteRoute } from "./deleteRoute/deleteRoute";
import { editRoute } from "./editRoute/editRoute";
import { getAllRoute } from "./getAllRoute/getAllRoute";
import { getSingleRoute } from "./getSingleRoute/getSingleRoute";

type SimplestPossible<ResourceType, ResourceId> = {
  getAll_UNSAFE: () => Promise<WithIds<ResourceType, ResourceId>[]>,
  get_UNSAFE: (id: ResourceId) => Promise<WithIds<ResourceType, ResourceId> | undefined>,
  delete_UNSAFE: (id: ResourceId) => Promise<boolean>,
  edit_UNSAFE: (id: ResourceId, data: WithoutIds<ResourceType>) =>
    Promise<WithIds<ResourceType, ResourceId> | undefined>,
  create: (userId: UserId, data: WithoutIds<ResourceType>) => Promise<WithIds<ResourceType, ResourceId>>
}

export const idorProtectedResource = <ResourceType, ResourceId>(
  createValidator: TSchema,
  editValidator: TSchema,
  methods: SimplestPossible<ResourceType, ResourceId>
) => {
  const plugin: FastifyPluginAsync = async fastify => {
    await fastify.register(getSingleRoute<WithIds<ResourceType, ResourceId>, ResourceId>(async (userId, id) => {
      const resource = await methods.get_UNSAFE(id);
      if (!resource) throw new NotFoundError();
      if (resource.userId !== userId) throw new NotFoundError();
      return resource;
    }));
    await fastify.register(getAllRoute(async userId => {
      const resources = await methods.getAll_UNSAFE();
      return resources.filter(resource => resource.userId === userId);
    }));
    await fastify.register(deleteRoute<ResourceId>(async (userId, id) => {
      const resource = await methods.get_UNSAFE(id);
      if (!resource) throw new NotFoundError();
      if (resource.userId !== userId) throw new NotFoundError();
      return await methods.delete_UNSAFE(id);
    }));
    await fastify.register(createRoute(createValidator, async (userId, data) => {
      const resource = await methods.create(userId, data as WithoutIds<ResourceType>);
      return resource;
    }));
    await fastify.register(editRoute<TProperties & TSchema, ResourceId>(editValidator, async (userId, id, data) => {
      const resource = await methods.get_UNSAFE(id);
      if (!resource) throw new NotFoundError();
      if (resource.userId !== userId) throw new NotFoundError();
      return await methods.edit_UNSAFE(id, data as WithoutIds<ResourceType>);
    }));
  };

  return plugin;
};

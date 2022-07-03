import { TProperties, TSchema } from "@sinclair/typebox";
import { FastifyPluginAsync } from "fastify";
import { UserId, WithIds, WithoutIds } from "@alpomoney/shared";
import { NotFoundError } from "../../../utils/errors";
import { createRoute } from "./createRoute/createRoute";
import { deleteRoute } from "./deleteRoute/deleteRoute";
import { editRoute } from "./editRoute/editRoute";
import { getAllRoute } from "./getAllRoute/getAllRoute";
import { getSingleRoute } from "./getSingleRoute/getSingleRoute";
import { ConvertDates } from "../../../types/types";

type Methods<ResourceType, ResourceId> = {
  getAll: (userId: UserId) => Promise<WithIds<ResourceType, ResourceId>[]>,
  get: (userId: UserId, id: ResourceId) => Promise<WithIds<ResourceType, ResourceId> | undefined>,
  delete: (userId: UserId, id: ResourceId) => Promise<boolean>,
  edit: (userId: UserId, id: ResourceId, data: WithoutIds<ConvertDates<ResourceType>>) =>
    Promise<WithIds<ResourceType, ResourceId> | undefined>,
  create: (userId: UserId, data: WithoutIds<ConvertDates<ResourceType>>) => Promise<WithIds<ResourceType, ResourceId>>
}

export const resourcePlugin = <ResourceType, ResourceId>(
  createValidator: TSchema,
  editValidator: TSchema,
  methods: Methods<ResourceType, ResourceId>,
  resourceName?: string
) => {
  const plugin: FastifyPluginAsync = async fastify => {
    await fastify.register(getSingleRoute<WithIds<ResourceType, ResourceId>, ResourceId>(async (userId, id) => {
      const resource = await methods.get(userId, id);
      if (!resource) throw new NotFoundError();
      return resource;
    }, resourceName));
    await fastify.register(getAllRoute(methods.getAll));
    await fastify.register(deleteRoute<ResourceId>(methods.delete, resourceName));
    await fastify.register(createRoute(createValidator, async (userId, data) => {
      return await methods.create(userId, data as WithoutIds<ConvertDates<ResourceType>>);
    }));
    await fastify.register(editRoute<TProperties & TSchema, ResourceId>(editValidator, async (userId, id, data) => {
      const edited = await methods.edit(userId, id, data as WithoutIds<ConvertDates<ResourceType>>);
      if (!edited) throw new NotFoundError();
      return edited;
    }, resourceName));
  };

  return plugin;
};

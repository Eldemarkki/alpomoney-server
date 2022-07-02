import { Static, TProperties, TSchema } from "@sinclair/typebox";
import { FastifyPluginAsync } from "fastify";
import { UndefinedToUnknown } from "fastify/types/type-provider";
import { UserId, WithIds } from "@alpomoney/shared";
import { requireAuthentication } from "../../../../utils/authUtils";

export const createRoute = <ResourceType extends TProperties & TSchema, ResourceId>(
  validator: TSchema,
  create: (
    userId: UserId,
    data: UndefinedToUnknown<keyof ResourceType extends never ? unknown : Static<ResourceType>>
  ) => Promise<WithIds<Static<ResourceType>, ResourceId>>
) => {
  const route: FastifyPluginAsync = async fastify => {
    fastify.post<{
      Body: ResourceType
    }>("/", {
      schema: {
        body: validator
      }
    }, async (request, reply) => {
      const userId = requireAuthentication(request);
      const storage = await create(userId, request.body);
      await reply.send(storage);
    });
  };

  return route;
};

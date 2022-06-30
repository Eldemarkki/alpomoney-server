import { Static, TProperties, TSchema } from "@sinclair/typebox";
import { FastifyPluginAsync } from "fastify";
import { UndefinedToUnknown } from "fastify/types/type-provider";
import { AccessSingleResource, AccessSingleResourceType, UserId, WithIds, WithoutIds } from "../../../../types/types";
import { requireAuthentication } from "../../../../utils/authUtils";
import { NotFoundError } from "../../../../utils/errors";

export const editRoute = <ResourceType extends TProperties & TSchema, ResourceId>(
  validator: TSchema,
  edit: (
    userId: UserId,
    id: ResourceId,
    data: WithoutIds<UndefinedToUnknown<keyof ResourceType extends never ? unknown : Static<ResourceType>>>
  ) => Promise<WithIds<Static<ResourceType>, ResourceId> | undefined>
) => {
  const route: FastifyPluginAsync = async fastify => {
    fastify.put<{ Params: AccessSingleResourceType<ResourceId>, Body: ResourceType }>(
      "/:id",
      {
        schema: {
          params: AccessSingleResource,
          body: validator
        }
      },
      async (request, reply) => {
        const userId = requireAuthentication(request);

        const { id } = request.params;
        const storage = await edit(userId, id, request.body);

        if (!storage) throw new NotFoundError("Storage", id);

        await reply.send(storage);
      });
  };

  return route;
};

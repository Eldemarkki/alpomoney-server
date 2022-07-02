import { Static, TProperties, TSchema } from "@sinclair/typebox";
import { FastifyPluginAsync } from "fastify";
import { UndefinedToUnknown } from "fastify/types/type-provider";
import { UserId, WithIds, WithoutIds } from "@alpomoney/shared";
import { requireAuthentication } from "../../../../utils/authUtils";
import { NotFoundError } from "../../../../utils/errors";
import { AccessSingleResource, AccessSingleResourceType } from "../../../../types/types";

export const editRoute = <ResourceType extends TProperties & TSchema, ResourceId>(
  validator: TSchema,
  edit: (
    userId: UserId,
    id: ResourceId,
    data: WithoutIds<UndefinedToUnknown<keyof ResourceType extends never ? unknown : Static<ResourceType>>>
  ) => Promise<WithIds<Static<ResourceType>, ResourceId> | undefined>,
  resourceName?: string
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

        if (!storage) throw new NotFoundError(resourceName, id);

        await reply.send(storage);
      });
  };

  return route;
};

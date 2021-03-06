import { UserId } from "@alpomoney/shared";
import { FastifyPluginAsync } from "fastify";
import { AccessSingleResource, AccessSingleResourceType } from "../../../../types/types";
import { requireAuthentication } from "../../../../utils/authUtils";
import { NotFoundError } from "../../../../utils/errors";

export const getSingleRoute = <ResourceType, ResourceId>(
  get: (userId: UserId, id: ResourceId) => Promise<ResourceType | undefined>,
  resourceName?: string
) => {
  const route: FastifyPluginAsync = async fastify => {
    fastify.get<{ Params: AccessSingleResourceType<ResourceId> }>("/:id", {
      schema: {
        params: AccessSingleResource
      }
    }, async (request, reply) => {
      const userId = requireAuthentication(request);
      const { id } = request.params;

      const resource = await get(userId, id);

      if (!resource) throw new NotFoundError(resourceName, id);

      await reply.send(resource);
    });
  };

  return route;
};

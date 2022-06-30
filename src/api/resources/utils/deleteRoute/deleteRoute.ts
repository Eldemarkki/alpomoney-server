import { FastifyPluginAsync } from "fastify";
import { AccessSingleResource, AccessSingleResourceType, UserId } from "../../../../types/types";
import { requireAuthentication } from "../../../../utils/authUtils";
import { NotFoundError } from "../../../../utils/errors";


export const deleteRoute = <ResourceId>(
  deleteResource: (userId: UserId, id: ResourceId) => Promise<boolean>,
  resourceName?: string
) => {
  const route: FastifyPluginAsync = async fastify => {
    fastify.delete<{ Params: AccessSingleResourceType<ResourceId> }>("/:id", {
      schema: {
        params: AccessSingleResource
      }
    }, async (request, reply) => {
      const userId = requireAuthentication(request);
      const { id } = request.params;

      const success = await deleteResource(userId, id);

      if (!success) throw new NotFoundError(resourceName, id);

      await reply.send();
    });
  };

  return route;
};

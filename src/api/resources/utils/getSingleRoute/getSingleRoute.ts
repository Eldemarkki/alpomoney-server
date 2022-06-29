import { FastifyPluginAsync } from "fastify";
import { AccessSingleResource, AccessSingleResourceType } from "../../../../types/types";
import { requireAuthentication } from "../../../../utils/authUtils";
import { NotFoundError } from "../../../../utils/errors";

export const getSingleRoute = <T>(get: (userId: string, id: string) => Promise<T>) => {
  const route: FastifyPluginAsync = async fastify => {
    fastify.get<{ Params: AccessSingleResourceType }>("/:id", {
      schema: {
        params: AccessSingleResource
      }
    }, async (request, reply) => {
      const userId = requireAuthentication(request);
      const { id } = request.params;

      const resource = await get(userId, id);

      // TODO: Get the "Resource" text as a parameter
      if (!resource) throw new NotFoundError("Resource", id);

      await reply.send(resource);
    });
  };

  return route;
};

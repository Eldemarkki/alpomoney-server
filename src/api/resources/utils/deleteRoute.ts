import { FastifyPluginAsync } from "fastify";
import { AccessSingleResource, AccessSingleResourceType } from "../../../types/types";
import { requireAuthentication } from "../../../utils/authUtils";
import { NotFoundError } from "../../../utils/errors";

export const deleteRoute = (deleteResource: (userId: string, id: string) => Promise<boolean>) => {
  const route: FastifyPluginAsync = async fastify => {
    fastify.delete<{ Params: AccessSingleResourceType }>("/:id", {
      schema: {
        params: AccessSingleResource
      }
    }, async (request, reply) => {
      const userId = requireAuthentication(request);
      const { id } = request.params;

      const success = await deleteResource(userId, id);

      // TODO: Get the "Storage" text as a parameter
      if (!success) throw new NotFoundError("Storage", id);

      await reply.send();
    });
  };

  return route;
};

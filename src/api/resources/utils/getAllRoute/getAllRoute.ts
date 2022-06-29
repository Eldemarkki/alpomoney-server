import { FastifyPluginAsync } from "fastify";
import { requireAuthentication } from "../../../../utils/authUtils";

export const getAllRoute = <T>(getAll: (userId: string) => Promise<T[]>) => {
  const route: FastifyPluginAsync = async fastify => {
    fastify.get("/", async (request, reply) => {
      const userId = requireAuthentication(request);
      const resources = await getAll(userId);
      await reply.send(resources);
    });
  };

  return route;
};

import { FastifyPluginAsync } from "fastify";

export const getUserIdPlugin: FastifyPluginAsync = async fastify => {
  fastify.get("/", {}, async (request, reply) => {
    await reply.send({ userId: request.session.userId });
  });
};

import { FastifyPluginAsync } from "fastify";

export const getUserIdPlugin: FastifyPluginAsync = async fastify => {
  fastify.get("/", {}, async (request, reply) => {
    await reply.code(200).send({ userId: request.session.get("userId") });
  });
};

import { Static, TProperties, TSchema } from "@sinclair/typebox";
import { FastifyPluginAsync } from "fastify";
import { UndefinedToUnknown } from "fastify/types/type-provider";
import { WithIds } from "../../../../types/types";
import { requireAuthentication } from "../../../../utils/authUtils";

export const createRoute = <T extends TProperties & TSchema>(
  validator: TSchema,
  create: (
    userId: string,
    data: UndefinedToUnknown<keyof T extends never ? unknown : Static<T>>
  ) => Promise<WithIds<Static<T>>>
) => {
  const route: FastifyPluginAsync = async fastify => {
    fastify.post<{
      Body: T
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

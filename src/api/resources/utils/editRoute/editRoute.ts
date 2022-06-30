import { Static, TProperties, TSchema } from "@sinclair/typebox";
import { FastifyPluginAsync } from "fastify";
import { UndefinedToUnknown } from "fastify/types/type-provider";
import { AccessSingleResource, AccessSingleResourceType, WithIds, WithoutIds } from "../../../../types/types";
import { requireAuthentication } from "../../../../utils/authUtils";
import { NotFoundError } from "../../../../utils/errors";

export const editRoute = <T extends TProperties & TSchema>(
  validator: TSchema,
  edit: (
    userId: string,
    id: string,
    data: WithoutIds<UndefinedToUnknown<keyof T extends never ? unknown : Static<T>>>
  ) => Promise<WithIds<Static<T>> | undefined>
) => {
  const route: FastifyPluginAsync = async fastify => {
    fastify.put<{ Params: AccessSingleResourceType, Body: T }>(
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

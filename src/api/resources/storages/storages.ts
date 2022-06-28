import { Type, Static } from "@sinclair/typebox";
import { FastifyPluginAsync } from "fastify";
import { AccessSingleResource, AccessSingleResourceType } from "../../../types/types";
import { requireAuthentication } from "../../../utils/authUtils";
import { NotFoundError } from "../../../utils/errors";
import { database } from "../../../utils/mockDatabase";
import { deleteRoute } from "../utils/deleteRoute";
import { getAllRoute } from "../utils/getAllRoute";
import { getSingleRoute } from "../utils/getSingleRoute";
import { postRoute } from "../utils/postRoute";

const Storage = Type.Object({
  name: Type.String(),
  initialBalance: Type.Number({
    default: 0
  })
});

const EditStorageBody = Type.Object({
  name: Type.Optional(Type.String()),
  initialBalance: Type.Optional(Type.Number())
});

type EditStorageBodyType = Static<typeof EditStorageBody>;

export const storageRoutes: FastifyPluginAsync = async fastify => {
  await fastify.register(getAllRoute(database.getStorages));
  await fastify.register(getSingleRoute(database.getStorage));
  await fastify.register(deleteRoute(database.deleteStorage));
  await fastify.register(postRoute<typeof Storage>(database.createStorage));

  fastify.put<{ Params: AccessSingleResourceType, Body: EditStorageBodyType }>("/:id", {
    schema: {
      params: AccessSingleResource,
      body: EditStorageBody
    }
  }, async (request, reply) => {
    const userId = requireAuthentication(request);

    const { id } = request.params;
    const { name, initialBalance } = request.body;
    const storage = await database.editStorage(userId, id, name, initialBalance);

    if (!storage) throw new NotFoundError("Storage", id);

    await reply.send(storage);
  });
};

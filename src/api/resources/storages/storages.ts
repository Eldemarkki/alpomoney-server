import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync } from "fastify";
import { Storage } from "../../../types/DatabaseAdapter";
import { database } from "../../../utils/mockDatabase";
import { deleteRoute } from "../../../api/resources/utils/deleteRoute/deleteRoute";
import { getSingleRoute } from "../../../api/resources/utils/getSingleRoute/getSingleRoute";
import { createRoute } from "../../../api/resources/utils/createRoute/createRoute";
import { getAllRoute } from "../../../api/resources/utils/getAllRoute/getAllRoute";
import { editRoute } from "../../../api/resources/utils/editRoute/editRoute";

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

export const storageRoutes: FastifyPluginAsync = async fastify => {
  await fastify.register(getAllRoute(database.getStorages));
  await fastify.register(getSingleRoute(database.getStorage));
  await fastify.register(deleteRoute(database.deleteStorage));
  await fastify.register(createRoute<typeof Storage>(Storage, database.createStorage));
  await fastify.register(editRoute(EditStorageBody, database.editStorage));
};

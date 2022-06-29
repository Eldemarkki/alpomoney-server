import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync } from "fastify";
import { Storage } from "../../../types/DatabaseAdapter";
import { database } from "../../../utils/mockDatabase";
import { deleteRoute } from "../utils/deleteRoute";
import { editRoute } from "../utils/editRoute";
import { getAllRoute } from "../utils/getAllRoute";
import { getSingleRoute } from "../utils/getSingleRoute";
import { createRoute } from "../utils/createRoute";

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

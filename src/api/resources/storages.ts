import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync } from "fastify";
import { resourcePlugin } from "./utils/resourceRoutes";

const StorageValidator = Type.Object({
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
  await fastify.register(resourcePlugin(StorageValidator, EditStorageBody, fastify.database.storage, "Storage"));
};

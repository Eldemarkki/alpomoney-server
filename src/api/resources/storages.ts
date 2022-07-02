import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync } from "fastify";
import { database } from "../../database/mockDatabase";
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
  await fastify.register(resourcePlugin(StorageValidator, EditStorageBody, database.storage, "Storage"));
};

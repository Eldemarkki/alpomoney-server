import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync } from "fastify";
import { database } from "../../../utils/mockDatabase";
import { idorProtectedResource } from "../utils/idorProtectedResource";

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
  await fastify.register(idorProtectedResource(StorageValidator, EditStorageBody, {
    get_UNSAFE: database.storage.get,
    getAll_UNSAFE: database.storage.getAll,
    delete_UNSAFE: database.storage.delete,
    edit_UNSAFE: database.storage.edit,
    create: database.storage.create
  }, "Storage"));
};

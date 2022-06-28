import { Type, Static } from "@sinclair/typebox";
import { FastifyPluginAsync } from "fastify";
import { requireAuthentication } from "../../../utils/authUtils";
import { NotFoundError } from "../../../utils/errors";
import { database } from "../../../utils/mockDatabase";

const Storage = Type.Object({
  storageName: Type.String(),
  initialBalance: Type.Number({
    default: 0
  })
});

const AccessSingleStorage = Type.Object({
  storageId: Type.String()
});

const EditStorageBody = Type.Object({
  storageName: Type.Optional(Type.String()),
  initialBalance: Type.Optional(Type.Number())
});

type StorageType = Static<typeof Storage>;
type AccessSingleStorageType = Static<typeof AccessSingleStorage>;
type EditStorageBodyType = Static<typeof EditStorageBody>;

export const storageRoutes: FastifyPluginAsync = async fastify => {
  fastify.get("/", async (request, reply) => {
    const userId = requireAuthentication(request);
    const storages = await database.getStorages(userId);
    await reply.send(storages);
  });

  fastify.get<{ Params: AccessSingleStorageType }>("/:storageId", {
    schema: {
      params: AccessSingleStorage
    }
  }, async (request, reply) => {
    const userId = requireAuthentication(request);
    const { storageId } = request.params;

    const storage = await database.getStorage(userId, storageId);
    if (!storage) throw new NotFoundError("Storage", storageId);

    await reply.send(storage);
  });

  fastify.put<{ Params: AccessSingleStorageType, Body: EditStorageBodyType }>("/:storageId", {
    schema: {
      params: AccessSingleStorage,
      body: EditStorageBody
    }
  }, async (request, reply) => {
    const userId = requireAuthentication(request);

    const { storageId } = request.params;
    const { storageName, initialBalance } = request.body;
    const storage = await database.editStorage(userId, storageId, storageName, initialBalance);

    if (!storage) throw new NotFoundError("Storage", storageId);

    await reply.send(storage);
  });

  fastify.post<{ Body: StorageType }>("/", {
    schema: {
      body: Storage
    }
  }, async (request, reply) => {
    const userId = requireAuthentication(request);

    const { storageName, initialBalance } = request.body;
    const storage = await database.createStorage(userId, storageName, initialBalance);

    await reply.send(storage);
  });

  fastify.delete<{ Params: AccessSingleStorageType }>("/:storageId", {
    schema: {
      params: AccessSingleStorage
    }
  }, async (request, reply) => {
    const userId = requireAuthentication(request);
    const { storageId } = request.params;

    const success = await database.deleteStorage(userId, storageId);
    if (!success) throw new NotFoundError("Storage", storageId);

    await reply.code(200).send();
  });
};

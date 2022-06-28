import { Type, Static } from "@sinclair/typebox";
import { FastifyPluginAsync } from "fastify";
import { database } from "../../utils/mockDatabase";

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
  // TODO: Add return type validation
  fastify.get("/", async (request, reply) => {
    const userId = request.session.userId;
    if (!userId) {
      await reply.code(401).send({
        error: "You must be logged in to access your storages"
      });
      return;
    }

    const storages = await database.getStorages(userId);
    await reply.send(storages);
  });

  // TODO: Add return type validation
  fastify.get<{ Params: AccessSingleStorageType }>("/:storageId", {
    schema: {
      params: AccessSingleStorage
    }
  }, async (request, reply) => {
    const userId = request.session.userId;
    if (!userId) {
      await reply.code(401).send({
        error: "You must be logged in to access your storage"
      });
      return;
    }

    const { storageId } = request.params;
    const storage = await database.getStorage(userId, storageId);
    if (!storage) {
      await reply.code(404).send({
        error: "Storage not found"
      });
      return;
    }

    await reply.send(storage);
  });

  // TODO: Add return type validation
  fastify.put<{ Params: AccessSingleStorageType, Body: EditStorageBodyType }>("/:storageId", {
    schema: {
      params: AccessSingleStorage,
      body: EditStorageBody
    }
  }, async (request, reply) => {
    const userId = request.session.userId;
    if (!userId) {
      await reply.code(401).send({
        error: "You must be logged in to edit your storage"
      });
      return;
    }

    const { storageId } = request.params;
    const { storageName, initialBalance } = request.body;
    const storage = await database.editStorage(userId, storageId, storageName, initialBalance);

    if (!storage) {
      await reply.code(404).send({
        error: "Storage not found"
      });
      return;
    }

    await reply.send(storage);
  });

  // TODO: Add return type validation
  fastify.post<{ Body: StorageType }>("/", {
    schema: {
      body: Storage
    }
  }, async (request, reply) => {
    const userId = request.session.userId;
    if (!userId) {
      await reply.code(401).send({
        error: "You must be logged in to create a storage"
      });
      return;
    }

    const { storageName, initialBalance } = request.body;
    const storage = await database.createStorage(userId, storageName, initialBalance);

    await reply.send(storage);
  });

  // TODO: Add return type validation
  fastify.delete<{ Params: AccessSingleStorageType }>("/:storageId", {
    schema: {
      params: AccessSingleStorage
    }
  }, async (request, reply) => {
    const userId = request.session.userId;
    if (!userId) {
      await reply.code(401).send({
        error: "You must be logged in to delete a storage"
      });
      return;
    }

    const { storageId } = request.params;
    const success = await database.deleteStorage(userId, storageId);

    if (!success) {
      await reply.code(404).send({
        error: "Storage not found"
      });
      return;
    }
    await reply.code(200).send();
  });
};

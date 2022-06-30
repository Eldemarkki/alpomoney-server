import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync } from "fastify";
import { database } from "../../utils/mockDatabase";
import { idorProtectedResource } from "./utils/idorProtectedResource";

const SinkValidator = Type.Object({
  name: Type.String()
});

const EditSinkBody = Type.Object({
  name: Type.Optional(Type.String())
});

export const sinkRoutes: FastifyPluginAsync = async fastify => {
  await fastify.register(idorProtectedResource(SinkValidator, EditSinkBody, {
    get_UNSAFE: database.sink.get,
    getAll_UNSAFE: database.sink.getAll,
    delete_UNSAFE: database.sink.delete,
    edit_UNSAFE: database.sink.edit,
    create: database.sink.create
  }, "Sink"));
};

import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync } from "fastify";
import { resourcePlugin } from "./utils/resourceRoutes";

const SinkValidator = Type.Object({
  name: Type.String()
});

const EditSinkBody = Type.Object({
  name: Type.Optional(Type.String())
});

export const sinkRoutes: FastifyPluginAsync = async fastify => {
  await fastify.register(resourcePlugin(SinkValidator, EditSinkBody, fastify.database.sink, "Sink"));
};

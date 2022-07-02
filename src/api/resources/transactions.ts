import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync } from "fastify";
import { database } from "../../database/mockDatabase";
import { resourcePlugin } from "./utils/resourceRoutes";

const TransactionValidator = Type.Object({
  description: Type.Optional(Type.String()),
  amount: Type.Number({
    default: 0
  }),
  sinkId: Type.String(),
  storageId: Type.String(),
  category: Type.Optional(Type.String()),
  createdAt: Type.Number()
});

const EditTransactionBody = Type.Object({
  description: Type.Optional(Type.String()),
  amount: Type.Optional(Type.Number()),
  sinkId: Type.Optional(Type.String()),
  storageId: Type.Optional(Type.String()),
  category: Type.Optional(Type.String()),
  createdAt: Type.Optional(Type.Number())
});


export const transactionRoutes: FastifyPluginAsync = async fastify => {
  await fastify.register(
    resourcePlugin(TransactionValidator, EditTransactionBody, database.transaction, "Transaction")
  );
};

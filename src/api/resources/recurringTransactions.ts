import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync } from "fastify";
import { database } from "../../utils/mockDatabase";
import { resourcePlugin } from "./utils/resourceRoutes";

const RecurringTransactionValidator = Type.Object({
  name: Type.String(),
  description: Type.Optional(Type.String()),
  amount: Type.Number({
    default: 0
  }),
  sinkId: Type.String(),
  storageId: Type.String(),
  category: Type.Optional(Type.String()),
  frequency: Type.Enum({
    "daily": "daily",
    "weekly": "weekly",
    "monthly": "monthly",
    "yearly": "yearly"
  }),
  startDate: Type.String() // TODO: Custom validator
});

const EditRecurringTransactionBody = Type.Object({
  name: Type.Optional(Type.String()),
  description: Type.Optional(Type.String()),
  amount: Type.Optional(Type.Number()),
  sinkId: Type.Optional(Type.String()),
  storageId: Type.Optional(Type.String()),
  category: Type.Optional(Type.String()),
  frequency: Type.Optional(Type.Enum({
    "daily": "daily",
    "weekly": "weekly",
    "monthly": "monthly",
    "yearly": "yearly"
  })),
  startDate: Type.Optional(Type.String()) // TODO: Custom validator
});

export const recurringTransactionRoutes: FastifyPluginAsync = async fastify => {
  await fastify.register(resourcePlugin(
    RecurringTransactionValidator,
    EditRecurringTransactionBody,
    database.recurringTransaction,
    "RecurringTransaction"
  ));
};

import { FastifyRequest } from "fastify";
import { ApiError } from "./errors";

export const requireAuthentication = (request: FastifyRequest) => {
  const userId = request.session.userId;
  if (!userId) {
    throw new ApiError("You must be logged in to access this resource", 401);
  }

  return userId;
};

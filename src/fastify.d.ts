import { UserId } from "@alpomoney/shared";

declare module "fastify" {
  export interface Session {
    userId?: UserId
  }
}

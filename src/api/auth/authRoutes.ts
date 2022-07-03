import { FastifyPluginAsync } from "fastify";
import { Type, Static } from "@sinclair/typebox";
import { InvalidCredentialsError, UserAlreadyExistsError } from "../../utils/errors";
import { requireAuthentication } from "../../utils/authUtils";

const User = Type.Object({
  username: Type.String(),
  password: Type.String()
});

type UserType = Static<typeof User>;

export const authRoutes: FastifyPluginAsync = async fastify => {
  fastify.post<{ Body: UserType }>("/signup", {
    schema: {
      body: User
    }
  }, async (request, reply) => {
    const { username, password } = request.body;

    const user = await fastify.database.signUp(username, password);
    if (!user) {
      throw new UserAlreadyExistsError();
    }

    request.session.userId = user.id;
    await request.session.save();
    await reply.send(user);
  });

  fastify.post<{ Body: UserType }>("/login", {
    schema: {
      body: User
    }
  }, async (request, reply) => {
    const { username, password } = request.body;
    const user = await fastify.database.login(username, password);

    if (!user) {
      throw new InvalidCredentialsError();
    }

    request.session.userId = user.id;
    await request.session.save();
    await reply.send(user);
  });

  fastify.post("/logout", {}, async (request, reply) => {
    await request.session.destroy();
    await reply.send();
  });

  fastify.get("/user", {}, async (request, reply) => {
    const userId = requireAuthentication(request);
    const user = await fastify.database.getUser(userId);
    await reply.send(user);
  });
};

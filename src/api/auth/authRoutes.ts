import { FastifyPluginAsync } from "fastify";
import { Type, Static } from "@sinclair/typebox";
import { database } from "../../utils/mockDatabase";
import { InvalidCredentialsError, UserAlreadyExistsError } from "../../utils/errors";

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

    const user = await database.signUp(username, password);
    if (!user) {
      throw new UserAlreadyExistsError();
    }

    request.session.set("userId", user.id);
    await request.session.save();
    await reply.code(200).send(user);
  });

  fastify.post<{ Body: UserType }>("/login", {
    schema: {
      body: User
    }
  }, async (request, reply) => {
    const { username, password } = request.body;
    const user = await database.login(username, password);

    if (!user) {
      throw new InvalidCredentialsError();
    }

    request.session.set("userId", user.id);
    await request.session.save();
    await reply.code(200).send(user);
  });
};

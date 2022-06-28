import { FastifyPluginAsync } from "fastify";
import { Type, Static } from "@sinclair/typebox";
import { database } from "../../utils/mockDatabase";

const User = Type.Object({
  username: Type.String(),
  password: Type.String()
});

const RegisterResult = Type.Object({
  username: Type.String(),
  id: Type.String()
});

const LoginResult = Type.Object({
  username: Type.String(),
  id: Type.String()
});

const DuplicateUserError = Type.Object({
  error: Type.Literal("User already exists")
});

const InvalidCredentialsError = Type.Object({
  error: Type.Literal("Invalid credentials")
});

type UserType = Static<typeof User>;
type DuplicateUserErrorType = Static<typeof DuplicateUserError>;
type InvalidCredentialsType = Static<typeof InvalidCredentialsError>;
type LoginResultType = Static<typeof LoginResult>;
type RegisterResultType = Static<typeof RegisterResult>;

type ResponsePayloadType =
  | UserType
  | DuplicateUserErrorType
  | InvalidCredentialsType
  | LoginResultType
  | RegisterResultType;

export const authRoutes: FastifyPluginAsync = async fastify => {
  fastify.post<{ Body: UserType, Reply: RegisterResultType | DuplicateUserErrorType }>("/signup", {
    schema: {
      body: User,
      response: {
        200: RegisterResult,
        409: DuplicateUserError
      }
    }
  }, async (request, reply) => {
    const { username, password } = request.body;

    const user = await database.signUp(username, password);
    if (!user) {
      await reply.code(409).send({
        error: "User already exists"
      });
      return;
    }

    request.session.set("userId", user.id);
    await request.session.save();
    await reply.code(200).send(user);
  });

  fastify.post<{ Body: UserType, Reply: ResponsePayloadType }>("/login", {
    schema: {
      body: User,
      response: {
        200: LoginResult,
        401: InvalidCredentialsError
      }
    }
  }, async (request, reply) => {
    const { username, password } = request.body;
    const user = await database.login(username, password);

    if (!user) {
      await reply.code(401).send({
        error: "Invalid credentials"
      });
      return;
    }
    else {
      request.session.set("userId", user.id);
      await request.session.save();
      await reply.code(200).send(user);
    }
  });
};

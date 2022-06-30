export class ApiError extends Error {
  constructor(error: string, public statusCode: number) {
    super(error);
  }
}

export class NotFoundError extends ApiError {
  constructor(resourceName: unknown = undefined, id: unknown = undefined) {
    if (resourceName && id) {
      super(`Resource '${String(resourceName)}' (id='${String(id)}') was not found`, 404);
    }
    else if (resourceName) {
      super(`Resource '${String(resourceName)}' was not found`, 404);
    }
    else if (id) {
      super(`Resource (id='${String(id)}') was not found`, 404);
    }
    else {
      super("Resource was not found", 404);
    }
  }
}

export class UserAlreadyExistsError extends ApiError {
  constructor() {
    super("User already exists", 409);
  }
}

export class InvalidCredentialsError extends ApiError {
  constructor() {
    super("Invalid credentials", 401);
  }
}

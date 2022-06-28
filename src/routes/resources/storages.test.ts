import { FastifyInstance } from "fastify";
import { beforeEach, describe, expect, test } from "vitest";
import { build } from "../../app";
import { database } from "../../utils/mockDatabase";

describe("storages", () => {
  let user1: {
    id: string,
    cookie: string
  } = {
    id: "",
    cookie: ""
  };

  let user2: {
    id: string,
    cookie: string
  } = {
    id: "",
    cookie: ""
  };

  // This can be ignored, because it will always be set up in beforeEach
  // @ts-ignore
  let app: FastifyInstance = null;

  beforeEach(async () => {
    await database.reset();
    app = await build();
    user1 = await signUp("user1", "password1");
    user2 = await signUp("user2", "password2");
  });

  const signUp = async (username: string, password: string) => {
    const response = await app.inject({
      method: "POST",
      url: "/auth/signup",
      payload: {
        username,
        password
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const userId = response.json().id as string;
    return {
      id: userId,
      cookie: response.headers["set-cookie"]?.toString() || ""
    };
  };

  test("should be able to create storages", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/storages",
      headers: {
        cookie: user1.cookie
      },
      payload: {
        storageName: "myStorage"
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      storageName: "myStorage",
      userId: user1.id,
      initialBalance: 0
    });
  });

  test("should be able to delete own storages", async () => {
    const storage = await database.createStorage(user1.id, "myStorage", 0);

    if (!storage) {
      throw new Error("This should never happen");
    }

    const response = await app.inject({
      method: "DELETE",
      url: "/storages/" + storage.id,
      headers: {
        cookie: user1.cookie
      }
    });

    expect(response.statusCode).toBe(200);
  });

  test("shouldn't be able to access a storage after deletion", async () => {
    const storage = await database.createStorage(user1.id, "myStorage", 0);

    if (!storage) {
      throw new Error("This should never happen");
    }

    await app.inject({
      method: "DELETE",
      url: "/storages/" + storage.id,
      headers: {
        cookie: user1.cookie
      }
    });

    const response = await app.inject({
      method: "GET",
      url: "/storages/" + storage.id,
      headers: {
        cookie: user1.cookie
      }
    });

    expect(response.statusCode).toBe(404);
  });

  test("shouldn't be able to delete other users' storages", async () => {
    const storage = await database.createStorage(user1.id, "myStorage", 0);

    if (!storage) {
      throw new Error("This should never happen");
    }

    const response = await app.inject({
      method: "DELETE",
      url: "/storages/" + storage.id,
      headers: {
        cookie: user2.cookie
      }
    });

    expect(response.statusCode).toBe(404);
  });

  test("shouldn't be able to delete storages if not logged in", async () => {
    const storage = await database.createStorage(user1.id, "myStorage", 0);

    if (!storage) {
      throw new Error("This should never happen");
    }

    const response = await app.inject({
      method: "DELETE",
      url: "/storages/" + storage.id
    });

    expect(response.statusCode).toBe(401);
  });

  test("should be able to edit own storages", async () => {
    const storage = await database.createStorage(user1.id, "myStorage", 0);

    if (!storage) {
      throw new Error("This should never happen");
    }

    const response = await app.inject({
      method: "PUT",
      url: "/storages/" + storage.id,
      headers: {
        cookie: user1.cookie
      },
      payload: {
        storageName: "myStorage2",
        initialBalance: 30
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      storageName: "myStorage2",
      userId: user1.id,
      initialBalance: 30,
      id: storage.id
    });
  });

  test("editing a non-existent storage should return 404", async () => {
    const response = await app.inject({
      method: "PUT",
      url: "/storages/123",
      headers: {
        cookie: user1.cookie
      },
      payload: {
        storageName: "myStorage2",
        initialBalance: 30
      }
    });

    expect(response.statusCode).toBe(404);
  });

  test("shouldn't be able to edit other users' storages", async () => {
    const storage = await database.createStorage(user1.id, "myStorage", 0);

    if (!storage) {
      throw new Error("This should never happen");
    }

    const response = await app.inject({
      method: "PUT",
      url: "/storages/" + storage.id,
      headers: {
        cookie: user2.cookie
      },
      payload: {
        storageName: "myStorage2",
        initialBalance: 30
      }
    });

    expect(response.statusCode).toBe(404);
  });

  test("should be able to get a single own storage", async () => {
    const storage = await database.createStorage(user1.id, "myStorage", 0);

    if (!storage) {
      throw new Error("This should never happen");
    }

    const response = await app.inject({
      method: "GET",
      url: "/storages/" + storage.id,
      headers: {
        cookie: user1.cookie
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      storageName: "myStorage",
      userId: user1.id,
      initialBalance: 0
    });
  });

  test("accessing a non-existent storage should return 404", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/storages/123",
      headers: {
        cookie: user1.cookie
      }
    });
    expect(response.statusCode).toBe(404);
  });

  test("should be able to get all own storages", async () => {
    const storage1 = await database.createStorage(user1.id, "myStorage1", 0);
    const storage2 = await database.createStorage(user1.id, "myStorage2", 0);
    const storage3 = await database.createStorage(user2.id, "otherStorage", 0);

    if (!storage1 || !storage2 || !storage3) {
      throw new Error("This should never happen");
    }

    const response = await app.inject({
      method: "GET",
      url: "/storages",
      headers: {
        cookie: user1.cookie
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).lengthOf(2);
    expect(response.json()).toEqual(expect.arrayContaining([
      {
        id: storage2.id,
        storageName: "myStorage2",
        userId: user1.id,
        initialBalance: 0
      },
      {
        id: storage1.id,
        storageName: "myStorage1",
        userId: user1.id,
        initialBalance: 0
      }
    ]));
  });

  test("shouldn't be able to get another users single storage", async () => {
    const storage = await database.createStorage(user1.id, "myStorage", 0);

    if (!storage) {
      throw new Error("This should never happen");
    }

    const response = await app.inject({
      method: "GET",
      url: "/storages/" + storage.id,
      headers: {
        cookie: user2.cookie
      }
    });

    expect(response.statusCode).toBe(404);
  });
});

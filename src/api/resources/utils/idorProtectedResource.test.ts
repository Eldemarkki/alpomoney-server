import { Static, Type } from "@sinclair/typebox";
import { beforeEach, describe, expect, test } from "vitest";
import { build } from "../../../app";
import { WithIds } from "../../../types/types";
import { signUp } from "../../auth/authTestUtils";
import { idorProtectedResource } from "./idorProtectedResource";

const Resource = Type.Object({
  location: Type.String()
});

type ResourceType = Static<typeof Resource>

let runningId = 0;
const getRandomId = () => String(runningId++);

let resources: WithIds<ResourceType>[] = [];

describe("idorProtectedResource", async () => {
  const fastify = await build();
  let user1 = { id: "", cookie: "" };
  let user2 = { id: "", cookie: "" };
  await fastify.register(idorProtectedResource(Resource, {
    create: async (userId, data) => {
      const r = {
        id: getRandomId(),
        userId,
        ...data
      };
      resources.push(r);
      return r;
    },
    delete_UNSAFE: async id => {
      const contains = resources.some(r => r.id === id);
      if (contains) {
        resources = resources.filter(r => r.id !== id);
      }
      return contains;
    },
    get_UNSAFE: async id => {
      return resources.find(r => r.id === id);
    },
    getAll_UNSAFE: async () => {
      return resources;
    },
    edit_UNSAFE: async (id, data) => {
      const original = resources.find(r => r.id === id);
      if (original) {
        const edited = original;
        if (data.location) edited.location = data.location;

        resources = resources.filter(r => r.id !== id).concat(edited);
        return edited;
      }
      return undefined;
    }
  }), { prefix: "/resources" });

  user1 = await signUp(fastify, "user1", "password1");
  user2 = await signUp(fastify, "user2", "password2");

  beforeEach(async () => {
    runningId = 0;
    resources = [];
  });

  const createResource = async (user: { id: string, cookie: string }, data: ResourceType) => {
    const response = await fastify.inject({
      method: "POST",
      url: "/resources",
      headers: {
        cookie: user.cookie
      },
      payload: data
    });

    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      id: response.json().id as string,
      userId: user.id,
      ...data
    };
  };

  test("user2 can not get user1's single resource", async () => {
    const resource = await createResource(user1, { location: "location1" });
    const response = await fastify.inject({
      method: "GET",
      url: `/resources/${resource.id}`,
      headers: {
        cookie: user2.cookie
      }
    });

    expect(response.statusCode).toBe(404);
  });

  test("user2 can not get user1's all resources", async () => {
    await createResource(user1, { location: "location1" });
    await createResource(user1, { location: "location2" });
    const resource = await createResource(user2, { location: "location3" });
    const response = await fastify.inject({
      method: "GET",
      url: "/resources",
      headers: {
        cookie: user2.cookie
      }
    });

    expect(response.json()).toHaveLength(1);
    expect(response.json()).toEqual([resource]);
    expect(response.statusCode).toBe(200);
  });

  test("when user2 tries to edit user1's resource, the resource should not change", async () => {
    const resource = await createResource(user1, { location: "location1" });
    const editResponse = await fastify.inject({
      method: "PUT",
      url: `/resources/${resource.id}`,
      headers: {
        cookie: user2.cookie
      },
      payload: {
        location: "haha hacked"
      }
    });

    expect(editResponse.statusCode).toBe(404);

    const afterEdit = await fastify.inject({
      method: "GET",
      url: `/resources/${resource.id}`,
      headers: {
        cookie: user1.cookie
      }
    });

    expect(afterEdit.json()).toEqual(resource);
  });

  test("when user2 tries to delete user1's resource, the resource should not be deleted", async () => {
    const resource = await createResource(user1, { location: "location1" });
    const deleteResponse = await fastify.inject({
      method: "DELETE",
      url: `/resources/${resource.id}`,
      headers: {
        cookie: user2.cookie
      }
    });

    expect(deleteResponse.statusCode).toBe(404);

    const afterDelete = await fastify.inject({
      method: "GET",
      url: `/resources/${resource.id}`,
      headers: {
        cookie: user1.cookie
      }
    });

    expect(afterDelete.json()).toEqual(resource);
  });
});

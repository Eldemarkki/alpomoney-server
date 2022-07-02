import { Static, Type } from "@sinclair/typebox";
import { beforeEach, describe, expect, test } from "vitest";
import { build } from "../../../app";
import { Brand, UserId, WithIds } from "@alpomoney/shared";
import { signUp } from "../../auth/authTestUtils";
import { resourcePlugin } from "./resourceRoutes";
import { hasKey } from "../../../types/types";

const Resource = Type.Object({
  location: Type.String()
});

const ResourceEdit = Type.Object({
  location: Type.Optional(Type.String())
});

type ResourceType = Static<typeof Resource>
type LocationId = Brand<string, "LocationId">;

let runningId = 0;
const getRandomId = () => String(runningId++);

let resources: WithIds<ResourceType, LocationId>[] = [];

describe("resourceRoutes", async () => {
  const fastify = await build();
  await fastify.register(resourcePlugin<ResourceType, LocationId>(Resource, ResourceEdit, {
    create: async (userId, data) => {
      const id = getRandomId() as LocationId;
      resources.push({ id, userId, ...data });
      return { id, userId, ...data };
    },
    get: async (userId, id) => {
      return resources.find(r => r.id === id && r.userId === userId);
    },
    getAll: async userId => {
      return resources.filter(r => r.userId === userId);
    },
    edit: async (userId, id, data) => {
      const resource = resources.find(r => r.id === id && r.userId === userId);
      if (!resource) {
        return;
      }

      const newResource = { ...resource, ...data };
      const index = resources.indexOf(resource);
      resources[index] = newResource;
      return newResource;
    },
    delete: async (userId, id) => {
      const index = resources.findIndex(r => r.id === id && r.userId === userId);
      if (index === -1) {
        return false;
      }
      resources.splice(index, 1);
      return true;
    }
  }), { prefix: "/resources" });

  const user1 = await signUp(fastify, "user1", "password1");
  const user2 = await signUp(fastify, "user2", "password2");

  beforeEach(async () => {
    runningId = 0;
    resources = [];
  });

  const createResource = async (user: { id: UserId, cookie: string }, data: ResourceType) => {
    const response = await fastify.inject({
      method: "POST",
      url: "/resources",
      headers: {
        cookie: user.cookie
      },
      payload: data
    });

    const responseData: unknown = response.json();
    if (!hasKey(responseData, "id") || typeof responseData.id !== "string") {
      throw new Error("This should never happen");
    }

    return {
      id: responseData.id,
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

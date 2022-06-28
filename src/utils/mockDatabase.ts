import { DatabaseAdapter } from "../types/DatabaseAdapter";

interface User {
  id: string,
  username: string,
  passwordHash: string
}

interface Tables {
  users: User[]
}

const tables: Tables = {
  users: []
};

let runningId = 0;
const getRandomId = () => runningId++;

export const database: DatabaseAdapter = {
  signUp: async (username: string, password: string) => {
    if (tables.users.find(user => user.username === username)) {
      return null;
    }

    const user = {
      id: getRandomId().toString(),
      username,
      passwordHash: password
    };

    tables.users.push(user);

    return {
      id: user.id,
      username: user.username
    };
  },
  login: async (username: string, password: string) => {
    const user = tables.users.find(user => user.username === username && user.passwordHash === password);
    if (!user) return null;

    return { username: user.username, id: user.id };
  },
  reset: async () => {
    tables.users = [];
  }
};

FROM node:18.12.1 AS build-stage
WORKDIR /app
COPY package.json .
COPY package-lock.json .
COPY prisma prisma
RUN npm ci
COPY tsconfig.json .
COPY src src
RUN npm run tsc

FROM node:18.12.1-slim AS run-stage
WORKDIR /app
COPY start.sh .
RUN npm install --location=global prisma
COPY --from=build-stage /app/node_modules /app/node_modules
COPY --from=build-stage /app/prisma /app/prisma
COPY --from=build-stage /app/dist /app/dist
CMD ["sh", "start.sh"]

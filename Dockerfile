FROM node:16-alpine AS build-stage
WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm ci
COPY src src
COPY tsconfig.json .
RUN npm run tsc

FROM node:16-alpine AS run-stage
WORKDIR /app
COPY --from=build-stage /app .
RUN ls -la src
CMD ["node", "src/index.js"]

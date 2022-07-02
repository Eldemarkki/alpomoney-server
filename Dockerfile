FROM node:16-alpine AS build-stage
WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm ci
COPY src src
COPY tsconfig.json .
RUN npm run tsc
COPY webpack.config.js .
RUN npm run webpack

FROM node:16-alpine AS run-stage
WORKDIR /app
COPY --from=build-stage /app/dist/api.bundle.js .
CMD ["node", "api.bundle.js"]

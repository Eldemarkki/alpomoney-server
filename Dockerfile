FROM node:16-alpine AS build-stage
WORKDIR /app
COPY prisma prisma
COPY package-lock.json .
COPY package.json .
RUN npm ci
COPY tsconfig.json .
COPY src src
RUN npm run tsc
COPY webpack.config.js .
RUN npm run webpack

FROM node:16-alpine AS run-stage
WORKDIR /app
COPY start.sh .
RUN npm install --location=global prisma
COPY --from=build-stage /app/node_modules /app/node_modules
COPY --from=build-stage /app/prisma /app/prisma
COPY --from=build-stage /app/dist/api.bundle.js .
CMD ["sh", "start.sh"]

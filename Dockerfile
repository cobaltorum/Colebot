# Base image
FROM node:23.11-alpine AS base
WORKDIR /colebot

# Install dependencies
FROM base AS install
COPY package.json package-lock.json ./
RUN npm install --verbose

# Build the project
FROM base AS build
COPY . .
COPY --from=install /colebot/node_modules ./node_modules
RUN npm run compile

# Release image
FROM base AS release
COPY --from=build /colebot/node_modules ./node_modules
COPY --from=install /colebot/package.json ./package.json
COPY --from=build /colebot/dist ./dist
COPY --from=build /colebot/src ./src

ENTRYPOINT [ "npm", "run", "start" ]
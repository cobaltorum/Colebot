# Base image
FROM node:23.11-alpine AS base
WORKDIR /app

# Install dependencies
FROM base AS install
COPY package.json package-lock.json ./
RUN npm install --verbose

# Build the project
FROM base AS build
COPY . .
COPY --from=install /app/node_modules ./node_modules
RUN npm run compile

# Release image
FROM base AS release
COPY --from=build /app/node_modules ./node_modules
COPY --from=install /app/package.json ./package.json
COPY --from=build /app/dist ./dist
COPY --from=build /app/src ./src

ENTRYPOINT [ "npm", "run", "start" ]
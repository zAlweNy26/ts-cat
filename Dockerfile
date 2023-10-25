# Setup
FROM node:20-slim as base

# Install pnpm
RUN npm i -g pnpm

WORKDIR /app

# Install and copy
FROM base AS build

COPY .npmrc package.json pnpm-lock.yaml ./

RUN pnpm install

COPY . .

# Run in dev watch mode
CMD ["pnpm", "dev"]
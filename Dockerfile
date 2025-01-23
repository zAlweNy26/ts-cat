FROM oven/bun AS build

WORKDIR /app

# Cache packages installation
COPY package.json bun.lock ./
COPY ./patches ./patches

RUN bun install --ignore-scripts --production

COPY ./src ./src

ENV NODE_ENV=production

RUN bun run build

FROM alpine AS prod

WORKDIR /app

COPY --from=build /app/ccat /app/ccat

ENV NODE_ENV=production

CMD ["./ccat"]

EXPOSE 3000
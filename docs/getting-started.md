# Getting Started

## Pre-requisites

- Bun (>= 1.1.19) (for local development)
- Docker

## Installation

```bash
# (for development)
bun install
rm -f .git/hooks/pre-commit && ln -s ../../pre-commit .git/hooks/pre-commit

# (for production)
docker compose build --no-cache
```

## How to run

```bash
# (for development)
docker run -p 6333:6333 qdrant/qdrant
bun run dev
# OR
docker compose build -f compose.dev.yml --no-cache # (if you want to use Docker for development)

# (for production)
docker compose up
```

## How to test

```bash
bun run test
# OR
docker compose -f compose.dev.yml exec ccat-ts-dev bun run test
```

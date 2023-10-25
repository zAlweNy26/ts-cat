# Cheshire Cat (Stregatto)

<a href="https://github.com/zAlweNy26/ts-cat">
    <img alt="GitHub Stars" src="https://img.shields.io/github/stars/zAlweNy26/ts-cat">
</a>
<a href="https://discord.gg/bHX5sNFCYU">
    <img alt="Discord Server" src="https://img.shields.io/discord/1092359754917089350?logo=discord">
</a>
<a href="https://github.com/zAlweNy26/ts-cat/issues">
    <img alt="GitHub Issues" src="https://img.shields.io/github/issues/zAlweNy26/ts-cat">
</a>
<a href="https://github.com/zAlweNy26/ts-cat/tags">
    <img alt="GitHub Latest Tag" src="https://img.shields.io/github/v/tag/zAlweNy26/ts-cat">
</a>
<a href="https://github.com/zAlweNy26/ts-cat">
    <img alt="GitHub Top Language" src="https://img.shields.io/github/languages/top/zAlweNy26/ts-cat">
</a>

TypeScript version of the [Cheshire Cat AI](https://github.com/zAlweNy26/ts-cat) framework originally made in Python.

## Todos

- [ ] Add built-in CLI.
- [ ] Add git pre-commit hook for linting and testing.
- [ ] Improve plugin external packages installation.
- [ ] Add unit tests.
- [ ] Make forms work.
- [ ] Fix relative imports using `tsconfig-paths`.
- [ ] Improve OpenAPI schema generation using [fastify-type-provider-zod](https://github.com/turkerdev/fastify-type-provider-zod).

## Bugs

- [ ] Fix fastify logger levels.
- [ ] Replace `node --loader ts-node/esm` with `ts-node` when [this is fixed](https://github.com/TypeStrong/ts-node/issues/1997).

## Pre-requisites

- Node.js 18.x
- pnpm 8.10.x

## Installation

```bash
pnpm install # (for development)
docker compose build --no-cache # (for production)
```

## How to run

```bash
pnpm run dev # (for development)
docker compose up # (for production)
```

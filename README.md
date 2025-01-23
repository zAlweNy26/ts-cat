# Cheshire Cat (Stregatto)

[![GitHub Stars](https://img.shields.io/github/stars/zAlweNy26/ts-cat)](https://github.com/zAlweNy26/ts-cat)
[![Discord Server](https://img.shields.io/discord/1092359754917089350?logo=discord)](https://discord.gg/bHX5sNFCYU)
[![GitHub Issues](https://img.shields.io/github/issues/zAlweNy26/ts-cat)](https://github.com/zAlweNy26/ts-cat/issues)
[![GitHub Latest Tag](https://img.shields.io/github/v/tag/zAlweNy26/ts-cat)](https://github.com/zAlweNy26/ts-cat/tags)
[![GitHub Top Language](https://img.shields.io/github/languages/top/zAlweNy26/ts-cat)](https://github.com/zAlweNy26/ts-cat)

TypeScript version of the [Cheshire Cat AI](https://github.com/cheshire-cat-ai/core) framework originally made in Python.

Check out the [linked project](https://github.com/zAlweNy26/ts-cat/projects?query=is%3Aopen) for more information on what's being worked on.

📜 For the full list of changes, please read the [changelog](./CHANGELOG.md) file.

👥 If you want to contribute, please read the [contributing](./CONTRIBUTING.md) file.

📃 To be sure to respect everything, please read the [code of conduct](./CODE_OF_CONDUCT.md) file.

## Why use the cat?

- ⚡️ API first, so you get a microservice to easily add a conversational layer to your app
- 🐘 Remembers conversations and documents and uses them in conversation
- 🚀 Extensible via plugins
- 🏛️ Event callbacks, function calling (tools), conversational forms
- 🌍 Supports any language model (works with OpenAI, Google, Ollama, HuggingFace, custom services and many others)
- 🐋 Production ready - 100% dockerized

## Features

- [x] Granular plugins folder reload
- [x] Sync/Async ingestion endpoints
- [x] New built-in LLMs and Embedders
- [x] Instant tool call hook
- [x] Granular management of procedures (forms and tools)
- [x] Supports cron jobs (without saving to memory)
- [x] Rate limiter
- [x] Database query executor
- [x] Supports streaming both in WebSocket and HTTP
- [x] Tokens usage visible through model interactions
- [x] Cache support for LLM and Embedder responses
- [ ] Built-in CLI
- [ ] External plugins registry support
- [ ] Add multi-modality support
- [ ] Add multi-agent support
- [ ] Add multi-chat support

## Pre-requisites

- Bun (>= 1.2) (for local development)
- Docker

## Installation

```bash
# (for development)
bun install

# (for production)
docker compose build --no-cache
```

## How to run

```bash
# (for development)
docker run -p 6333:6333 qdrant/qdrant
bun run dev
# OR (if you are using the dev docker compose)
docker compose -f compose.dev.yml build --no-cache
docker compose -f compose.dev.yml up -d

# (for production)
docker compose up
```

## How to run CLI

```bash
bun run cli <command>
# OR (if you are using the dev compose)
docker exec ccat_ts_dev bun run cli <command>
# OR (if you are using the prod compose)
docker exec ccat_ts bun run cli <command>
```

## How to test

```bash
bun run test
# OR (if you are using the dev compose)
docker exec ccat_ts_dev bun run test
# OR (if you are using the prod compose)
docker exec ccat_ts bun run test
```

## License

This project is licensed under the GPL-3.0 License - see the [LICENSE](./LICENSE) file for details.

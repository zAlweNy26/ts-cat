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
- [ ] External plugins registry support
- [ ] Built-in CLI
- [ ] Supports multimodality

## Pre-requisites

- Bun (>= 1.1.19)
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

## License

This project is licensed under the GPL-3.0 License - see the [LICENSE](./LICENSE) file for details.

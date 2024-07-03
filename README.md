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

## Features

- [x] Granular plugins folder reload
- [x] Sync/Async ingestion endpoints
- [x] New built-in LLMs and Embedders
- [x] Instant tool call hook
- [x] Granular management of procedures (forms and tools)
- [ ] Built-in CLI
- [ ] Supports multimodality
- [ ] Supports cron jobs

## Pre-requisites

- Bun (>= 1.1.0)

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
# (for development, with watcher)
bun run dev
# (for development, without watcher)
bun start

# (for production)
docker compose up
```

## How to test

To run the tests, be sure to have the Docker compose up and running. Then you can do:

```bash
docker exec -it ccat_ts bun test
```

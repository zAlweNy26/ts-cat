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

Check out the [linked project](https://github.com/zAlweNy26/ts-cat/projects?query=is%3Aopen) for more information on what's being worked on.

## Features

- [x] Granular plugins folder reload
- [x] Sync/Async ingestion endpoints
- [x] New built-in LLMs and Embedders
- [x] Instant tool call with `@[toolName]` syntax
- [x] Granular activation of procedures
- [ ] Built-in CLI

## How to contribute

1. Fork the repository
2. Create a new branch named after the feature you're working on
3. Make your changes
4. Commit and push your changes using the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) format
5. Open a pull request
6. Wait for the review
7. Enjoy your contribution!

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

## How to test

To run the tests, be sure to have the Docker compose up and running. Then you can do:

```bash
docker exec -it ccat_ts pnpm test
```

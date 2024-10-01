# Changelog

## v1.4.0

[compare changes](https://github.com/zAlweNy26/ts-cat/compare/v1.3.1...v1.4.0)

### 🚀 Enhancements

- Add streaming http endpoint ([e9c97df](https://github.com/zAlweNy26/ts-cat/commit/e9c97df))
- Add `queryDb` method to StrayCat ([d855225](https://github.com/zAlweNy26/ts-cat/commit/d855225))
- **RabbitHole:** Add metadata in endpoints ([f3d2eb4](https://github.com/zAlweNy26/ts-cat/commit/f3d2eb4))
- Add `addHistory` method to StrayCat ([64cd2be](https://github.com/zAlweNy26/ts-cat/commit/64cd2be))
- Add `getPoints` method in VectorMemoryCollection ([aa20ce5](https://github.com/zAlweNy26/ts-cat/commit/aa20ce5))
- Add new endpoints for collection points and chat history ([6107112](https://github.com/zAlweNy26/ts-cat/commit/6107112))
- Update custom custom chat models classes ([8d03872](https://github.com/zAlweNy26/ts-cat/commit/8d03872))
- ⚠️  Add db in before/after bootstrap hooks ([b2bea4b](https://github.com/zAlweNy26/ts-cat/commit/b2bea4b))
- Add rate limit handler ([4c21d50](https://github.com/zAlweNy26/ts-cat/commit/4c21d50))

### 🔥 Performance

- ⚠️  Correct setup of elysia routes ([8e2543f](https://github.com/zAlweNy26/ts-cat/commit/8e2543f))

### 💅 Refactors

- ⚠️  Use only chat models ([a144df2](https://github.com/zAlweNy26/ts-cat/commit/a144df2))
- ⚠️  Refactor Embedders and LLMs factory classes ([c383d75](https://github.com/zAlweNy26/ts-cat/commit/c383d75))

### 📖 Documentation

- Update README ([fd09364](https://github.com/zAlweNy26/ts-cat/commit/fd09364))

### 🏡 Chore

- Change http error log format ([20f2f12](https://github.com/zAlweNy26/ts-cat/commit/20f2f12))
- Small tweaks ([d3bdc05](https://github.com/zAlweNy26/ts-cat/commit/d3bdc05))
- Update dependencies ([327c71f](https://github.com/zAlweNy26/ts-cat/commit/327c71f))

### 🎨 Styles

- Fix linting ([c2bbee5](https://github.com/zAlweNy26/ts-cat/commit/c2bbee5))

#### ⚠️ Breaking Changes

- ⚠️  Add db in before/after bootstrap hooks ([b2bea4b](https://github.com/zAlweNy26/ts-cat/commit/b2bea4b))
- ⚠️  Correct setup of elysia routes ([8e2543f](https://github.com/zAlweNy26/ts-cat/commit/8e2543f))
- ⚠️  Use only chat models ([a144df2](https://github.com/zAlweNy26/ts-cat/commit/a144df2))
- ⚠️  Refactor Embedders and LLMs factory classes ([c383d75](https://github.com/zAlweNy26/ts-cat/commit/c383d75))

### ❤️ Contributors

- Dany <zdanymc@gmail.com>

## v1.3.1

[compare changes](https://github.com/zAlweNy26/ts-cat/compare/v1.3.0...v1.3.1)

### 🚀 Enhancements

- Improve HTTP errors ([9205a66](https://github.com/zAlweNy26/ts-cat/commit/9205a66))
- Add `afterSendMessage` hook ([7d54491](https://github.com/zAlweNy26/ts-cat/commit/7d54491))
- Add batch files uploading endpoint ([e5f6074](https://github.com/zAlweNy26/ts-cat/commit/e5f6074))
- Add models interactions and update hooks ([4f73bc0](https://github.com/zAlweNy26/ts-cat/commit/4f73bc0))

### 🩹 Fixes

- Update deps, docker compose and some fixes ([c61cd24](https://github.com/zAlweNy26/ts-cat/commit/c61cd24))

### 🌊 Types

- Fix typechecks ([f188791](https://github.com/zAlweNy26/ts-cat/commit/f188791))

### 🏡 Chore

- Export AgentManager and VectorMemory ([4d2b0bd](https://github.com/zAlweNy26/ts-cat/commit/4d2b0bd))

### ❤️ Contributors

- Dany <zdanymc@gmail.com>

## v1.3.0

[compare changes](https://github.com/zAlweNy26/ts-cat/compare/v1.2.6...v1.3.0)

### 🚀 Enhancements

- Improve tool parser ([a79416a](https://github.com/zAlweNy26/ts-cat/commit/a79416a))
- Update LLM and Embedder configs ([68a0e26](https://github.com/zAlweNy26/ts-cat/commit/68a0e26))
- Add parseJson utils ([485ffc3](https://github.com/zAlweNy26/ts-cat/commit/485ffc3))
- **RabbitHole:** Add 2 new hooks ([f167e10](https://github.com/zAlweNy26/ts-cat/commit/f167e10))
- Update prompt template and output parser ([0beb14a](https://github.com/zAlweNy26/ts-cat/commit/0beb14a))
- Update langchain to v0.2 ([52bef47](https://github.com/zAlweNy26/ts-cat/commit/52bef47))
- Add WhiteRabbit (job scheduler) ([fb815ce](https://github.com/zAlweNy26/ts-cat/commit/fb815ce))
- Improve plugin importing using Blobs ([49b9962](https://github.com/zAlweNy26/ts-cat/commit/49b9962))
- Promisify specific hooks ([648b76f](https://github.com/zAlweNy26/ts-cat/commit/648b76f))

### 🩹 Fixes

- Small general fixes ([5170dfb](https://github.com/zAlweNy26/ts-cat/commit/5170dfb))
- Improve AgentManager ([9015cdb](https://github.com/zAlweNy26/ts-cat/commit/9015cdb))
- Fix multi-action agent with temp patch ([760da42](https://github.com/zAlweNy26/ts-cat/commit/760da42))
- Require Bun v1.1.19+ to work ([30ce63d](https://github.com/zAlweNy26/ts-cat/commit/30ce63d))
- Fix chat history saving ([45cc9c8](https://github.com/zAlweNy26/ts-cat/commit/45cc9c8))

### 💅 Refactors

- Update AgentManager with improvements ([523ce0b](https://github.com/zAlweNy26/ts-cat/commit/523ce0b))
- Switch to Bun runtime ([635c6bc](https://github.com/zAlweNy26/ts-cat/commit/635c6bc))
- Migrate from Fastify to Elysia ([6d2b0f9](https://github.com/zAlweNy26/ts-cat/commit/6d2b0f9))

### 🌊 Types

- Move types to separate folder ([472d4de](https://github.com/zAlweNy26/ts-cat/commit/472d4de))

### 🏡 Chore

- Update dependencies ([ee47e5e](https://github.com/zAlweNy26/ts-cat/commit/ee47e5e))
- Update plugin importing ([eaaf447](https://github.com/zAlweNy26/ts-cat/commit/eaaf447))
- Improve api zod schemas ([97c5a0c](https://github.com/zAlweNy26/ts-cat/commit/97c5a0c))
- Update AgentManager ([b6a7e79](https://github.com/zAlweNy26/ts-cat/commit/b6a7e79))
- Update deps and overall code ([3e1a9a0](https://github.com/zAlweNy26/ts-cat/commit/3e1a9a0))
- Improve codebase ([5f32f25](https://github.com/zAlweNy26/ts-cat/commit/5f32f25))
- Small tweaks and update deps ([48e846c](https://github.com/zAlweNy26/ts-cat/commit/48e846c))
- Small updates ([9b25b1f](https://github.com/zAlweNy26/ts-cat/commit/9b25b1f))
- Remove unused css ([4a31091](https://github.com/zAlweNy26/ts-cat/commit/4a31091))
- Bun-related updates ([8b04e99](https://github.com/zAlweNy26/ts-cat/commit/8b04e99))
- Update unauthorized error ([3726619](https://github.com/zAlweNy26/ts-cat/commit/3726619))
- Add getters for WhiteRabbit and RabbitHole ([d2d6ff3](https://github.com/zAlweNy26/ts-cat/commit/d2d6ff3))
- Small tweaks ([20705ea](https://github.com/zAlweNy26/ts-cat/commit/20705ea))

### ✅ Tests

- Temporary bypass bun tests ([0ae3cd5](https://github.com/zAlweNy26/ts-cat/commit/0ae3cd5))

### 🎨 Styles

- Fix readmes ([37720be](https://github.com/zAlweNy26/ts-cat/commit/37720be))

### 🤖 CI

- Add typecheck ([b76e69f](https://github.com/zAlweNy26/ts-cat/commit/b76e69f))
- Update workflow ([3f1f039](https://github.com/zAlweNy26/ts-cat/commit/3f1f039))

### ❤️ Contributors

- Dany <zdanymc@gmail.com>
- ZAlweNy26 <zdanymc@gmail.com>

## v1.2.6

[compare changes](https://github.com/zAlweNy26/ts-cat/compare/v1.2.5...v1.2.6)

### 🚀 Enhancements

- Refactor database instance ([6d141bf](https://github.com/zAlweNy26/ts-cat/commit/6d141bf))
- Add source query param to chunk upload ([4e8cbef](https://github.com/zAlweNy26/ts-cat/commit/4e8cbef))
- Add new database keys and fix defaults ([7809128](https://github.com/zAlweNy26/ts-cat/commit/7809128))

### 🩹 Fixes

- Fix routes schemas ([4957199](https://github.com/zAlweNy26/ts-cat/commit/4957199))
- Fix boolean coercion ([dbddd89](https://github.com/zAlweNy26/ts-cat/commit/dbddd89))
- Fix error schema in endpoints ([6134b93](https://github.com/zAlweNy26/ts-cat/commit/6134b93))
- Improve json tool parser ([2ba8660](https://github.com/zAlweNy26/ts-cat/commit/2ba8660))
- **RabbitHole:** Fix documents splitting, rename hooks ([87e3afe](https://github.com/zAlweNy26/ts-cat/commit/87e3afe))

### 📖 Documentation

- Add missing jsdocs ([513abf5](https://github.com/zAlweNy26/ts-cat/commit/513abf5))

### 🏡 Chore

- Update eslint rules ([431108b](https://github.com/zAlweNy26/ts-cat/commit/431108b))
- Halve chunk size and overlap ([7ab22e1](https://github.com/zAlweNy26/ts-cat/commit/7ab22e1))

### ❤️ Contributors

- ZAlweNy26 <zdanymc@gmail.com>

## v1.2.5

[compare changes](https://github.com/zAlweNy26/ts-cat/compare/v1.2.4...v1.2.5)

### 🚀 Enhancements

- Nodemon now watches also .env file ([4fd3bc5](https://github.com/zAlweNy26/ts-cat/commit/4fd3bc5))
- Use json in tool prompt ([3ab5159](https://github.com/zAlweNy26/ts-cat/commit/3ab5159))

### 🩹 Fixes

- Fix missing routes validations ([ba8ee05](https://github.com/zAlweNy26/ts-cat/commit/ba8ee05))
- Fix log level order ([550e48a](https://github.com/zAlweNy26/ts-cat/commit/550e48a))

### 🏡 Chore

- Rename CatTool options ([cfaa9a3](https://github.com/zAlweNy26/ts-cat/commit/cfaa9a3))

### ❤️ Contributors

- ZAlweNy26 <zdanymc@gmail.com>

## v1.2.4

[compare changes](https://github.com/zAlweNy26/ts-cat/compare/v1.2.3...v1.2.4)

### 🚀 Enhancements

- Improve OpenAPI schema with Zod ([9375bf0](https://github.com/zAlweNy26/ts-cat/commit/9375bf0))
- **Form:** Improve class management ([1713123](https://github.com/zAlweNy26/ts-cat/commit/1713123))

### 📖 Documentation

- **RabbitHole:** Add JSDoc to methods ([9c0bca5](https://github.com/zAlweNy26/ts-cat/commit/9c0bca5))

### 🏡 Chore

- Clean Swagger UI css file ([811a014](https://github.com/zAlweNy26/ts-cat/commit/811a014))
- Small Zod fixes ([0a4d800](https://github.com/zAlweNy26/ts-cat/commit/0a4d800))
- General fixes ([2fc986a](https://github.com/zAlweNy26/ts-cat/commit/2fc986a))
- **RabbitHole:** Update hooks logic ([2a13a66](https://github.com/zAlweNy26/ts-cat/commit/2a13a66))

### ❤️ Contributors

- ZAlweNy26 <zdanymc@gmail.com>

## v1.2.3

[compare changes](https://github.com/zAlweNy26/ts-cat/compare/v1.2.2...v1.2.3)

### 🚀 Enhancements

- **MadHatter:** Add 3 new hooks: #17 ([#17](https://github.com/zAlweNy26/ts-cat/issues/17))
- **Plugin:** `getPluginInfo` is now specific ([fec1eb1](https://github.com/zAlweNy26/ts-cat/commit/fec1eb1))
- **Plugin:** Revert loading of manifest and settings to be sync ([ef6f67f](https://github.com/zAlweNy26/ts-cat/commit/ef6f67f))
- **Memory:** Add route to retrieve documents by metadata ([1532d3d](https://github.com/zAlweNy26/ts-cat/commit/1532d3d))
- **Plugin:** Add defaults to settings schema ([9042a97](https://github.com/zAlweNy26/ts-cat/commit/9042a97))

### 🩹 Fixes

- Try to fix [#12] ([#12](https://github.com/zAlweNy26/ts-cat/issues/12))

### 📖 Documentation

- **Plugin:** Update README ([90a9820](https://github.com/zAlweNy26/ts-cat/commit/90a9820))
- Update README ([599f618](https://github.com/zAlweNy26/ts-cat/commit/599f618))

### 🏡 Chore

- Update Swagger UI css ([6631b0a](https://github.com/zAlweNy26/ts-cat/commit/6631b0a))
- Update Swagger UI config ([de1bdaa](https://github.com/zAlweNy26/ts-cat/commit/de1bdaa))

### ✅ Tests

- Add sample files ([d039f26](https://github.com/zAlweNy26/ts-cat/commit/d039f26))

### ❤️ Contributors

- ZAlweNy26 <zdanymc@gmail.com>

## v1.2.2

[compare changes](https://github.com/zAlweNy26/ts-cat/compare/v1.2.1...v1.2.2)

### 🚀 Enhancements

- Add git pre-commit hook ([2b93bcf](https://github.com/zAlweNy26/ts-cat/commit/2b93bcf))
- Conversational forms now work ([060f2dc](https://github.com/zAlweNy26/ts-cat/commit/060f2dc))

### 🩹 Fixes

- Small form fixes ([e786c98](https://github.com/zAlweNy26/ts-cat/commit/e786c98))

### 📖 Documentation

- Add CONTRIBUTING and CODE OF CONDUCT ([533c4d0](https://github.com/zAlweNy26/ts-cat/commit/533c4d0))

### 🏡 Chore

- Update dependencies ([d24498d](https://github.com/zAlweNy26/ts-cat/commit/d24498d))

### ❤️ Contributors

- ZAlweNy26 <zdanymc@gmail.com>

## v1.2.1

[compare changes](https://github.com/zAlweNy26/ts-cat/compare/v1.2.0...v1.2.1)

### 🚀 Enhancements

- Easily get plugin info from stray cat #14 ([#14](https://github.com/zAlweNy26/ts-cat/issues/14))

### 🩹 Fixes

- Fix #15 ([#15](https://github.com/zAlweNy26/ts-cat/issues/15))

### ❤️ Contributors

- zAlweNy26 <zdanymc@gmail.com>

## v1.2.0

[compare changes](https://github.com/zAlweNy26/ts-cat/compare/v1.1.1...v1.2.0)

### 🚀 Enhancements

- Add save param for /chat endpoint ([8a1b2d4](https://github.com/zAlweNy26/ts-cat/commit/8a1b2d4))
- Add Zod in the database config ([1e6762f](https://github.com/zAlweNy26/ts-cat/commit/1e6762f))
- Add instant tool call syntax ([d7255c8](https://github.com/zAlweNy26/ts-cat/commit/d7255c8))
- Toggle procedures via endpoint ([756c1ad](https://github.com/zAlweNy26/ts-cat/commit/756c1ad))
- Add web parsers ([74b6ab8](https://github.com/zAlweNy26/ts-cat/commit/74b6ab8))

### 🩹 Fixes

- Small code improvements ([b2179ca](https://github.com/zAlweNy26/ts-cat/commit/b2179ca))
- Improve hooks map type ([2a694c5](https://github.com/zAlweNy26/ts-cat/commit/2a694c5))

### 💅 Refactors

- Removed automatic embedder selection ([6af0bcf](https://github.com/zAlweNy26/ts-cat/commit/6af0bcf))

### 📖 Documentation

- Update README.md ([ec58341](https://github.com/zAlweNy26/ts-cat/commit/ec58341))

### 🌊 Types

- Add AgentFastReply interface ([cceb122](https://github.com/zAlweNy26/ts-cat/commit/cceb122))

### 🏡 Chore

- Add `from` property in hooks ([a803a2a](https://github.com/zAlweNy26/ts-cat/commit/a803a2a))
- Change procedures casing (snake to kebab) ([6346c13](https://github.com/zAlweNy26/ts-cat/commit/6346c13))
- Update deps ([bee8219](https://github.com/zAlweNy26/ts-cat/commit/bee8219))
- Improve rabbit hole error handling ([28cf108](https://github.com/zAlweNy26/ts-cat/commit/28cf108))

### 🎨 Styles

- Improve welcome log spacing ([727a1f9](https://github.com/zAlweNy26/ts-cat/commit/727a1f9))

### ❤️ Contributors

- zAlweNy26 <zdanymc@gmail.com>

## v1.1.1

[compare changes](https://github.com/zAlweNy26/ts-cat/compare/v1.1.0...v1.1.1)

### 🚀 Enhancements

- Add defaults in parsed env vars ([cb0e1f9](https://github.com/zAlweNy26/ts-cat/commit/cb0e1f9))
- Publicized ws queue on stray cat ([8efce56](https://github.com/zAlweNy26/ts-cat/commit/8efce56))
- Add MistralAI llm config ([b12a1b9](https://github.com/zAlweNy26/ts-cat/commit/b12a1b9))
- Add TogetherAI and Fireworks embedder configs ([c0a1a16](https://github.com/zAlweNy26/ts-cat/commit/c0a1a16))

### 🩹 Fixes

- Swagger server path ([45765dd](https://github.com/zAlweNy26/ts-cat/commit/45765dd))

### 📖 Documentation

- Update various READMEs ([8dbc1f6](https://github.com/zAlweNy26/ts-cat/commit/8dbc1f6))

### ✅ Tests

- Update test setup and add some utils tests ([ca121a8](https://github.com/zAlweNy26/ts-cat/commit/ca121a8))

### ❤️ Contributors

- zAlweNy26 <zdanymc@gmail.com>

## v1.1.0

[compare changes](https://github.com/zAlweNy26/ts-cat/compare/v1.0.2...v1.1.0)

### 🚀 Enhancements

- Use is-docker module ([cef18d7](https://github.com/zAlweNy26/ts-cat/commit/cef18d7))

### 🩹 Fixes

- [#4](https://github.com/zAlweNy26/ts-cat/issues/4) and [#5](https://github.com/zAlweNy26/ts-cat/issues/5)
- Util verbosity and swagger server url ([18d6521](https://github.com/zAlweNy26/ts-cat/commit/18d6521))
- [#3](https://github.com/zAlweNy26/ts-cat/issues/3)

### ❤️ Contributors

- zAlweNy26 <zdanymc@gmail.com>

## v1.0.2

[compare changes](https://github.com/zAlweNy26/ts-cat/compare/v1.0.1...v1.0.2)

### 🚀 Enhancements

- Add string comparison util ([cfa747c](https://github.com/zAlweNy26/ts-cat/commit/cfa747c))

### 🩹 Fixes

- Docker setup ([0e38407](https://github.com/zAlweNy26/ts-cat/commit/0e38407))

### ❤️ Contributors

- zAlweNy26 <zdanymc@gmail.com>

## v1.0.1

[compare changes](https://github.com/zAlweNy26/ts-cat/compare/v1.0.0...v1.0.1)

### 🚀 Enhancements

- Add CI workflow ([dcd61b6](https://github.com/zAlweNy26/ts-cat/commit/dcd61b6))

### 🩹 Fixes

- Update plugin requirements installation ([9f82886](https://github.com/zAlweNy26/ts-cat/commit/9f82886))
- Fastify log levels ([8ea41f0](https://github.com/zAlweNy26/ts-cat/commit/8ea41f0))

### 📖 Documentation

- Update README ([66707ab](https://github.com/zAlweNy26/ts-cat/commit/66707ab))

### ❤️ Contributors

- zAlweNy26 <zdanymc@gmail.com>

## v1.0.0

### 🏡 Chore

- **release:** V1.0.0 ([d98df6b](https://github.com/zAlweNy26/ts-cat/commit/d98df6b))

### ❤️ Contributors

- zAlweNy26 <zdanymc@gmail.com>

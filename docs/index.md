---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Cheshire Cat AI"
  text: "Every adventure requires a first step"
  tagline: "\"Alice's Adventures in Wonderland\" by Lewis Carroll"
  image:
    dark: /logo-dark.svg
    light: /logo-light.svg
    alt: Cheshire Cat AI logo
  actions:
    - theme: brand
      text: Documentation
      link: /introduction
    - theme: alt
      text: API Reference
      link: /api

features:
  - title: API first
    icon: "⚡️"
    details: "Chat with the Cat and interact with its endpoints!"
  - title: Supports any language model
    icon: "🌍"
    details: "Works with OpenAI, Google, Ollama, HuggingFace, custom services and many others"
  - title: "100% dockerized"
    icon: "🐋"
    details: "Docker composes for development and production"
  - title: Remembers conversations and documents
    icon: "🐘"
    details: "Ground the model based on your knowledge base with the power of RAG"
  - title: Extensible via plugins
    icon: "🚀"
    details: "Write your first plugin, your imagination is the limit!"
  - title: Function calling (tools), conversational forms and more
    icon: "🏛️"
    details: "Extend your app with experimental features like forms!"
---

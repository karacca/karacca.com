---
title: Nami
description: An AI assistant for iPhone. GPT, Claude, Gemini, Grok and more in one app, with one subscription.
year: 2026
company: Wite
role: Founding developer
links:
  website: https://nami.chat
  appStore: https://apps.apple.com/app/id6749753781
detail: true
impact: 4
highlights:
  - value: 9
    label: AI providers in one app
  - value: 7
    label: languages
  - value: 3
    label: major versions in 2026
icon:
  src: ./nami/icon.png
screens:
  - src: ./nami/store-1.webp
    alt: Nami App Store screenshot reading All AI models one place, with AI provider logos above a figure standing under the Milky Way.
  - src: ./nami/store-2.webp
    alt: Nami App Store screenshot about switching between AI models anytime, with a list of providers next to the chat composer.
  - src: ./nami/store-3.webp
    alt: Nami App Store screenshot about chat history, with one question answered by Claude Haiku and then GPT-5 Nano.
  - src: ./nami/store-4.webp
    alt: Nami App Store screenshot about switching to the right AI when needed, with the model picker open over a chat.
---

Nami puts the major AI models in one app. Instead of paying for each one separately, you get one subscription and talk to models from OpenAI, Anthropic, Google, xAI, Meta, DeepSeek, Qwen, Mistral and Perplexity. You can switch models in the middle of a chat, or ask several at once and compare their answers.

It is on the App Store for iPhone in seven languages, and an Android version is on the way.

## What I did

I started Nami at Wite in October 2025 and built the first version with one other developer: a React Native app with Expo, and a Convex backend that talked to each AI provider. It reached the App Store in January 2026.

2.0 followed in April, a new design with sheets for picking models, chat history and settings, and I built most of it. For 3.0 we started over on a new architecture. I wrote the product spec it was built from, screen by screen, and the team built it over August and September. It reached the App Store in October 2026.

## The app

- **Models.** A sheet lists every model with its cost and the plan it needs, filtered by provider or by tag. With several models picked, each answer gets its own pane, and you switch between them.
- **Switching.** A model that joins a chat midway sees every user message but only its own answers, never another model's.
- **Projects.** Chats grouped with shared files and instructions.
- **Memory.** Every two hours a job reads your chats and keeps a few short notes about you, which every model gets as context. You can see and delete them in settings.
- **Tools.** Web search, reading a web page and image generation can be switched on for any model that supports tools. Video generation sends one prompt to up to four video models, each in its own pane.
- **Voice.** Dictate a message, or have an answer read aloud.
- **Library.** Every file you uploaded and every image or video the models made, in one list.

Every model costs credits, and the Free, Plus and Premium plans set how many you get.

## How it is built

- One Expo codebase for iOS, Android and the website, which is exported as static pages.
- The backend runs on Convex. Answers are written to the database as they stream, and the app follows them through a live query instead of reading the response itself.
- The first versions called each provider's API directly. 3.0 goes through OpenRouter, and the model list, with prices and capabilities, is synced from its catalog.
- Credits and limits are checked on the server. The app shows them but never decides.
- Sign-in is with Apple or Google, and subscriptions run through Adapty.

## Nami on Android

The Android course I gave with MultiGroup Community, [Advanced Android: From Code to Production](/writing/advanced-android-from-code-to-production), is also built around Nami. Every topic in it is applied to an Android version of the app, built from the ground up.

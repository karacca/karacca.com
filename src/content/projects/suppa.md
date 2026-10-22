---
title: Suppa
description: A no-code platform for building AI chatbots that answer customers and act on your systems, on the web and in mobile apps.
year: 2025
company: Wite
role: Development lead
links:
  website: https://www.suppa.ai
  github: https://github.com/witetech/suppa-android
detail: true
impact: 3
highlights:
  - value: 1 call
    label: to put a chatbot in an Android app
  - value: 2 days
    label: before launch, the SDK was on Maven Central
icon:
  src: ./suppa/icon.png
gallery:
  - src: ./suppa/canvas.png
    alt: The Suppa chatbot editor, a canvas of connected nodes that branch on what the user wants, wait for input, hand the chat to the AI, send a message and call an image generation API, with the node library open on the right.
    caption: The canvas, where a chatbot's flow is drawn.
---

Suppa lets a business build an AI chatbot for customer support without writing code. You give it your documents, draw how a conversation should go, connect your own APIs, and put the chatbot on your website or in your mobile app. It answers questions from what you gave it and can act on your systems, like checking an order or booking a call.

We built it at Wite as our own product. I led its development, and I built its mobile SDKs. It launched in August 2024.

## The platform

- **Knowledgebase.** Files like PDF, Word, PowerPoint and Excel, links to web pages, YouTube videos and cloud drives, or plain text. The chatbot answers from them.
- **Canvas.** A drag-and-drop editor for the flow of a conversation. Nodes branch on what the user picks, wait for input, send a message, search the knowledgebase, call an API, or hand the chat over to the AI.
- **Actions.** Your own API endpoints, registered with their OpenAPI schema. The AI calls them when a conversation needs them, or a canvas node calls them directly, from the browser or from the server.
- **Install.** One script tag on a website, with guides for the common frameworks and site builders, or an SDK in a mobile app.

## The Android SDK

The SDK puts a Suppa chatbot inside an Android app with one call:

```kotlin
launchSuppa(apiKey = "your-api-key")
```

It opens a full-screen chat, written in Kotlin with Jetpack Compose and Ktor. The chatbot's name, colors, icon and branding come from the dashboard, so the chat looks the way the business set it up on the web. Replies render Markdown. A small toolbox app in the same repo lists the chatbots and opens any of them.

Its first version reached Maven Central two days before launch. The source is on [GitHub](https://github.com/witetech/suppa-android).

---
title: Clarvia
description: A Turkish voice assistant for an electricity distributor's call center that takes outage calls from the greeting to the fault ticket.
year: 2026
company: Wite
role: Project lead
links:
  website: https://clarvia.tech
detail: true
impact: 4
highlights:
  - value: 12/12
    label: test calls with the same outcome as a human agent
icon:
  src: ./clarvia/icon.png
gallery:
  - src: ./clarvia/dashboard.png
    alt: The Clarvia dashboard in Turkish, with active calls, calls since the start of the day and calls handed to agents, a chart of call categories led by outages and faults, and a monthly chart comparing calls finished by the assistant, by agents and transferred.
    caption: The dashboard, with today's calls and how many the assistant finished on its own.
  - src: ./clarvia/canvas.png
    alt: The flow editor in Turkish with an outage report flow on a canvas, where a start node branches into conditions, an agent transfer and an API call, next to a block library of AI reply, condition, knowledge search, agent transfer, API request and data form.
    caption: The flow editor, with the block library on the left.
  - src: ./clarvia/calls.png
    alt: The call history in Turkish, with call volume, average duration and satisfaction score, a chart of calls by hour, and a search by customer name, phone number or call ID with date filters.
    caption: Call history, with the busiest hours of the day.
---

Clarvia is a voice assistant for call centers, built for Turkish and for electricity distribution. Its first customer is Dicle Elektrik, which distributes power across six provinces in southeastern Türkiye. When someone calls to report a power cut, the assistant takes the call, finds the address, checks for planned outages and opens the fault ticket, so agents are free for the calls that need a person.

It's a two-year R&D project, funded through the R&D program of EPDK, Türkiye's energy market regulator, and started in March 2025. We build it at Wite: the speech and language models, the platform around them, a web panel, and SDKs for mobile apps. I lead the project, and I built the Android SDK.

## A power cut, start to finish

The call center's phone menu sends outage calls to the assistant. From there:

1. It greets the caller within a second, then checks that the call is really about an outage. If it isn't, the call goes back to the menu.
2. It looks up the caller's number, reads the address on record back and asks if it's right. If there's no address, or it's wrong, it asks for the installation number and looks that up instead. It never guesses an address.
3. It checks for planned outages at that address. If there is one, it tells the caller and asks if they still want to report.
4. Once the caller confirms, it opens the ticket and reads out the ticket number.

If a caller asks for a person, the assistant tries twice to help and then transfers the call. If opening the ticket fails, it transfers too, and the agent's screen shows what was said so far. It stays calm, gives no personal advice and has no opinions on politics or other companies, however hard a caller pushes.

## The platform

- **Agents.** Each one has a persona, rules, a voice, its own knowledge base and the integrations it may use.
- **Flows.** A canvas of nodes for speech recognition, the language model and speech synthesis, plus inputs and outputs, branches that run in parallel, loops, waits and integration calls. You can test a flow by talking to it in the browser.
- **Knowledge base.** Documents an agent answers from, and only its own.
- **Integrations.** The company's systems become tools the model can call: subscriber lookup, address lookup, planned outages and fault tickets. An agent sees only the operations it's allowed, and a failing system never drops the call.
- **Call history.** Every call with its transcript, summary, recording, sentiment and outcome: resolved, transferred or abandoned.
- **Analytics.** Call volume, categories, how many calls the assistant finished on its own, and the busiest hours.

The speech and language models are open source, fine-tuned for Turkish phone calls. All data stays in Türkiye, and call recordings never leave local servers.

## The Android SDK

Dicle Elektrik already has a mobile app, so instead of a new app, the project ships SDKs that put the assistant inside it. The Android SDK needs three calls:

```kotlin
Clarvia.init(apiToken = "your-api-token")
val agents = Clarvia.listAgents()
Clarvia.startChat(context, agents.first())
```

`startChat` opens a full-screen chat, written in Kotlin with Jetpack Compose and OkHttp. You can type, or tap the mic and talk. The SDK records 16 kHz audio with the phone's echo cancellation and noise suppression and streams it over a WebSocket in 200 ms chunks. The server decides when you've finished talking, and the reply comes back as text and audio. Start talking over the assistant and its voice stops right away. It runs on Android 5.0 and up, and a sample app in the same repo lists the agents and opens any of them.

## Where it stands

In July 2026 the assistant was tested on ten real outage calls from the call center's archive and two edge cases, replayed as text. In all twelve, it reached the same outcome as the agent who took the real call.

As of October 2026, the work is on recognizing phone and installation numbers more reliably, on noticing sooner when a caller interrupts, and on connecting the assistant to the call center's phone system. The project runs until March 2027.

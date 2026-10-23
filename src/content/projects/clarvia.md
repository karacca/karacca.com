---
title: Clarvia
description: A Turkish voice assistant for an electricity distributor's call center that takes outage calls from the greeting to the fault ticket.
year: 2026
company: Wite
role: Project Lead
links:
  website: https://clarvia.tech
impact: 7
published: false
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

Clarvia is a voice assistant for call centers, built for Turkish and for electricity distribution. It is made to take the calls that follow a power cut, find the caller's address and open the fault ticket, so agents are free for the calls that need a person.

## What I did

We build Clarvia at Wite: the speech and language models, the platform around them, a web panel, and SDKs for mobile apps.

- **Project.** I lead the project and the team behind it.
- **Android SDK.** I built the SDK that puts the assistant inside an existing app, as a chat you can type or talk to and interrupt mid-sentence.

## The platform

- **Agents.** Each one has its own persona, voice, knowledge base and the systems it may use.
- **Flows.** A visual editor for how a conversation goes, which you can test by talking to it in the browser.
- **Integrations.** The company's own systems, like address lookup and fault tickets, become tools the assistant can call.
- **Call history.** Every call with its transcript, summary and outcome, and how many the assistant finished on its own.

The models are tuned for Turkish phone calls and regional accents, and the platform can run on the company's own servers.

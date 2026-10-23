---
title: Moodstone
description: Animated, procedurally generated avatars for AI agents in React Native.
year: 2026
role: Author
links:
  website: https://moodstone.expo.app
  github: https://github.com/karacca/moodstone
impact: 3
icon:
  src: ./moodstone/icon.png
  dark: ./moodstone/icon-dark.png
gallery:
  - src: ./moodstone/cover.png
    alt: Rows of Moodstone avatars on a dark navy background, in every cut, mood and palette color.
    caption: Seven cuts, nine moods and twelve colors.
  - src: ./moodstone/moods.png
    dark: ./moodstone/moods-dark.png
    alt: The nine moods side by side, from idle, observing, thinking, processing and working to done, failed, invalid and inactive, each on a different cut and color.
    caption: The key pose of each mood. In the app, every one is a loop.
  - src: ./moodstone/studio.png
    dark: ./moodstone/studio-dark.png
    alt: The Studio at moodstone.expo.app with a sky blue hexagon in the thinking mood, controls for mood, motion, cut, color and tuning, and the matching code below the preview.
    caption: The Studio, running in the browser.
---

Moodstone gives an AI agent a face that shows what it is doing: idle, thinking, working, done or failed. Every avatar is generated, so two agents in the same color can still look different.

## What I did

Moodstone is a side project and a small step outside Android. I designed and built it, and released 1.0 in September 2026. The source is on [GitHub](https://github.com/karacca/moodstone) under the MIT license, and the package is on [npm](https://www.npmjs.com/package/moodstone).

The face, a single color with two eyes, comes from Plane's [Agent Avatar Lab](https://agents.plane.so/), and the idea that it should show what a long-running agent is doing comes from xAI's post on [designing Grok Bot](https://x.ai/news/designing-grok-bot). The surface, shapes, palette, timing and code are my own.

## The library

- **Moods.** Nine moods, from idle and thinking to done and failed, each a seamless loop.
- **Cuts.** Seven silhouettes, from circle to burst, that morph into one another.
- **Colors.** Twelve palette colors or any hex value, lit by a light that slowly orbits the surface.
- **Studio.** A [web page](https://moodstone.expo.app) for trying every mood, cut and color, where a link opens one exact avatar.

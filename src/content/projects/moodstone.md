---
title: Moodstone
description: Animated, procedurally generated avatars for AI agents in React Native.
year: 2026
role: Author
links:
  website: https://moodstone.expo.app
  github: https://github.com/karacca/moodstone
detail: true
impact: 2
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

Moodstone is a React Native library that draws animated avatars for AI agents. You give an agent a mood, and its face shows what the agent is doing: waiting, thinking, streaming an answer, done or failed. Every avatar is generated procedurally, drawn with React Native Skia and animated on the UI thread.

```tsx
import { Moodstone } from "moodstone";

<Moodstone color="pine" mood="thinking" size={48} />;
```

It is a side project and a small step outside Android. I released 1.0 in September 2026. The source is on [GitHub](https://github.com/karacca/moodstone) under the MIT license, and the package is on [npm](https://www.npmjs.com/package/moodstone).

## Moods

Each mood matches a moment in an agent's work:

- **idle**: ready, waiting for input.
- **observing**: reading context or waiting for a tool result.
- **thinking**: searching or making a short tool call.
- **processing**: reasoning at length.
- **working**: streaming output.
- **done**, **failed** and **invalid**: finished, errored, or rejected the input.
- **inactive**: offline or paused.

Every mood is a seamless loop, and it starts over from a rest pose when the mood changes. The face itself is a single color with two eyes, an idea from Plane's [Agent Avatar Lab](https://agents.plane.so/). Reading that face as what a long-running agent is doing came from xAI's post on [designing Grok Bot](https://x.ai/news/designing-grok-bot). The surface, shapes, palette, timing and code are my own.

## Cuts and colors

There are seven cuts, or silhouettes: circle, squircle, square, diamond, hexagon, badge and burst. One polar shape engine draws all of them, so changing the cut morphs one shape into the other, and the eyes move to fit each one. A cut can also be tuned, like a hexagon with five sides or a burst with more lobes. The `tune` prop only accepts what the cut exposes, so rotating a circle is a type error.

Colors come from a palette of twelve, or any hex value. The surface is a gradient lit by a light that slowly orbits it, with a fine grain on top. A seed sets where the light starts and how it drifts, so two agents in the same color can still look different.

## How it is built

- The avatar is drawn with React Native Skia and animated with Reanimated on the UI thread, so the JS thread stays idle.
- The shapes and timing live in `moodstone/core`, which has no React Native imports. Its `computeFrame` describes any moment of a loop as plain numbers, and both the Skia component and the SVG exports draw from it.
- A ref takes a PNG snapshot at any size. The SVG exports give a still or the whole loop as an animated SVG, and a small script exports them straight from the source.
- With `animated` off, the avatar draws one frame, the mood's key pose, which keeps long lists cheap.

## Studio

The repo has an Expo example app with a one-screen Studio for trying moods, cuts, colors and tuning. It also runs in the browser, where Skia draws through CanvasKit, and it is live at [moodstone.expo.app](https://moodstone.expo.app). Its state lives in the URL, so a link like [`?mood=failed&cut=burst&lobes=9`](https://moodstone.expo.app/?mood=failed&cut=burst&lobes=9) opens one exact avatar.

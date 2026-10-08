---
title: Moodstone
description: Animated, procedurally generated agent avatars for React Native.
year: 2026
links:
  website: https://moodstone.expo.app
detail: true
featured: true
order: 2
---

Moodstone is a React Native library that draws avatars for AI agents. Every avatar is generated procedurally, and you give it a mood so the face shows what the agent is doing: idle, thinking, working, done, failed and so on.

```tsx
import { Moodstone } from "moodstone";

<Moodstone color="pine" mood="thinking" size={48} />;
```

## What is in it

- Nine moods, each one a seamless loop.
- Seven silhouettes that morph into each other.
- Twelve palette colours, or any hex colour.
- Rendering with React Native Skia, animated on the UI thread.
- PNG and SVG exports, including an animated SVG of the full loop.

You can try every mood, shape and colour in the browser at [moodstone.expo.app](https://moodstone.expo.app). The source is on [GitHub](https://github.com/karacca/moodstone) and the package is on [npm](https://www.npmjs.com/package/moodstone).

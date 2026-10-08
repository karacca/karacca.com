---
title: Post template
description: A starting point for new posts. One or two sentences that say what the post is about.
date: 2026-10-01
updated: 2026-10-02
draft: true
---

Copy this file, rename it, and start writing. The file name becomes the address: `my-post.md` is published at `/writing/my-post`.

## Frontmatter

- `title` and `description` are required. The description is used for search results, link previews and the RSS feed.
- `date` is the publication date, written as `YYYY-MM-DD`.
- `updated` is optional. Set it when a post changes in a way readers should know about.
- `draft: true` keeps the post out of the production build and the feed. Remove the line to publish.

## Text

A paragraph with **strong text**, _emphasis_, `inline code` and a [link](https://example.com).

> A quote, for a line worth setting apart.

1. A numbered step
2. Another step

## Code

Name the language after the opening fence to get highlighting.

```kotlin
fun main() {
    println("Hello")
}
```

## Components

Rename the file to `.mdx` to use components inside the text.

```mdx
<Chip href="https://example.com">Label</Chip>
```

---
title: Beetle
description: Shake an Android app to send feedback, and it arrives in GitHub Issues with a screenshot and device details.
year: 2022
role: Author
links:
  github: https://github.com/karacca/beetle
impact: 3
icon:
  src: ./beetle/icon.png
screens:
  - src: ./beetle/feedback.png
    alt: The Send Feedback screen over a sample notes app, with the title Note count is wrong, the assignee karacca and the bug label selected, a short description, and checkboxes to attach the screenshot and system logs.
  - src: ./beetle/edit.png
    alt: The screenshot editor with a yellow and a black brush and an undo button, over a notes app screenshot where a name is blacked out and a yellow arrow points at the note count.
---

Beetle puts feedback where the work already happens. It is open source under the Apache 2.0 license.

## What I did

I started Beetle in July 2019 as a tool for QA teams that filed issues on GitHub, GitLab or Azure DevOps. In August 2022 I rewrote it from scratch as 2.0: GitHub only, with issues coming from a GitHub App, a redesigned feedback screen and screenshot editor, and a move to Maven Central.

## The library

- **Shake.** Shaking the device opens a small form for a title and a description.
- **Screenshot.** The current screen is attached, with a highlighter to point at the problem and a brush to hide personal details.
- **Device data.** The app version, device model, Android version and language, plus any keys you add. The reporter can see this list and leave it out.
- **Assignees and labels.** The repository's collaborators and labels, so the reporter can assign and label the issue.

[This issue](https://github.com/karacca/beetle/issues/30) was sent from the sample app, and setup is in the [README](https://github.com/karacca/beetle).

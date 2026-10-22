---
title: Beetle
description: Shake an Android app to send feedback, and it arrives in GitHub Issues with a screenshot and device details.
year: 2022
role: Author
links:
  github: https://github.com/karacca/beetle
detail: true
impact: 2
icon:
  src: ./beetle/icon.png
screens:
  - src: ./beetle/feedback.png
    alt: The Send Feedback screen over a sample notes app, with the title Note count is wrong, the assignee karacca and the bug label selected, a short description, and checkboxes to attach the screenshot and system logs.
  - src: ./beetle/edit.png
    alt: The screenshot editor with a yellow and a black brush and an undo button, over a notes app screenshot where a name is blacked out and a yellow arrow points at the note count.
---

Beetle is an Android library for sending feedback without leaving the app. You shake the phone, write what went wrong, and the report becomes an issue in the app's GitHub repository, with a screenshot and the details of the device. Feedback ends up where the work already happens.

I started it in July 2019 and rewrote it from scratch in the summer of 2022. It is open source under the Apache 2.0 license, and it is published on Maven Central as `com.karacca:beetle`.

## How it works

- **Shake.** Shaking the device shows a small prompt to send feedback.
- **Report.** A title and a description. The send button stays off until both are filled in.
- **Screenshot.** The current screen is captured and attached. Tapping it opens an editor with a yellow highlighter and a black brush, to point at the problem or hide personal details.
- **Device data.** The app ID, version and build type, the device model, the Android version, the language and the screen size, plus any keys you add yourself, like a user ID. The person sending the report can see this list and leave it out.
- **Assignees and labels.** The repository's collaborators and labels show up as chips, so the reporter can assign and label the issue. Both can be turned off.
- **Done.** A notification links to the new issue.

The issue is plain Markdown: the description, a table of app and device data, a table of your own keys, and the screenshot. [This one](https://github.com/karacca/beetle/issues/30) was sent from the sample app above.

## Setup

Install the [Beetle GitHub App](https://github.com/marketplace/beetle-app) on the repository, which creates the issues, then add the dependency and start Beetle in your `Application`:

```kotlin
class MyApplication : Application() {

    override fun onCreate() {
        super.onCreate()
        Beetle.init(this, "username", "repository")
    }
}
```

Options and extra data go through `configure`:

```kotlin
Beetle.configure {
    enableAssignees = true
    enableLabels = true
    key("user_id", user.id)
}
```

## Two versions

The first version was a tool for QA teams. It filed issues on GitHub, GitLab or Azure DevOps with an access token passed in at startup, and it was published through JitPack.

Version 2.0, in August 2022, narrowed it to GitHub. Issues come from the GitHub App instead of a token, the feedback screen and screenshot editor were redesigned, and the library moved to Maven Central.

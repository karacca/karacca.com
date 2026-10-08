---
title: Beetle
description: Collect feedback and bug reports from your Android apps into GitHub Issues.
year: 2019
links:
  website: https://github.com/karacca/beetle
detail: true
featured: true
order: 2
---

Beetle is an Android library that lets people send feedback from inside an app. The report is created as an issue in your GitHub repository, so feedback ends up where the work already happens.

## How it works

- A shake gesture starts the feedback flow.
- The user writes a title and a description.
- A screenshot of the current screen is attached, and the user can edit it first.
- Device information is collected, and you can add your own key and value pairs.
- Assignees and labels can be picked if you turn them on.

Issues are created through a GitHub App that you install on the repository.

```kotlin
class MyApplication : Application() {

    override fun onCreate() {
        super.onCreate()
        Beetle.init(this, "username", "repository")
    }
}
```

Beetle is open source under the Apache 2.0 license and published on Maven Central as `com.karacca:beetle`.

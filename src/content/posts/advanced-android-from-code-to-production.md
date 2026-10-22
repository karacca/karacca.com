---
title: "Advanced Android: From Code to Production"
description: The Android course I gave with MultiGroup Community, the app it's built around, and what each module covers.
date: 2026-05-15T17:00:00Z
---

In May and June I gave an online course with [MultiGroup Community](https://www.linkedin.com/company/devmultigroup) called Advanced Android: From Code to Production. I taught four lessons in it: an opening session, then one each on architecture, Kotlin and accessibility. This post is the written version of the opening session. The other three have their own posts:

- [Architecture and Design Patterns on Android](/writing/android-architecture-and-design-patterns)
- [Kotlin Deep Dive](/writing/kotlin-deep-dive)
- [Accessibility in Jetpack Compose](/writing/accessibility-in-jetpack-compose)

You can find the [slides for this session](https://github.com/karacca/nami-android/blob/master/presentations/output/0-course-outline.pdf) on GitHub, along with everything else in the [course repo](https://github.com/karacca/nami-android).

## Who it's for

The course goes past the basics. It's for an intermediate developer who wants to solidify their foundations, or an experienced engineer who wants to level up. It covers the whole range of modern Android development, from architecture and the language itself to shipping and monetizing a real app.

Every topic is approached with a practical, industry-focused mindset. The goal is that what you learn applies directly to the apps you build and the teams you work in.

## Built around a real app

The course is built around Nami, a unified AI chat app that brings all the major LLMs into a single, seamless experience. Rather than isolated examples, every concept is applied directly to a production-grade codebase as Nami is built from the ground up.

By the end, you don't just have knowledge. You have a fully functional, shippable app, and the confidence to apply everything you've learned to your own projects.

## The modules

1. **Architecture & Design Patterns.** MVC, MVP, MVVM and MVI with their trade-offs, MVVM and state management, Clean Architecture, use cases, dependency injection, navigation, error handling strategies, modularization, dynamic feature modules, and sharing business logic with Kotlin Multiplatform.
2. **Kotlin Deep Dive.** The type system and null safety, scope functions, collections and functional patterns, extension functions, sealed classes, error handling, delegates, generics, inline functions, operator overloading, coroutines, Flow, DSLs, contracts, reflection and annotations, and `expect`/`actual`.
3. **Jetpack Compose & Accessibility.** Compose fundamentals, layouts and lazy lists, state and side effects, gestures, custom drawing, theming and Material 3, animation, adaptive UI, localization, navigation, View interop, testing and performance. Then TalkBack, content descriptions, semantics, touch targets, font scaling, color contrast and accessibility testing.
4. **Networking, Data & Persistence.** Retrofit, OkHttp and kotlinx.serialization, REST vs GraphQL, caching and interceptors, Firebase (Firestore, Auth, push notifications, Remote Config, Cloud Functions), Room, DataStore, encrypted preferences, offline-first architecture, database migrations, and Ktor and SQLDelight for KMP.
5. **Performance, Optimization & Background Work.** App startup, memory, recomposition, profiling, network efficiency, APK size, Baseline Profiles, LeakCanary, WorkManager, foreground services, AlarmManager, battery optimization and Doze.
6. **Security & Testing.** Encrypted storage, biometric authentication, SSL pinning, R8, secure coding and API key management. Then unit tests, Espresso and Compose UI tests, MockK, TDD, integration tests, coverage, and shared test logic in KMP.
7. **Publishing, DevOps & Monetization.** CI/CD with GitHub Actions, Firebase App Distribution, Play Store releases, versioning, signing, Crashlytics, build variants, Detekt and Lint, in-app purchases and subscriptions with Play Billing, AdMob, A/B testing, and publishing shared KMP modules.

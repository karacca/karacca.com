---
title: Owlio
description: An app for Türkiye's English exams, YDS, YDT and YÖKDİL, with real past questions and AI-written practice sets.
year: 2024
company: Wite
role: Mobile lead
links:
  appStore: https://apps.apple.com/tr/app/id6475001698
  googlePlay: https://play.google.com/store/apps/details?id=tech.wite.quiz
detail: true
impact: 2
highlights:
  - value: 3
    label: developers on the 2.0 team I led
  - value: 3 months
    label: to rebuild it as 2.0
icon:
  src: ./owlio/icon.png
screens:
  - src: ./owlio/store-1.webp
    alt: Owlio App Store screenshot in Turkish about questions made for you, with an English reading question and its answer choices next to the owl mascot.
  - src: ./owlio/store-2.webp
    alt: Owlio App Store screenshot with the Owlio logo and the owl mascot, next to the home screen with the days left until the YDS exam, AI question sets and the daily streak.
  - src: ./owlio/store-3.webp
    alt: Owlio App Store screenshot in Turkish about the leaderboard, with the top three on a podium and the weekly ranking below.
  - src: ./owlio/store-4.webp
    alt: Owlio App Store screenshot in Turkish about past exam questions, with a list of 2021 YDS sessions to start or continue.
  - src: ./owlio/store-5.webp
    alt: Owlio App Store screenshot in Turkish about analytics, with a weekly success rate chart and statistics by category.
---

Owlio is an app for Türkiye's English exams: YDS, YDT and YÖKDİL. You solve real questions from past exams, and practice with sets an AI writes around your level and the topics you get wrong. Every answer comes with an explanation.

We built it at Wite, where it started out as Quiz. It took the name Owlio and its owl mascot in 2026. The app is in Turkish and English.

## What I did

I built the first version in Flutter at the end of 2023, while a colleague wrote the backend that generated the questions. It reached the App Store in April 2024.

In August 2024 we started over for 2.0, and I led it with a team of three developers. I set up the new project and its architecture, reviewed the team's pull requests, and built the onboarding, the quiz with its summary and explanations, sign-in and the connection to the backend, and the screens for updates and lost connections. 2.0 shipped at the end of October, and I kept releasing updates through November. The team went on to add the leaderboard and analytics in 2025.

## The app

- **Exams.** Pick one or more exams at onboarding and switch between them. Each shows a countdown to its date.
- **Past exams.** Real questions from past sessions, listed by session. You can leave one halfway and continue later.
- **AI sets.** Ten questions at a time, picked for your level and your weakest topics: vocabulary, grammar, reading, translation, paragraph and dialogue completion.
- **Explanations.** After each answer, why the right choice is right. A grammar error or a wrong answer key can be reported from the question.
- **Credits.** AI questions use credits. Question packs are sold in the app, and keeping a daily streak earns ten free questions.
- **Leaderboard and analytics.** Weekly, monthly and all-time rankings, and your success rate by day and by topic.

## How it is built

- One Flutter codebase for iOS and Android. 2.0 uses BLoC with Cubits, repositories behind interfaces, and get_it for dependency injection.
- Everything else is Firebase: anonymous sign-in, Cloud Functions for every call the app makes, Remote Config to force updates, Crashlytics and Analytics.
- In the first version, each question type had its own OpenAI model and prompt. Every user had a score for each type, and questions came at a difficulty that followed their lowest score, leaning toward their weakest type.
- Credit packages are consumable in-app purchases, through Flutter's `in_app_purchase` plugin.

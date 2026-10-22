---
title: Etnospor
description: The World Ethnosport Confederation's app for traditional sports, with its event calendar, festival points and a leaderboard.
year: 2025
company: Wite
role: Mobile developer
links:
  appStore: https://apps.apple.com/tr/app/id1583600631
  googlePlay: https://play.google.com/store/apps/details?id=org.worldethnosport.android
detail: true
impact: 2
highlights:
  - value: 10K+
    label: downloads on Google Play
  - value: 2
    label: Ethnosport Culture Festivals, 2024 and 2025
icon:
  src: ./etnospor/icon.png
screens:
  - src: ./etnospor/store-1.webp
    alt: An Aba wrestling event in Turkish, with its date and time, a description, a map and a button to join it.
    caption: "2021"
  - src: ./etnospor/store-2.webp
    alt: The 6th Ethnosport Culture Festival splash screen on a phone held in a hand.
    caption: "2024"
  - src: ./etnospor/store-3.webp
    alt: The points leaderboard in Turkish, with the top three visitors by their initials and a ranked list below.
    caption: "2024"
  - src: ./etnospor/store-4.webp
    alt: The home screen of the 7th festival in Turkish, with tiles for the QR code, the event calendar, the festival area, the leaderboard and announcements.
    caption: "2025"
---

Etnospor is the app of the World Ethnosport Confederation, an Istanbul-based organization that works to keep traditional sports and games alive. The app collects those sports, the confederation's news and the calendar of its events, including the Ethnosport Culture Festival. At the festival it also works as a game: visitors scan QR codes around the grounds to earn points and climb a leaderboard.

I built the Android app in the summer of 2021, while another developer built the iOS app. Both reached the stores on 9 November 2021. From 2022 I looked after both apps, and in 2024 and 2025, at Wite, I updated them for the 6th and 7th Ethnosport Culture Festivals. The app is in Turkish.

## The app

- **Sports.** Every traditional sport with its story, photos and upcoming events.
- **Calendar.** The year's events by day, filtered by tags. Each event has its time, its place on a map, a share button and a button to join it.
- **Announcements.** News from the confederation, with photos.
- **Festival area.** A map of the festival grounds.
- **Points.** Sign in with a phone number and an SMS code, then scan the QR codes at the festival. Each code gives its points once. Staff accounts get one more screen, where they look a visitor up by phone number and add or spend their points.
- **Leaderboard.** Added in 2024: the visitors with the most points, shown with their initials and shortened names.

## How it is built

- The Android app is written in Kotlin: one activity with fragments and the Navigation component, MVVM with data binding, and Hilt.
- The iOS app is written in Swift with the VIPER architecture.
- Everything else is Firebase: phone sign-in, Firestore for the sports, events, news and users, Storage for images, push notifications and Crashlytics.
- One settings document in Firestore controls both apps: the minimum version before an update is forced, which tabs are shown, the festival map, the onboarding images, social links, and whether the leaderboard is on.
- The leaderboard is worked out by a Firebase function. It reads every user's points, sorts them, and writes the ranking to a single document, so the apps read one document instead of every user. A second function resets everyone's points before a new festival.
- Google Play requires apps with accounts to offer account deletion on the web, so in 2024 I added a small Next.js page where users ask for their account to be deleted with their phone number.

## Releases

- **1.0**, November 2021: sports, the calendar, announcements, festival points and an entrance code to show at the gate.
- **1.0.4**, April 2024: current SDKs and new icons.
- **1.1**, May 2024: the 6th festival's look, a new home screen, the leaderboard and a privacy consent step at sign-up. The entrance code was removed.
- **1.2**, May 2025: the 7th festival's look and a fresh leaderboard.

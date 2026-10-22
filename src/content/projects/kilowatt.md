---
title: Kilowatt
description: Every EV charging station in Türkiye on one map, with sockets, prices and reviews from every operator.
year: 2026
company: Wite
role: Solo developer
links:
  website: https://kilowatt.com.tr
  appStore: https://apps.apple.com/tr/app/id6772964948
  googlePlay: https://play.google.com/store/apps/details?id=com.tr.kilowatt
detail: true
impact: 3
highlights:
  - value: 16.8K
    label: charging stations
  - value: 180+
    label: operators, each with its own app
icon:
  src: ./kilowatt/icon.png
screens:
  - src: ./kilowatt/store-1.webp
    alt: Kilowatt App Store screenshot in Turkish about the whole charging network in your pocket, with an illustrated car at a charger.
  - src: ./kilowatt/store-2.webp
    alt: Kilowatt App Store screenshot in Turkish about finding a nearby station, with the map full of operator logos.
  - src: ./kilowatt/store-3.webp
    alt: Kilowatt App Store screenshot in Turkish about station details, with a station sheet listing its CCS sockets.
  - src: ./kilowatt/store-4.webp
    alt: Kilowatt App Store screenshot in Turkish about photos and reviews, with a station's photo and a five-star review.
---

Kilowatt is an app for finding EV charging stations in Türkiye. There are more than 180 charging operators in the country, each with its own app and its own map. Kilowatt puts all of their stations on one map, about 16,800 of them, with their sockets, prices and reviews.

I started it at Wite in May 2026 and built it on my own: the app, the backend and the website. It reached the App Store and Google Play in June. The app is in Turkish.

## The app

- **Map.** Every station, marked with its operator's logo. Zoomed out, nearby stations merge into clusters. Filters narrow the map to AC, DC or HPC sockets, to one operator, or to your favorites.
- **Prices.** Each operator's price per kWh for AC, DC and HPC, on the map and on every station.
- **Stations.** A sheet with the address, the distance, every socket with its type and power, photos and reviews. Directions open in Apple or Google Maps, and you can call the operator from it.
- **Photos and reviews.** Anyone signed in can rate a station, write a review, or add a photo with the camera.
- **Search.** Find a station by name, or jump to any place on the map.
- **Account.** Sign in with a phone number and an SMS code, then add your name, email and invoice addresses.

## How it is built

- One Expo codebase for iOS, Android and the website, which is exported as static pages and served from EAS Hosting.
- The backend runs on Convex.
- Stations come from EPDK's public registry of licensed charging stations. A script imports them along with their operators and distribution companies, and precomputes clusters at three geohash precisions, so a zoomed-out map loads clusters instead of every station.
- Operator prices live in a seed file next to a link to each operator's tariff page, and the logos are their Play Store icons.
- SMS codes go through Twilio, emails through Resend, and feedback lands in Slack.

Starting a charge from the app, a route planner and connecting your car are planned next.

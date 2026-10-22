---
title: Gymshark Shop
description: Gymshark's shopping app, with new drops first, app-only collections, a wishlist and bookings at its stores.
year: 2024
company: RE Partners
role: Android developer
links:
  appStore: https://apps.apple.com/app/id1139155460
  googlePlay: https://play.google.com/store/apps/details?id=com.gymshark.store
detail: true
impact: 4
highlights:
  - value: 1M+
    label: downloads on Google Play
  - value: 4.9
    label: Google Play rating, from 25.4K reviews
  - value: 99.8%+
    label: crash-free users
  - value: 100%
    label: unit test coverage in every module
icon:
  src: ./gymshark-shop/icon.png
screens:
  - src: ./gymshark-shop/store-1.webp
    alt: Gymshark Shop Play Store screenshot about the latest products, with new releases on the explore screen.
  - src: ./gymshark-shop/store-2.webp
    alt: Gymshark Shop Play Store screenshot about featured favourites, with the product page of the Elevate leggings.
  - src: ./gymshark-shop/store-3.webp
    alt: Gymshark Shop Play Store screenshot about app exclusives, with a countdown to the next Dropset collection.
  - src: ./gymshark-shop/store-4.webp
    alt: Gymshark Shop Play Store screenshot about saving your favourites, with the wishlist in a grid.
  - src: ./gymshark-shop/store-5.webp
    alt: Gymshark Shop Play Store screenshot about booking an experience at a Gymshark store, with what's on at Regent Street.
  - src: ./gymshark-shop/store-6.webp
    alt: Gymshark Shop Play Store screenshot about staying connected, with sale and workout messages in the inbox.
---

Gymshark Shop is the shopping app of Gymshark, the UK fitness clothing brand. New drops land in the app first, some collections are sold only there, and you can keep a wishlist, read offers and news in an inbox, and book events at Gymshark's stores. It has more than a million downloads on Google Play.

## What I did

I joined the Android team in June 2023, through RE Partners, after six months on [Gymshark Training](/projects/gymshark-training), and stayed until late 2024, when I moved to [Qoluna](/projects/qoluna). The team was spread across time zones, and we worked closely with QA, product and design on every feature.

- **Product lists.** Star ratings on product cards, a banner to switch between grid and list views and open the filters, a gender filter on collections, and info tiles at the top of a collection, set up in Contentful, some with a discount code to copy.
- **Product page.** For the redesigned product page I built the size selector, with sold-out sizes and the size guide, the sheets for an item added to the bag, back-in-stock alerts and quantity limits, the feature facts, and the Klarna and Afterpay options. I also added the lowest price of the last 30 days.
- **Bag.** A progress bar toward free standard and then free express delivery, and product recommendations that save straight to the wishlist.
- **Inbox.** The inbox icon on the home screen, with a badge for unread messages.
- **Upkeep.** Moving the ViewModels of about ten modules to the team's new pattern, raising test coverage, fixing crashes, double taps and a memory leak, upgrading Kotlin, Compose and other libraries, and a script that pulls translations from Lokalise.

## How it is built

- Kotlin, in about a hundred Gradle modules. Most features are a pair: a `-component` module with the data and domain layers, and a `-ui` module with the screens.
- Screens are fragments with the Navigation component, and newer ones are written in Jetpack Compose on a shared design system. Dependency injection is Hilt.
- Shopify runs the store: products, accounts, the bag and checkout. Algolia powers search and product lists, Contentful the editorial content, Braze the inbox, and Intercom the support chat.
- Every module is held at 100% unit test coverage with Kover, builds and Google Play releases run on Bitrise, and crash-free users stay above 99.8%.

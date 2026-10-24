---
title: MASS
description: Türkiye's national electricity app. Usage, outages and complaints from all 21 distribution companies in one place.
year: 2026
company: Wite
role: Project Lead & Mobile Developer
links:
  website: https://massportal.com.tr
  appStore: https://apps.apple.com/tr/app/mass/id6744158894
  googlePlay: https://play.google.com/store/apps/details?id=tr.com.massportal
impact: 10
highlights:
  - value: 100K+
    label: downloads on Google Play
  - value: 138K+
    label: downloads on the App Store
  - value: e-Devlet
    label: sign-in through Türkiye's government gateway
  - value: 300+
    label: unit and widget tests
icon:
  src: ./mass/icon.png
screens:
  - src: ./mass/store-1.webp
    alt: MASS store screenshot in Turkish about keeping your energy data under control, with the app opening on a phone held in a hand.
  - src: ./mass/store-2.webp
    alt: MASS store screenshot in Turkish about managing subscriptions, with a home and a business subscription in the list.
  - src: ./mass/store-3.webp
    alt: MASS store screenshot in Turkish about filing complaints and requests, with the active complaints list.
  - src: ./mass/store-4.webp
    alt: MASS store screenshot in Turkish about querying your data, with the usage query form of a home subscription.
---

MASS, short for Milli Akıllı Sayaç Sistemi (National Smart Meter System), is EPİAŞ's platform for electricity consumers. Each distribution company has its own systems, website and call center. MASS lets you sign in once with e-Devlet and deal with all of them, without needing to know which company serves which address.

## What I did

We built MASS at Wite: the iOS and Android app, a web app, an admin panel for EPİAŞ, and the backend behind them. I led the project on our side and the mobile app.

- **Project.** Running the sprints, the demos and the acceptance testing with EPİAŞ.
- **Mobile app.** I built its first version in Flutter and have kept developing it since.
- **Launch.** Before the public pilot I audited the app end to end and fixed how it behaved on slow networks, with push notifications and on older Android phones.
- **Quality.** More than 300 unit and widget tests.

## The app

The app is in Turkish and English.

- **Subscriptions.** Add a home or business subscription by its installation number, and its details come live from the distribution company.
- **Usage.** Hourly to yearly readings, compared with your own past usage and with similar consumers nearby, and exported to PDF, Excel or CSV.
- **Outages and compensation.** Past outages for each subscription, and the compensation owed for long or frequent ones.
- **Complaints.** Requests go straight to the distribution company, and the replies come back into the app.
- **Notifications.** Alerts for outages, complaint updates, a usage limit you set yourself, and unexpected spikes.

## Twenty-one systems behind one screen

Every distribution company answers through its own systems, so the same request can come back in a different shape, slowly, or not at all. The app is built to stay useful when that happens: a missing value never empties a screen, a failed load offers a retry, and each feature can be switched on once the companies behind it are ready.

## Where it stands

The app reached the stores at the start of 2026. It opened to the public in September with six distribution companies, and the rest joined in October. I ship small releases every week or two.

---
title: "Never Trust the Delivery Time: Reliable Alarms on Android"
description: A post mortem on how Xiaomi sat on my alarm for an hour.
date: 2026-09-08
---

My [prayer times app](https://play.google.com/store/apps/details?id=com.tr.wite.vakitler) sends a notification before each prayer. Users pick an offset, "remind me 15 minutes before Isha", and they get their gentle heads up exactly that far ahead.

Last week I received a DM from [@theilgaz](https://x.com/theilgaz) reporting an issue he was having. He opened the app at 20:35 to check how much time he had left, and the moment he launched it he got a notification saying Isha in 15 minutes, even though he still had 28 minutes left. The home screen counter was showing the correct duration, but the notification was wrong.

I immediately focused on the fact that the notification fired right after he launched the app. It was like a stuck pipe opening up with water, and my instinct was right.

## What actually happened

I naively expected that if I ask `AlarmManager` for 19:26, my receiver runs at 19:26. Of course I was wrong. I test on a Pixel, and it turns out that's a whole different story from other devices like Xiaomi.

Doze, App Standby, and especially the OEM battery managers sit between your alarm and your code. They don't drop the alarm, they hold onto it, sometimes for hours, and let it through the moment something wakes the app up. Usually that's the user opening it.

So Maghrib's alarm, due at 19:26, sat in a queue for an hour. At 20:35 he opened the app, the app woke up, the held broadcast finally landed, and my receiver did exactly what it was told.

## The mistake

When scheduling, I put the offset into the intent extras and read it back on delivery:

```kotlin
reminderNotification.show(
    prayer = prayer,
    offsetMinutes = intent.getIntExtra(EXTRA_OFFSET_MINUTES, 0),
    // ...
)
```

`offsetMinutes` is 15. It's always 15. It was 15 when I scheduled the alarm and it's still 15 an hour later, because a number sitting in a `Bundle` has no idea time is passing.

It said Isha instead of Maghrib for a related reason: there's a single `PendingIntent` reused with `FLAG_UPDATE_CURRENT`, and opening the app also triggers a reschedule. The stale delivery showed up wearing the next prayer's name.

None of this is really an Android bug. I stored a duration where I should have stored an instant. "In 15 minutes" is only true at the moment you write it down, and if it has to cross anything that can stall, like an alarm or a job queue or a scheduled email, it quietly rots.

## The fix

Don't trust the delivery. Work it out from `now()` instead.

The prayer's absolute timestamp was already in the extras, since I use it to render the time in the notification body. It turned out to be the only honest thing in there.

```kotlin
override fun invoke(
    prayerDateTime: LocalDateTime,
    offsetMinutes: Int,
    now: LocalDateTime
): Int? {
    if (offsetMinutes <= 0) return null

    val remaining = Duration.between(now, prayerDateTime)
    val earliest = Duration.ofMinutes(offsetMinutes.toLong()) + EARLY_DELIVERY_TOLERANCE
    if (remaining <= Duration.ZERO || remaining > earliest) return null

    return ((remaining.seconds + 59) / 60).toInt().coerceIn(1, offsetMinutes)
}
```

His case: 28 minutes left, and the offset allows at most 16. It returns `null`, so nothing gets posted. The other branch covers the opposite situation, a delivery that turns up after the prayer has already passed.

The part I nearly skipped is that `null`. It doesn't mean show something vaguer, it means post nothing at all. A missing reminder is a much smaller failure than lying to someone about when to pray.

The rest is small. Round up so it never says "in 0 minutes", cap it at the offset the user picked, and allow a minute of tolerance because even exact alarms drift a little. I also renamed `offsetMinutes` to `minutesToPrayer` in the notification, mostly to stop myself from doing this again in six months.

Reproducing the original bug on a device means owning a Xiaomi, backgrounding the app and waiting an hour. As a pure function it's just eight unit tests with different values for `now`, and his 20:35 delivery is one of them.

## What I couldn't fix

None of this makes the notification arrive on time. If a battery manager wants to sit on my alarm for an hour, it sits on it. There's no permission or foreground service trick that beats every vendor.

What I could control is whether the app lies when that happens. It's allowed to be missing now. It's not allowed to be wrong.

If you schedule anything, go look at your intent extras for durations. Every `offsetMinutes` or `delayMillis` in there has an expiry date, and it'll look completely fine right up until someone opens your app and an hour-old broadcast falls out.

---
title: Accessibility in Jetpack Compose
description: The semantics tree, merging, state, traversal, live regions, forms, contrast, font scaling, touch targets and testing, from the accessibility lesson of my Android course.
date: 2026-06-26
---

This is the written version of the accessibility lesson from [Advanced Android: From Code to Production](/writing/advanced-android-from-code-to-production), the course I gave with MultiGroup Community. It's the second half of the module on Jetpack Compose and accessibility.

You can find the [slides](https://github.com/karacca/nami-android/blob/master/presentations/output/3-accessibility-in-jetpack-compose.pdf) on GitHub. The demos are in the [`accessibility`](https://github.com/karacca/nami-android/tree/master/accessibility) module of the course repo. It's a small app with eleven of the topics below as runnable before and after screens, most of them with an instrumented test. Turn TalkBack on and swipe through both versions.

## Why accessibility?

- **Reach.** Around 16% of people live with a disability, and accessibility also covers situational impairments: one hand on a train, bright sunlight, a cracked screen.
- **Drivers.** Legal requirements like the ADA and EN 301 549, Play Store quality, and a better experience for everyone.
- **Agent-ready.** AI agents read the same tree through `AccessibilityService`. Good semantics make that deterministic and cheap; empty semantics force them back to brittle screenshot reading.
- **Testable by default.** The semantics tree is what Compose UI tests query, so good labels double as stable test selectors.
- **Wider input reach.** Keyboard, D-pad and TV, Switch Access and Voice Access all ride the same tree. One investment, more devices.

## Android's built-in accessibility services

- **TalkBack.** The screen reader, with spoken feedback for every interaction.
- **Select to Speak.** Reads selected text on screen aloud, on demand.
- **Switch Access.** Scans focusable, actionable nodes, and physical switches trigger them.
- **Voice Access.** Maps spoken labels to `contentDescription`. Wrong labels break it.
- **Keyboard and D-pad.** Relies on `focusable`, `focusGroup` and a sane focus order. Used on TVs and with external keyboards.
- **Live Transcribe and Live Caption.** Real-time speech-to-text overlays.
- And Sound Amplifier, color correction and inversion, magnification, font and display size, and extra dim.

Most of these read from the same place.

## The semantics tree

Alongside the UI, Compose builds a parallel tree of meaning. That's what accessibility services consume. Each node is a bag of properties: `Role`, `contentDescription`, `stateDescription`, `onClick`, `disabled` and so on.

```kotlin
Button(onClick = { }) { Text("Save") }

Box(Modifier.clickable { }) { Icon(...) }
```

The Material `Button` gets its semantics for free and is announced as "Save, button". The raw `Box` produces an empty node, so there's nothing to announce. To see what services actually see, dump the tree in a test:

```kotlin
composeTestRule.onRoot().printToLog("SEMANTICS")
```

There are two views of it. The merged tree is what TalkBack uses, and it's what test finders query by default. The unmerged tree has every node; pass `useUnmergedTree = true` to a finder to assert against it.

Before fixing anything, classify the element. Material components are free. Composites need merging. Custom components need a role. Decorative things get cleared.

## Modifier.semantics

`Modifier.semantics` is the tool for adding meaning to custom elements:

```kotlin
Box(
    Modifier
        .clickable { onPlay() }
        .semantics {
            role = Role.Button
            contentDescription = "Play"
            stateDescription = "Paused"
            heading()
            disabled()
            onClick(label = "Play") {
                onPlay()
                true
            }
        }
)

Image(painter = background, contentDescription = null)
```

- `role` is what it is: `Button`, `Image` and so on
- `contentDescription` is the spoken label
- `stateDescription` is the wording for its current state
- `heading()` makes it a landmark users can jump between
- `disabled()` announces it as unavailable
- `onClick(label)` names the action verb
- `contentDescription = null` marks something as decorative and prunes it from the tree

A `Canvas` or any custom drawing gets zero semantics automatically. You have to author everything yourself.

## Grouping and hiding nodes

By default, a card made of five pieces takes five swipes to get through.

```kotlin
@Composable
fun PersonCard(person: Person) {
    Column(
        Modifier.clearAndSetSemantics {
            contentDescription = "${person.name}, age ${person.age}"
        }
    ) {
        Text(person.name)
        Text("${person.age} yrs")
        Icon(person.flag, null)
    }
}
```

Without the modifier, TalkBack stops twice: "Ada Lovelace", then "36 yrs". With it, there's one clean stop: "Ada Lovelace, age 36".

- `mergeDescendants` reads a group as one focusable unit
- `clearAndSetSemantics` drops noisy children and sets one clean label

The pitfall is over-merging. Merge a card that has a button inside it and that button gets buried. Keep real actions separate.

## State and toggles

```kotlin
Modifier.clickable { enabled = !enabled }

Modifier
    .toggleable(value = enabled, role = Role.Switch) { enabled = it }
    .semantics { stateDescription = if (enabled) "On" else "Off" }
```

With a bare `clickable`, TalkBack just says "button", and the user can't tell on from off. Use `Modifier.toggleable` or `selectable` with a `Role` instead. The role makes the state part of the announcement automatically, and `stateDescription` lets you override the wording.

## Sliders and progress

The Material `Slider` and progress indicators announce their value and accept adjustment for free. A custom-drawn track is just "button": no value, and no way to change it.

```kotlin
Box(
    Modifier.semantics(mergeDescendants = true) {
        contentDescription = "Volume"
        progressBarRangeInfo = ProgressBarRangeInfo(
            current = volume,
            range = 0f..1f,
            steps = 9,
        )
        stateDescription = "${(volume * 100).roundToInt()}%"
        setProgress { target ->
            volume = target
            true
        }
    }
)
```

- `progressBarRangeInfo` describes the current value, the range and the discrete steps (here 0 to 100% in tens)
- `setProgress` lets TalkBack and Switch Access move it, for example with the volume keys
- `stateDescription` makes it human: "60%", or "Medium"
- A track with a child, like the fill here, has to merge to be focusable at all, and it needs a `contentDescription` or it's silent

## TalkBack: traversal and focus

TalkBack reads in layout order by default. That's usually right, until something urgent sits at the bottom: an alert placed below an article is heard last, which is too late.

```kotlin
Column(
    Modifier.semantics { isTraversalGroup = true }
) {
    Article()
    AlertBanner(
        Modifier.semantics(mergeDescendants = true) {
            traversalIndex = -1f
        }
    )
}
```

- `isTraversalGroup` scopes the ordering to a section
- `traversalIndex` sorts within it; lower comes first, so `-1f` pulls the banner to the front
- The index has to sit on the focusable, merged node
- Verify by swiping, not by tapping

## Keyboard focus is not TalkBack order

These are two independent systems, and fixing one doesn't fix the other.

- TalkBack order is controlled with `traversalIndex` and `isTraversalGroup`
- Keyboard and D-pad order is controlled with `focusable`, `focusGroup()` and `focusProperties { next = … }`

```kotlin
val (email, password) = remember { FocusRequester.createRefs() }

TextField(
    value = emailText,
    onValueChange = { emailText = it },
    modifier = Modifier
        .focusRequester(email)
        .focusProperties { next = password },
)
TextField(
    value = passwordText,
    onValueChange = { passwordText = it },
    modifier = Modifier.focusRequester(password),
)
```

Test with Tab and with swipes, because they can disagree. And keyboard users need a visible focus indicator, with at least 3:1 contrast against its surroundings.

## Lists and collections

`LazyColumn` and `LazyRow` emit collection semantics for free, so TalkBack announces "2 of 5". Two things to know: off-screen lazy items aren't in the tree, so don't assert on them in tests. And a plain `Column` used as a list announces no position at all.

```kotlin
Column(
    Modifier.semantics {
        collectionInfo = CollectionInfo(rowCount = items.size, columnCount = 1)
    }
) {
    items.forEachIndexed { index, item ->
        Row(
            Modifier.semantics(mergeDescendants = true) {
                collectionItemInfo = CollectionItemInfo(
                    rowIndex = index,
                    rowSpan = 1,
                    columnIndex = 0,
                    columnSpan = 1,
                )
            }
        ) {
            // ...
        }
    }
}
```

Now TalkBack says "Inbox, 12, 2 of 5". Merge each row into one stop, like in the grouping section.

## Live announcements

A change that happens away from focus is silent to TalkBack. Sighted users see it; everyone else doesn't.

```kotlin
var status by remember { mutableStateOf("Idle") }
var loadId by remember { mutableIntStateOf(0) }

LaunchedEffect(loadId) {
    if (loadId == 0) return@LaunchedEffect
    status = "Loading…"
    delay(1_200)
    status = "Updated just now"
}

Column {
    Button(onClick = { loadId++ }) { Text("Reload") }
    Text(
        text = status,
        modifier = Modifier.semantics {
            liveRegion = LiveRegionMode.Polite
        },
    )
}
```

`liveRegion` announces a node's text changes automatically, without stealing focus. `Polite` waits for a pause and `Assertive` interrupts right away. Use `Assertive` for errors and `Polite` for loading and status. Don't overdo it: it re-announces on every single change.

## Forms and validation

A label, a field and its error should read as one node, not three.

```kotlin
OutlinedTextField(
    value = email,
    onValueChange = { email = it },
    label = { Text("Email") },
    isError = emailError != null,
    supportingText = {
        emailError?.let {
            Text(it, Modifier.semantics {
                liveRegion = LiveRegionMode.Assertive
            })
        }
    },
    modifier = Modifier.semantics {
        emailError?.let { error(it) }
    },
)
```

- `error("…")` makes TalkBack announce "invalid entry" along with the message, so the field reads as "Email, invalid entry"
- A red border on its own is silent, so announce the error on submit with a `liveRegion`
- `password()` masks the characters when they're spoken
- Material's `isError` and `supportingText` wire up much of this for you

## Panes and screen changes

Navigating to a new screen or opening a sheet is silent to TalkBack too.

```kotlin
ModalBottomSheet(onDismissRequest = ::close) {
    Column(
        Modifier.semantics {
            paneTitle = "Filters"
            dismiss {
                close()
                true
            }
        }
    ) {
        FilterControls()
    }
}
```

- `paneTitle` names a region that appears in place, like a sheet or a side pane, and it's announced when it appears
- `dismiss { }` lets users close a sheet or snackbar from the TalkBack menu
- On a new screen, move focus to its heading with `FocusRequester.requestFocus()`
- Dialogs need a title node and a sensible first focus

## Color contrast

- WCAG AA asks for 4.5:1 for body text, and 3:1 for large text and UI components
- Never use color alone. Color-blind users and screen readers both miss it
- Pair state with an icon, a shape or a label
- Check both light and dark schemes
- Material 3's tonal elevation lightens dark surfaces, so contrast can quietly drop on elevated components

```kotlin
Text(label, color = colorScheme.error)

Row(verticalAlignment = Alignment.CenterVertically) {
    Icon(Icons.Default.Error, contentDescription = null)
    Text("$label — required", color = colorScheme.error)
}
```

The first one shows an error only as red text. The second uses color, an icon and words, so any one of them is enough.

## Font scaling

- `sp` for text, `dp` for layout. Never text in `dp`
- Android 14 and later scale fonts non-linearly up to 200%, so test at the maximum
- Fixed heights clip scaled text; let containers grow
- Users change this in Settings → Display → Font size
- RTL and localization belong here too: use `start` and `end` instead of `left` and `right`, and remember translated strings are often longer

```kotlin
Surface(Modifier.fillMaxWidth().height(40.dp)) {
    Box(contentAlignment = Alignment.Center) {
        Text("Confirm purchase")
    }
}

Surface(Modifier.fillMaxWidth()) {
    Text(
        "Confirm purchase",
        Modifier.padding(vertical = 12.dp, horizontal = 16.dp),
    )
}
```

The fixed 40dp height clips the text at large font sizes. Padding instead of a height lets it grow.

## Touch targets

- Anything tappable needs at least 48×48dp
- The icon can stay small; the hit area can't
- `minimumInteractiveComponentSize()` expands the hit area without resizing the icon
- Spacing between targets matters as much as their size

```kotlin
Icon(
    Icons.Filled.Close,
    contentDescription = "Dismiss",
    modifier = Modifier.size(24.dp).clickable {},
)

Icon(
    Icons.Filled.Close,
    contentDescription = "Dismiss",
    modifier = Modifier
        .minimumInteractiveComponentSize()
        .size(24.dp)
        .clickable {},
)
```

In the first, the hit area is the 24dp glyph itself. In the second, the icon is still 24dp but the touch area is at least 48dp.

## Adapting to accessibility settings

Read the user's settings instead of assuming the defaults. Something that disappears after four seconds is hard to use with TalkBack, which takes time to read it out. The system can tell you how long it should stay:

```kotlin
val accessibilityManager = LocalAccessibilityManager.current

LaunchedEffect(message) {
    val timeout = accessibilityManager?.calculateRecommendedTimeoutMillis(
        originalTimeoutMillis = 4_000,
        containsText = true,
        containsControls = true,
    ) ?: 4_000L
    delay(timeout)
    onDismiss()
}
```

`calculateRecommendedTimeoutMillis` returns a longer value when the user needs one, or the original otherwise. Material 3's snackbar host already does this; anything you auto-dismiss yourself doesn't.

- Detect a screen reader and drop hover-only or auto-timed interactions
- Honor reduced motion, when the system animator scale is 0
- One adaptive layer benefits every assistive tool

## Gestures and custom actions

Custom gestures like drag or swipe are invisible to accessibility services. TalkBack also uses swipes for its own navigation, so a one-finger swipe never reaches your app.

```kotlin
Modifier.semantics {
    customActions = listOf(
        CustomAccessibilityAction("Delete") {
            onDelete()
            true
        }
    )
}
```

`customActions` puts swipe-to-delete in the TalkBack actions menu. Always offer a path that doesn't need the gesture, and respect "Remove animations".

## Inspect and debug

- Layout Inspector now shows semantics for each node
- `printToLog()` dumps the merged and unmerged trees
- See what TalkBack sees before you fix anything
- Debug the tree, not the UI
- `AndroidView` interop is where semantics have to bridge to the old View system, so test that boundary explicitly

```kotlin
@Test
fun dumpTree() {
    composeTestRule.setContent { PersonCard(ada) }

    composeTestRule.onRoot(useUnmergedTree = false).printToLog("MERGED")
    composeTestRule.onRoot(useUnmergedTree = true).printToLog("UNMERGED")
}
```

## Automated testing

- `enableAccessibilityChecks()` flags issues in Compose UI tests
- Semantics matchers like `onNodeWithContentDescription` double as accessibility assertions
- Espresso's `AccessibilityChecks.enable()` covers older View-based screens
- Run it in CI to catch regressions on every pull request

```kotlin
@Test
fun sendButton_isAccessible() {
    composeTestRule.enableAccessibilityChecks()
    composeTestRule.setContent { ChatBar() }

    composeTestRule
        .onNodeWithContentDescription("Send message")
        .assertHasClickAction()
}
```

Once enabled, the checks run on every interaction in the test. One thing I ran into while building the demos: on API 34 and later, `enableAccessibilityChecks()` combined with `performClick()` crashed. For the touch target test I read `boundsInRoot` from the semantics node and asserted the size directly instead.

## Tooling and manual testing

- The Accessibility Scanner app checks contrast, target size and missing labels on a real screen
- A manual TalkBack pass, swiping through every screen, is the only real test of the experience
- Automation catches structure. It never catches usability

That was the closing line of the lesson, and it's the one I'd keep: build the semantics tree on purpose, not by accident.

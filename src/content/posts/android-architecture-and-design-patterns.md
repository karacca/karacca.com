---
title: Architecture and Design Patterns on Android
description: MVVM vs MVI, state management, Clean Architecture, use cases, dependency injection and modularization, from the first module of my Android course.
date: 2026-05-15T17:01:00Z
---

This is the written version of the architecture lesson from [Advanced Android: From Code to Production](/writing/advanced-android-from-code-to-production), the course I gave with MultiGroup Community. You can find the [slides](https://github.com/karacca/nami-android/blob/master/presentations/output/1-architecture-and-design-patterns.pdf) on GitHub, and the demo code is in the [`demo-architecture`](https://github.com/karacca/nami-android/tree/master/demo-architecture) module of the course repo.

## MVVM vs MVI

Both patterns put a ViewModel between the UI and the rest of the app. The difference is how strict they are about state and about how the View talks to the ViewModel.

**MVVM**

- Multiple `StateFlow`s, one per piece of state
- The View calls named functions on the ViewModel
- Side effects get bolted on, usually with a `SharedFlow`
- Flexible and easy to adopt incrementally
- State updates aren't atomic, so there's a window where the state is inconsistent

**MVI**

- A single immutable `UiState` object
- Every interaction goes through `processIntent(Intent)`
- Side effects are first-class, usually a `Channel<SideEffect>`
- Strict unidirectional data flow
- State updates are atomic, so the View never sees a half-updated state

In the demo I built the same search screen both ways: a text field, a spinner while loading, an error with a retry button, and a list of results.

The MVVM version keeps each piece of state in its own stream:

```kotlin
class SearchViewModel : ViewModel() {
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _users = MutableStateFlow<List<User>>(emptyList())
    val users: StateFlow<List<User>> = _users.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    private var searchJob: Job? = null

    fun search(query: String) {
        searchJob?.cancel()
        searchJob = viewModelScope.launch {
            _isLoading.value = true
            _users.value = emptyList()
            _error.value = null
            try {
                _users.value = searchUsers(query)
            } catch (e: IOException) {
                _error.value = e.message
            }
            _isLoading.value = false
        }
    }
}
```

It's the Android-recommended pattern and the right default for most screens. The friction shows up when related fields have to change together. You update them one at a time, and between `_isLoading.value = true` and `_error.value = null` the screen is technically loading and showing the old error at once. Side effects like a snackbar or navigation don't have a standard home either, so each developer reaches for something different.

The MVI version describes the whole screen as one value, and everything the user can do as an intent:

```kotlin
data class UiState(
    val query: String = "",
    val isLoading: Boolean = false,
    val users: List<User> = emptyList(),
    val error: String? = null,
)

sealed interface Intent {
    data class Search(val query: String) : Intent
    data object Retry : Intent
}

class SearchViewModel : ViewModel() {
    private val _state = MutableStateFlow(UiState())
    val state: StateFlow<UiState> = _state.asStateFlow()

    private var searchJob: Job? = null

    fun processIntent(intent: Intent) {
        when (intent) {
            is Intent.Search -> search(intent.query)
            Intent.Retry -> search(_state.value.query)
        }
    }

    private fun search(query: String) {
        searchJob?.cancel()
        searchJob = viewModelScope.launch {
            _state.value = UiState(query = query, isLoading = true)
            try {
                val users = searchUsers(query)
                _state.update { it.copy(isLoading = false, users = users) }
            } catch (e: IOException) {
                _state.update { it.copy(isLoading = false, error = e.message) }
            }
        }
    }
}
```

The View has no logic left. It renders `state` and sends intents:

```kotlin
val state by viewModel.state.collectAsStateWithLifecycle()

OutlinedTextField(
    value = state.query,
    onValueChange = { viewModel.processIntent(Intent.Search(it)) },
)
```

Every transition produces a new `UiState` from the current one plus an intent, so it's explicit, reproducible and easy to unit test. The cost is ceremony: every action needs an `Intent` and every screen needs its contract. Worth it on complex screens, overkill on simple ones.

## MVVM and state management

MVVM with `ViewModel` and `StateFlow` is the backbone of modern Android development. The ViewModel is the unit of state ownership: it outlives the Activity or Fragment across configuration changes, which makes it the right place to hold UI state. `StateFlow` is a hot flow that always holds the latest value, which is exactly what "the current screen state" is. Collect it with `collectAsStateWithLifecycle` in Compose, or `repeatOnLifecycle` with Views, and it stops when the UI isn't visible.

Unidirectional data flow is the discipline that ties it together. Events flow up: the View sends taps and text input to the ViewModel. State flows down: the ViewModel updates state and the View re-renders from it. Nothing flows backwards. That makes bugs reproducible, since the same sequence of events always gives the same state, and it lets you test state transitions without any UI.

In Nami, every screen is driven by a single `UiState` emitted from a `StateFlow`, with sub-states like loading, success and error, and a separate side effect channel for one-shot events like navigation or showing a snackbar. That makes the full screen state inspectable at any point.

## Clean Architecture

- **Presentation** is the UI layer: composables, ViewModels, UI state
- **Domain** is the business logic: use cases, entities, repository interfaces
- **Data** is the infrastructure: repository implementations, network, database
- Dependencies only point inward, outer layers depend on inner ones and never the reverse
- The domain layer has zero Android dependencies, it's plain Kotlin and fully unit testable

The presentation layer holds everything the user sees: composables render state, ViewModels hold it. The domain layer is the heart. It defines what the app does through use cases and entities, and declares the repository interfaces it needs without caring how they're implemented. The data layer fulfils those interfaces with Retrofit, Room or whatever else.

Because the domain layer is pure Kotlin with no Android imports, every use case and entity is testable with plain JUnit. No emulator, no mocking of Android framework classes.

## Use cases

- A use case encapsulates a single business operation, like `GetUserProfileUseCase`
- The ViewModel calls it, which keeps the ViewModel thin and focused on UI state
- It takes repository interfaces as constructor parameters, so it's easy to fake in tests
- One class, one responsibility; compose several use cases for complex flows

```kotlin
class LogoutUseCase @Inject constructor(
    private val userRepository: UserRepository,
    private val resetWishlists: ResetWishlists,
    private val clearBag: ClearBag,
    // ... more dependencies
) : Logout {
    override suspend operator fun invoke(): Result<Boolean, Unit> {
        return setPushNotificationsPreference(false).also {
            clearAllSources()
        }
    }

    private suspend fun clearAllSources() {
        resetWishlists()
        userRepository.logout()
        clearBag()
        // ... clear remaining sources
    }
}
```

A use case is a named, single-purpose class that executes one business operation: `GetUserProfileUseCase`, `SubmitOrderUseCase`, `LogoutUseCase`. The naming convention makes the codebase self-documenting, you can read what the app does just from its list of use cases.

The ViewModel's job shrinks to receiving UI events, calling use cases and mapping their results to UI state. Threading lives in the use case, not the ViewModel. Because use cases depend on interfaces, you can swap in a fake repository and run the full business logic in a test in milliseconds. Returning a `Result` makes error handling explicit at every call site, so nothing uncaught travels up to the UI.

## Dependency injection

- Classes declare what they need, not how to create it
- Dependencies are provided from the outside, which makes classes easy to test and replace
- Hilt is the standard DI framework on Android, built on top of Dagger
- `@Inject constructor` marks a class for automatic injection, no manual wiring
- `@HiltViewModel` connects the DI graph to the ViewModel lifecycle
- Scopes control lifetime: `@Singleton`, `@ActivityRetainedScoped`, `@ViewModelScoped`

Dependency injection is the practice of supplying a class's collaborators from outside rather than having the class construct them itself. The class becomes a pure description of behavior: swap any dependency for a fake and it still works.

Hilt generates the Dagger component graph at compile time, so there's no runtime reflection overhead. Annotating a constructor with `@Inject` is enough to make a class injectable, and Hilt figures out the rest from the type graph. `@HiltViewModel` wires ViewModels into Hilt's scoped graph so they survive configuration changes correctly.

Scopes matter because they decide how long an instance lives. A `@Singleton` repository is shared across the whole app, while a `@ViewModelScoped` helper lives and dies with its ViewModel. Getting a scope wrong is one of the most common sources of memory leaks and stale state in Android apps.

## Choosing a DI approach

Pick based on the size of the app and how early you want to catch mistakes: manual DI for tiny apps, Hilt for production scale with compile-time safety, Koin for fast iteration with a clean DSL.

| Factor          | Manual | Hilt / Dagger | Koin     |
| --------------- | ------ | ------------- | -------- |
| Build speed     | Fast   | Slow (KSP)    | Fast     |
| Error detection | Manual | Compile time  | Runtime  |
| Learning curve  | Low    | High          | Low      |
| Scalability     | Poor   | Excellent     | Moderate |
| KMP support     | Yes    | No            | Yes      |
| Boilerplate     | High   | Medium        | Low      |

Manual DI gives you full control but falls apart as the graph grows. Hilt catches missing or mismatched bindings at compile time, so you never ship a crash from a missing provider. Koin is the easiest to adopt, but it trades that safety for runtime resolution: a missing binding only surfaces when that code path runs, possibly in production. For a team project, Hilt is the right call. The build cost is a one-time investment and the compile-time guarantees pay off across the team.

## Modularization

- Split the app into independent Gradle modules with clear boundaries
- **Feature modules** own a vertical slice: UI, domain logic and data for one feature
- **Core modules** share infrastructure: networking, database, design system, utils
- Modules depend on interfaces, not implementations, and the build graph enforces it
- Parallel compilation: Gradle only rebuilds modules whose inputs changed
- It enables dynamic delivery, feature modules can be downloaded on demand

Modularization means breaking a monolithic app into a graph of Gradle modules, each with a well-defined responsibility and a minimal public API. A feature module owns everything related to one user-facing feature: the composables, the ViewModel, the use cases, the repository implementation. Changes stay local and don't ripple across the codebase. Core modules hold what features share: the Retrofit client, the Room database, the design system components, logging utilities.

The dependency rule mirrors Clean Architecture: feature modules depend on core modules, never on each other. That keeps the build graph acyclic and lets Gradle compile unrelated modules in parallel, which pays off more and more as the project grows. At scale, a feature module can also become a Play Feature Delivery module, downloaded only the first time the user opens that feature.

Next in the course was the language underneath all of this: [Kotlin Deep Dive](/writing/kotlin-deep-dive).

---
title: Kotlin Deep Dive
description: Variance, inline functions, initialization order, the cast attack, sequences, coroutines, Flow and typed errors, from the Kotlin module of my Android course.
date: 2026-06-12
---

This is the written version of the Kotlin lesson from [Advanced Android: From Code to Production](/writing/advanced-android-from-code-to-production), the course I gave with MultiGroup Community. It's less about Android and more about the language underneath it.

You can find the [slides](https://github.com/karacca/nami-android/blob/master/presentations/output/2-kotlin-deep-dive.pdf) on GitHub. Every example here is a runnable `main()` in the [`kotlin-deep-dive`](https://github.com/karacca/nami-android/tree/master/kotlin-deep-dive) module of the course repo.

## Type system and language core

### Declaration-site variance

Variance is about which way a type parameter flows:

- `out T`: `T` is only returned, produced, read from
- `in T`: `T` is only accepted, consumed, written into
- `T`: both read and written, so it's invariant

```kotlin
open class User(val name: String)
class FreeUser(name: String) : User(name)

class UserFeed<out T>(private val users: List<T>) {
    fun getAll(): List<T> = users
}

interface UserProcessor<in T> {
    fun process(user: T)
}

fun showUsers(feed: UserFeed<User>) {
    feed.getAll().forEach { println(it.name) }
}

val freeUsers: UserFeed<FreeUser> = UserFeed(listOf(FreeUser("Ömer")))
showUsers(freeUsers)

val anyUser: UserProcessor<User> = AnyUserProcessor()
val freeOnly: UserProcessor<FreeUser> = anyUser
```

Because `UserFeed` only produces `T`, a feed of free users is safely a feed of users. `UserProcessor` only consumes `T`, so it goes the other way: something that can process any user can certainly process a free one.

### Star projection

When you don't know or care about the type argument, use `*`. You can read from it as `Any?`, but you can't write into it.

```kotlin
fun printAll(list: List<*>) {
    list.forEach { println(it) }
}

fun fillFirst(array: Array<*>) {
    // array[0] = "x" won't compile, the type is unknown
    println("size=${array.size}, first=${array.firstOrNull()}")
}
```

### Platform types and intersection types

A value coming from Java has a platform type, written `String!`. The compiler doesn't know whether it can be null, so it lets you treat it either way and stays silent if you get it wrong. A Java `@Nullable` annotation turns it into a proper `String?`. Without one, declare the type explicitly at the boundary.

```kotlin
val name = javaUser.name
println(name.length)

val safe: String? = javaUser.name
println(safe?.length)
```

The first one can throw a `NullPointerException` at runtime with no warning. The second makes the compiler check it.

Intersection types show up with multiple generic bounds. Inside this function, `T` is effectively `CharSequence & Comparable<T>`:

```kotlin
fun <T> firstIfBigger(a: T, b: T): T where T : CharSequence, T : Comparable<T> {
    return if (a > b) a else b
}
```

### Sealed classes and exhaustive when

```kotlin
sealed interface UiState {
    data object Loading : UiState
    data class Success(val data: List<Item>) : UiState
    data class Error(val cause: Throwable) : UiState
}

fun render(state: UiState): String = when (state) {
    UiState.Loading -> "spinner"
    is UiState.Success -> "list of ${state.data.size}"
    is UiState.Error -> "error: ${state.cause.message}"
}
```

No `else` branch needed. Add a new state and every `when` that doesn't handle it stops compiling, which is exactly what you want. Each branch also smart casts, so `state.data` just works.

### Contracts

Contracts let a function tell the compiler something it can't figure out on its own.

```kotlin
@OptIn(ExperimentalContracts::class)
fun requireNotBlank(value: String?): String {
    contract { returns() implies (value != null) }
    if (value.isNullOrBlank()) throw IllegalArgumentException("blank")
    return value
}

val s: String? = readInput()
requireNotBlank(s)
println(s.length)
```

After the call, `s` is smart cast to `String`. The standard library uses contracts too. `run` declares that it calls its block exactly once, which is why this compiles:

```kotlin
val x: Int
run {
    x = 42
}
```

### Operator overloading and conventions

Operators are just functions with reserved names.

```kotlin
class Money(val amount: BigDecimal) : Comparable<Money> {
    operator fun plus(other: Money) = Money(amount + other.amount)
    override operator fun compareTo(other: Money) = amount.compareTo(other.amount)
}

class Router {
    operator fun invoke(path: String) = println("navigating to $path")
}

println(a + b)
println(a > b)
router("/home")
```

`plus` gives you `+`, `compareTo` gives you `<` and `>`, and `invoke` lets you call an object like a function. That last one is why use cases can be called as `logout()`.

### Destructuring internals

```kotlin
val (id, name) = user
```

compiles to:

```kotlin
val id = user.component1()
val name = user.component2()
```

Data classes generate `componentN()` for you. In lambdas, the parentheses matter: `{ (key, value) -> }` is one parameter destructured, `{ key, value -> }` is two parameters.

### Infix functions and extension resolution

```kotlin
infix fun Int.pow(exp: Int): Long {
    var r = 1L
    repeat(exp) { r *= this }
    return r
}

println(2 pow 10)
```

Extensions look like members, but they're resolved statically, by the declared type, at compile time:

```kotlin
open class Base
class Derived : Base()

fun Base.describe() = "base"
fun Derived.describe() = "derived"

val x: Base = Derived()
println(x.describe())
```

This prints `base`. There's no virtual dispatch for extensions.

## Functions and functional style

### inline, noinline, crossinline

A regular higher-order function allocates a `Function` object for its lambda. An `inline` function copies its body, and the lambda's body, into the call site instead.

```kotlin
inline fun measureNanos(block: () -> Unit): Long {
    val start = System.nanoTime()
    block()
    return System.nanoTime() - start
}
```

Open Tools → Kotlin → Show Kotlin Bytecode and decompile a call to it: there's no lambda object, just the code.

Sometimes you can't inline a lambda parameter, because you need to store it or call it from another context:

```kotlin
inline fun process(
    crossinline onEach: (Int) -> Unit,
    noinline onDone: () -> Unit,
) {
    val runnable = Runnable { onEach(1) }
    runnable.run()
    saveForLater(onDone)
}
```

`crossinline` still inlines `onEach`, but forbids a non-local `return` from it, since it runs inside a `Runnable`. `noinline` opts `onDone` out of inlining entirely, so it can be stored like a normal value.

### Scope functions

Which one to pick depends on two things: whether you want the object back or the lambda's result, and whether you refer to the object as `this` or `it`.

```kotlin
val dialog = Dialog().apply {
    title = "Hi"
    cancelable = false
}.also { println("created: $it") }

val titleLength = input?.let { it.trim().length }

val summary = with(dialog) {
    "$title (cancelable=$cancelable)"
}
```

- `apply` configures an object and returns it
- `also` runs a side effect and returns the object
- `let` is a null-safe transform that returns the lambda's result
- `with` groups calls on an object and returns the result

### Local functions, closures and tailrec

A local function can capture variables from the enclosing function:

```kotlin
fun validate(account: Account) {
    fun requireField(value: String, field: String) {
        require(value.isNotEmpty()) { "$field empty for account ${account.id}" }
    }

    requireField(account.name, "name")
    requireField(account.email, "email")
}
```

`tailrec` tells the compiler to rewrite a tail-recursive function as a plain loop in bytecode. No new stack frame per call, so no stack overflow on deep inputs.

```kotlin
tailrec fun gcd(a: Int, b: Int): Int =
    if (b == 0) a else gcd(b, a % b)
```

## Classes, initialization and lifecycle

### Initialization order

The order is: superclass constructor, then property initializers and `init` blocks in source order, then the constructor body. That's enough to produce something surprising:

```kotlin
open class BaseScreen {
    open val size: Int = 10

    init {
        println("BaseScreen init, size = $size")
    }
}

class DerivedScreen : BaseScreen() {
    override val size: Int = 20
}

DerivedScreen()
```

This prints `size = 0`. The `init` block calls the overridden getter, which reads `DerivedScreen`'s backing field before `DerivedScreen` has initialized it. Never touch `open` members from a constructor or `init` block.

### lateinit internals

Under the hood, a `lateinit var` is a nullable field with a getter that throws `UninitializedPropertyAccessException` if it's still null. That's also why it doesn't work with primitive types. You can check it without reflection:

```kotlin
class Screen {
    lateinit var adapter: ListAdapter

    fun bindIfReady() {
        if (::adapter.isInitialized) {
            println("bound: ${adapter.label}")
        }
    }
}
```

### Delegated properties

```kotlin
class Settings {
    val config: String by lazy {
        println("loading config once...")
        "loaded"
    }

    val cheap: String by lazy(LazyThreadSafetyMode.NONE) { "single-thread only" }

    var name: String by Delegates.observable("init") { prop, old, new ->
        println("${prop.name}: $old → $new")
    }

    var size: Int by Delegates.vetoable(0) { _, _, new -> new >= 0 }

    var darkMode: Boolean by Preference("dark_mode", false)
}
```

- `lazy` is synchronized by default. If it's only ever touched from one thread, `LazyThreadSafetyMode.NONE` skips the locking.
- `observable` runs a callback after every change.
- `vetoable` can reject a change: setting `size = -5` leaves it at `0`.
- A custom delegate is just a class implementing `ReadWriteProperty`. `Preference` here reads and writes a key-value store, so `darkMode` looks like a normal property.

```kotlin
class Preference<T>(
    private val key: String,
    private val default: T,
) : ReadWriteProperty<Any?, T> {
    override fun getValue(thisRef: Any?, property: KProperty<*>): T =
        prefs.read(key, default)

    override fun setValue(thisRef: Any?, property: KProperty<*>, value: T) =
        prefs.write(key, value)
}
```

### companion object vs top-level and const

```kotlin
const val APP_NAME = "Nami"

class Repo private constructor() {
    companion object {
        const val TIMEOUT_SECONDS = 30
        val createdAt = System.currentTimeMillis()

        @JvmStatic
        fun create() = Repo()
    }
}
```

- `const val` is inlined into every call site at compile time. Change it in a library and consumers keep the old value until they recompile.
- A companion object is a real singleton object. Without `@JvmStatic`, Java has to call `Repo.Companion.create()`.
- Top-level functions compile to static methods on a `FileNameKt` class, with no object behind them. If something doesn't need the class's private members, it doesn't need to be in a companion.

## Equality, immutability and state

### == vs ===

`==` is structural equality, `a?.equals(b) ?: (b === null)`. `===` is referential: is it the same object?

```kotlin
data class Point(val x: Int)

println(Point(1) == Point(1))
println(Point(1) === Point(1))
```

`true`, then `false`. A few traps worth knowing:

```kotlin
val x: Int? = 100
val y: Int? = 100
println(x === y)

val p: Int? = 1000
val q: Int? = 1000
println(p === q)
```

`true`, then `false`. The JVM caches boxed integers from -128 to 127. Never rely on identity for numbers.

```kotlin
data class Profile(val id: Int) {
    var nickname: String = ""
}

val u1 = Profile(1).apply { nickname = "A" }
val u2 = Profile(1).apply { nickname = "B" }
println(u1 == u2)
```

`true`. A data class only uses primary constructor properties for `equals` and `hashCode`. Properties in the body are ignored.

```kotlin
println(intArrayOf(1, 2) == intArrayOf(1, 2))
println(intArrayOf(1, 2).contentEquals(intArrayOf(1, 2)))
```

`false`, then `true`. Arrays don't override `equals`, so a data class holding an array needs its own `equals` and `hashCode`. And the contract always holds: equal objects must have equal hash codes. Override both or neither.

### val is not immutable

`val` means the reference can't change. It says nothing about the object.

```kotlin
val list = mutableListOf(1, 2)
list.add(3)

val holder = object {
    val time: Long get() = System.nanoTime()
}
println(holder.time == holder.time)
```

The list now has three items, and that `val` returns a different value every time you read it. For real immutability: data classes with `val`s all the way down, read-only collections of immutable elements, `kotlinx.collections.immutable` when you need a guarantee, and defensive copies at the boundaries:

```kotlin
class Cart(items: List<String>) {
    private val items: List<String> = items.toList()
}
```

### The cast attack

Kotlin's `List` is a read-only view, not an immutability guarantee.

```kotlin
class UnsafeRepo {
    private val _cache = mutableListOf("legit")
    val cache: List<String> get() = _cache
}

(unsafe.cache as MutableList<String>).add("evil")
println(unsafe.cache)
```

That prints `[legit, evil]`. `List<String>` is a compile-time label; the object at runtime is still an `ArrayList`, and the cast succeeds. The fix is to publish a wrapper instead of the object:

```kotlin
class ReadOnlyList<T>(private val backing: List<T>) : List<T> by backing

class SafeRepo {
    private val _cache = mutableListOf("legit")
    val cache: List<String> = ReadOnlyList(_cache)
}
```

The wrapper only implements `List`, so the cast throws `ClassCastException`. It's still a live view, so callers see new items as they're added. This is exactly how `asStateFlow()` protects `_state` in a ViewModel. Exposing a `MutableStateFlow` as a plain `StateFlow` type has the same hole.

Other options: return a copy with `_cache.toList()`, use `Collections.unmodifiableList` (the cast succeeds but mutation throws), or use a persistent collection.

### Backing properties beyond Flow

The `_state` and `state` pattern isn't only for flows. Copy on read is the simplest safe version:

```kotlin
class TagStore {
    private val _tags = mutableSetOf<String>()
    val tags: Set<String> get() = _tags.toSet()

    fun add(tag: String) {
        _tags += tag
    }
}
```

Fully safe, at the cost of an allocation per read.

## Collections and performance

### Sequences vs collections

```kotlin
val list = (1..1_000_000).toList()

val eager = list.filter { it % 2 == 0 }.map { it * 2 }.take(3)

val lazy = list.asSequence()
    .filter { it % 2 == 0 }
    .map { it * 2 }
    .take(3)
    .toList()
```

Same result. The eager version builds two intermediate lists of half a million elements each. The sequence goes element by element and stops after three results.

Sequences win with large collections and several operations, early termination (`take`, `first`, `any`), and infinite sources like `generateSequence`. Collections win with small lists, when you need size, indexes or multiple passes, and when an operation has to materialize anyway, like `sorted`. Collection operators are inlined and sequence lambdas aren't, so for a five-element list eager is faster.

### Primitive arrays

```kotlin
val a: IntArray = intArrayOf(1, 2, 3)
val b: Array<Int> = arrayOf(1, 2, 3)
val c: List<Int> = listOf(1, 2, 3)
```

`IntArray` is an `int[]`: contiguous primitives. `Array<Int>` is an `Integer[]` and `List<Int>` is an `ArrayList<Integer>`, both with every element boxed. For hot numeric loops like audio, images or sensor data, use the primitive arrays.

### ArrayDeque and persistent collections

`ArrayDeque` is a ring buffer that works as both a stack and a queue:

```kotlin
val undoStack = ArrayDeque<String>()
undoStack.addLast("typed a")
undoStack.addLast("typed b")
undoStack.removeLast()
undoStack.addFirst("urgent")
undoStack.removeFirst()
```

Persistent collections from `kotlinx-collections-immutable` never change. Adding returns a new collection that shares structure with the old one:

```kotlin
val v1 = persistentListOf(1, 2)
val v2 = v1.add(3)
```

`v1` is still `[1, 2]`. There's a Compose angle too: Compose considers `List` unstable, because it could be mutable. `ImmutableList` is stable, so Compose can compare it with `equals` and skip recomposition when nothing changed.

### Lesser-known operators

```kotlin
users.groupBy { it.city }
users.associateBy { it.id }
users.associateWith { it.score }

nums.fold(100) { acc, n -> acc + n }
nums.runningFold(0) { acc, n -> acc + n }

nums.chunked(2)
nums.windowed(size = 3, step = 1) { it.average() }
nums.zipWithNext { a, b -> b - a }

users.groupingBy { it.city }.eachCount()
val (valid, invalid) = users.partition { it.valid }
```

`runningFold` keeps every intermediate value, `chunked` gives you pagination batches, `windowed` a moving average, `zipWithNext` the deltas between neighbors.

## Coroutines

### Suspend functions and builders

`suspend` means a function can pause without blocking its thread. While it's paused, the thread is free to run other coroutines. `Thread.sleep` would hold the thread hostage; `delay` doesn't.

```kotlin
suspend fun fetchToken(): String {
    delay(100)
    return "token-42"
}

fun main() = runBlocking {
    val token = fetchToken()
    println(fetchUserName(token))

    val job = launch {
        delay(50)
        println("side effect done")
    }
    job.join()

    val a = async { fetchToken() }
    val b = async { fetchToken() }
    println("${a.await()}, ${b.await()}")
}
```

Suspending code is sequential by default and reads top to bottom like blocking code. The two calls at the top take about 200 ms. `launch` is fire and forget: it returns a `Job` you can join or cancel, but no result. `async` returns a `Deferred<T>` with a result, and the two `async` calls take about 100 ms because they run concurrently. `async` followed immediately by `await()` is just a verbose sequential call.

Suspend functions can only be called from other suspend functions or from a builder. `runBlocking` is the bridge from the blocking world, for `main()` and tests only.

### Structured concurrency

Every coroutine has a parent. A parent doesn't complete until its children do, cancelling a parent cancels its children, and by default a failing child cancels its parent and siblings.

```kotlin
suspend fun loadProfile(): FullProfile = coroutineScope {
    val user = async { fetchUser() }
    val posts = async { fetchPosts() }
    FullProfile(user.await(), posts.await())
}
```

If `fetchUser` throws, `fetchPosts` is cancelled automatically and `coroutineScope` rethrows. No leaked work. `GlobalScope` has no parent and no lifecycle, which is why it's almost always wrong.

### Dispatchers and context switching

- `Main` and `Main.immediate`: the UI thread. `immediate` skips the re-dispatch if you're already on it.
- `Default`: a shared pool about the size of your CPU core count, for CPU work like parsing, diffing and sorting.
- `IO`: an elastic pool (64 threads by default) for blocking I/O like Room, files or synchronous OkHttp calls.
- `Unconfined`: no dispatch at all. For tests and edge cases.

```kotlin
suspend fun parseLargeJson(): Int = withContext(Dispatchers.Default) {
    (1..1_000_000).sum()
}

val dbWriter = Dispatchers.IO.limitedParallelism(1)

suspend fun writeRow(n: Int) = withContext(dbWriter) {
    println("writing $n")
}
```

`limitedParallelism(1)` gives you a serial view of the IO pool: writes never run concurrently. `Default` and `IO` share threads, so switching between them is often just bookkeeping. Make your suspend functions main-safe, meaning they switch context internally, so callers never need their own `withContext`.

### Cooperative cancellation

Cancellation is cooperative. A coroutine only stops at a suspension point or when it checks:

```kotlin
val job = launch(Dispatchers.Default) {
    var i = 0
    while (isActive) {
        i++
    }
}
delay(100)
job.cancelAndJoin()
```

Without the `isActive` check, this loop never stops. `CancellationException` is normal control flow, so never swallow it. Cleanup that needs to suspend has to run in `NonCancellable`:

```kotlin
val worker = launch {
    try {
        repeat(100) { delay(100); println("working $it") }
    } catch (e: CancellationException) {
        println("cancelled, rethrowing")
        throw e
    } finally {
        withContext(NonCancellable) { releaseRemoteLock() }
    }
}
```

### Timeouts and retry

`withTimeout` cancels its block when time runs out and throws `TimeoutCancellationException`, a subclass of `CancellationException`. That means it's cooperative too: blocking code that never suspends ignores it. `withTimeoutOrNull` returns `null` instead, which is good for optional work.

```kotlin
suspend fun <T> retry(
    times: Int,
    initialDelay: Long = 100,
    block: suspend (attempt: Int) -> T,
): T {
    var backoff = initialDelay
    repeat(times - 1) { attempt ->
        try {
            return block(attempt + 1)
        } catch (e: TimeoutCancellationException) {
            delay(backoff)
            backoff *= 2
        }
    }
    return block(times)
}

val result = retry(times = 3) { attempt ->
    withTimeout(200.milliseconds) { slowFetch(attempt) }
}
```

Catch the timeout outside `withTimeout`, on the caller's side, like `retry` does. Catching plain `CancellationException` there would also swallow real cancellation. Only retry what's safe to repeat, like idempotent reads, and add jitter in real systems.

### Exception handling

```kotlin
supervisorScope {
    val handler = CoroutineExceptionHandler { _, e -> println("caught: ${e.message}") }
    launch(handler) { delay(50); error("task A failed") }
    launch { delay(100); println("task B survived") }
}

supervisorScope {
    val deferred = async { error("async boom") }
    try {
        deferred.await()
    } catch (e: IllegalStateException) {
        println("awaited: ${e.message}")
    }
}
```

In a `supervisorScope`, children fail independently. With a regular `Job`, one failure takes down its siblings. The rules that trip everyone up:

- `launch` propagates exceptions up the job tree. `async` holds its exception until `await()`, but still cancels its parent right away unless it's under a `SupervisorJob`.
- A `CoroutineExceptionHandler` on a non-root coroutine is ignored.
- A `try`/`catch` around `launch { }` catches nothing. Catch inside the coroutine, or around `await()`.
- On Android, `viewModelScope` is `SupervisorJob() + Dispatchers.Main.immediate`.

## Coroutines: Flow and beyond

### Flow basics

A `List<T>` gives you all its values at once. A `Flow<T>` delivers them over time, and nothing runs until a terminal operator collects it.

```kotlin
fun temperatures(): Flow<Int> = flow {
    var celsius = 20
    while (true) {
        delay(50)
        emit(celsius++)
    }
}

val pipeline = temperatures()
    .map { it * 9 / 5 + 32 }
    .filter { it % 2 == 0 }
    .onEach { println("passing $it") }

println(pipeline.first())
println(pipeline.take(3).toList())
```

`map`, `filter` and `onEach` are intermediate and lazy: building `pipeline` runs nothing. `first()` and `toList()` are terminal and start it. An infinite flow is fine, since `first()` and `take(n)` cancel the upstream once they're satisfied. And because flows are cold, the second collection starts the `flow { }` body from scratch.

### Cold, hot and backpressure

A cold flow runs its body once per collector. A hot flow exists on its own, whether anyone is collecting or not.

- `StateFlow` needs an initial value, always replays the latest one, and conflates. That's UI state.
- `SharedFlow` has no initial value, a configurable replay and no conflation. That's one-shot events. But events emitted with no active collector are dropped, so for critical events, model them as state or use `Channel(...).receiveAsFlow()`.

The operators really shine in a typeahead search:

```kotlin
queries
    .debounce(200)
    .distinctUntilChanged()
    .flatMapLatest { q -> searchApi(q) }
    .catch { e -> emit("fallback: ${e.message}") }
    .flowOn(Dispatchers.IO)
    .collect { println(it) }
```

`debounce` waits for the user to stop typing, `distinctUntilChanged` drops repeats, and `flatMapLatest` cancels the in-flight search when a new query arrives. `catch` only catches upstream errors, and `flowOn` only changes the upstream context.

Backpressure is built in: when the collector is slow, the emitter simply suspends. To tune it, use `buffer(n)`, `conflate()` to keep only the latest, or `collectLatest { }` to cancel in-progress handling. To share one upstream between many collectors, use `stateIn` or `shareIn` with `SharingStarted.WhileSubscribed(5000)`. The five seconds keep the upstream alive across a configuration change.

### Bridging callback APIs

Plenty of APIs predate coroutines and hand results to callbacks. `suspendCancellableCoroutine` turns a one-shot callback into a suspend function:

```kotlin
suspend fun LegacyClient.requestSuspending(): String =
    suspendCancellableCoroutine { cont ->
        request(
            onSuccess = { cont.resume(it) },
            onError = { cont.resumeWithException(it) },
        )
        cont.invokeOnCancellation { cancel() }
    }
```

Prefer it over `suspendCoroutine`: without `invokeOnCancellation`, a cancelled coroutine keeps waiting for the callback forever. Resume exactly once, since resuming twice throws. For a callback that fires repeatedly, like a listener, use `callbackFlow { }` instead.

### Mutex and Semaphore vs synchronized

```kotlin
val mutex = Mutex()
val limiter = Semaphore(permits = 2)

suspend fun fetch(id: Int) = limiter.withPermit {
    delay(100)
}

List(100) {
    launch(Dispatchers.Default) {
        repeat(100) { mutex.withLock { counter++ } }
    }
}.joinAll()
```

`counter` always ends at 10,000, and `fetch` never runs more than two at a time. `synchronized` and `ReentrantLock` block the thread; `Mutex` suspends instead. Never suspend inside `synchronized`: the lock belongs to a thread, and you may resume on a different one. Also, `Mutex` isn't reentrant, so locking it twice from the same coroutine deadlocks. For short critical sections that don't suspend, `synchronized` is still fine.

### Under the hood: CPS and state machines

The compiler rewrites every suspend function using continuation-passing style.

```kotlin
suspend fun demo(): String {
    val a = stepOne()
    val b = stepTwo(a)
    return a + b
}
```

Conceptually, that becomes:

```kotlin
fun demo(completion: Continuation<String>): Any?

class DemoContinuation : ContinuationImpl {
    var label = 0
    var a: String? = null
}
```

`demo` gets a hidden `Continuation` parameter and returns either the result or `COROUTINE_SUSPENDED`. Its body turns into a `when (label)` with one branch per suspension point, and local variables get spilled into fields of the continuation object so they survive the pause. Decompile it in Android Studio and you'll see the label switch.

This explains two things. Suspend functions need a suspend context because of that hidden parameter. And coroutines are cheaper than threads because pausing one costs a small continuation object, not a thread with its own stack of around a megabyte.

## Error modeling

### Result and the runCatching trap

`runCatching` catches `Throwable`, and that includes `CancellationException`:

```kotlin
val job = launch {
    val result = runCatching { fetchData() }
    println("swallowed cancellation, got: $result")
}
delay(100)
job.cancelAndJoin()
```

The `println` runs. The coroutine was cancelled, but `runCatching` turned that into a failed `Result` and carried on. Every codebase ends up writing the cancellation-aware version:

```kotlin
inline fun <T> runCatchingCancellable(block: () -> T): Result<T> =
    try {
        Result.success(block())
    } catch (e: CancellationException) {
        throw e
    } catch (e: Throwable) {
        Result.failure(e)
    }
```

`Result` has another limit: failures are untyped. Everything is a `Throwable`, so you lose your error taxonomy.

### Checked exceptions and @Throws

Kotlin has no checked exceptions. That leaks into Java: a Java caller can't even write `catch (IOException e)` around a Kotlin call, because `javac` complains it's never thrown. Unless you declare it:

```kotlin
@Throws(IOException::class)
fun readConfig(path: String): Config {
    if (path.isEmpty()) throw IOException("no path")
    return Config("contents of $path")
}
```

### Typed errors

The Either pattern from Arrow, expressed with plain sealed types:

```kotlin
sealed interface LoginError {
    data object InvalidCredentials : LoginError
    data class Network(val code: Int) : LoginError
}

sealed interface Outcome<out E, out T> {
    data class Failure<E>(val error: E) : Outcome<E, Nothing>
    data class Success<T>(val value: T) : Outcome<Nothing, T>
}

fun login(user: String, pass: String): Outcome<LoginError, Session>

when (val r = login("omer", "secret")) {
    is Outcome.Failure -> when (val e = r.error) {
        LoginError.InvalidCredentials -> println("bad credentials")
        is LoginError.Network -> println("network ${e.code}")
    }
    is Outcome.Success -> println("logged in: ${r.value.token}")
}
```

The `when` is exhaustive over your own error type. With Arrow this becomes `Either<LoginError, Session>` and the `either { }` DSL. Either way, the point is the same: expected failures belong in the type signature, and exceptions are for bugs and unrecoverable states.

## Modern Kotlin and the ecosystem

### K2 and smarter smart casts

K2, the compiler frontend that shipped with Kotlin 2.0, is a complete rewrite. It compiles up to about twice as fast and is smarter about smart casts:

```kotlin
fun describe(x: Any): String {
    val isString = x is String
    return if (isString) "string of length ${x.length}" else "not a string"
}
```

The type check is stored in a variable, and K2 still smart casts `x` to `String`.

### New language features

Guard conditions in `when`, stable since 2.2:

```kotlin
fun render(state: LoadState): String = when (state) {
    is LoadState.Success if state.data.isEmpty() -> "empty view"
    is LoadState.Success -> "list of ${state.data.size}"
    LoadState.Error -> "error view"
}
```

Non-local `break` and `continue` through inline lambdas, also stable since 2.2:

```kotlin
outer@ for (batch in batches) {
    batch.forEach { item ->
        if (item < 0) break@outer
        println("processing $item")
    }
}
```

Two more were still in preview at the time of the lesson. Explicit backing fields kill the `_state`/`state` two-property idiom:

```kotlin
class SearchViewModel : ViewModel() {
    val state: StateFlow<UiState>
        field = MutableStateFlow<UiState>(UiState.Loading)

    fun load() {
        state.value = UiState.Ready
    }
}
```

Inside the class it's a `MutableStateFlow`; outside it's a `StateFlow`. And context parameters, which replace context receivers:

```kotlin
context(logger: Logger)
fun process() {
    logger.log("processing...")
}
```

### Multiplatform awareness

```kotlin
// commonMain
expect fun platformName(): String

// androidMain
actual fun platformName() = "Android ${Build.VERSION.SDK_INT}"

// iosMain
actual fun platformName() = UIDevice.currentDevice.systemName
```

`expect`/`actual` is a compile-time contract: every target has to provide an `actual`. The modern guidance is to use it for small leaf functions, and interfaces with dependency injection for larger abstractions. The old Kotlin/Native memory model, with frozen objects and `InvalidMutabilityException`, has been gone since 1.7.20. The new one is a tracing GC that allows shared mutable state, with the same discipline as the JVM.

The next lesson moved from the language to the UI: [Accessibility in Jetpack Compose](/writing/accessibility-in-jetpack-compose).

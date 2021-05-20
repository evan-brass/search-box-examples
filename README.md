# Search Box examples
A search box is a simple case where we can potentially encounter the "double click" race condition.  A faulty program may show the wrong results if the user clicks the search button while a search is already in flight.


## 1. Faulty
The first version is in `faulty.mjs`.  It is a naive implementation which produces incorrect results.

## 2. Singleton
A slightly improved version is in `singleton.mjs`. It won't produce incorrect results, but aborts more requests than it needs too.

## 3a. Washing Machine
The version ins `async-function.mjs` instantiates a single async function instead of instantiating an async function per query.  It only cancels the requests it needs to and doesn't display incorrect results.

## 3b. Re Entrant Washing Machine
Located in `re-entrant.mjs`, this version was an expirement with an idea I had.  It uses a non async function that is "re-entered" over and over again.  It uses an exception to "pause" the function when it enters a state.  While I think it turned out pretty cool, I generally believe that the exception system should only be used for "exceptional behavior" instead of the comman case like this version does.

The problem with the version in `async-function.mjs` is how difficult it is to specify transitions.  You inevitably end up with a `Promise.race()` with each potential case, followed by some sort of check to see which of the transitions was actually run.

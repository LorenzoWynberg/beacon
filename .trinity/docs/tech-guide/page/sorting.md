# Least reliable first sort

`src/sort.js` exports `sortLeastReliableFirst(services, now)`. It returns a new array, never mutating the input, ordered by ascending `uptimeOverWindow(s, now)` (24 h). Services with no uptime value (non-finite key) go last. Ties, and no-data services among themselves, keep input order through an index tiebreak. Covered by `test/sort.test.js`.

## Wiring in `src/main.js`

- `sortOn` starts `false` and is not persisted: no `localStorage`, no URL state.
- `orderedGroups(services, now)` calls `groupServices`, then, when `sortOn`, sorts the services inside each group. Group order is unchanged; services are never moved between groups.
- `renderServices` renders from `orderedGroups` and records the rendered flat order in `lastOrder`.
- `displayOrder(services, now)` is the flat rendered order; `refreshUptimes` pairs cards with it by index.
- The `#sort-toggle` click handler flips `sortOn`, sets `aria-pressed` and the text `Least reliable first: on` or `off`, and re-renders from `lastStatus`.
- On an unchanged refetch with sort on, if the recomputed order differs from `lastOrder`, `renderServices` runs instead of the in-place refresh.

The `main.js` wiring has no automated test, as the repo has no DOM harness.

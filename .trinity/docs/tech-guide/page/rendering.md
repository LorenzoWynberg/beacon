# How the page renders

`index.html` loads `src/main.js` as a module. `main.js` fetches `status.json`, passes the text to `parseStatus`, and renders into `#updated` and the services area, which is either the flat `#services` list or grouped sections.

## `src/status.js`

Pure functions, covered by `test/status.test.js`:

- `parseStatus(text)` parses JSON and returns `{ updated, services }`. It throws when the text is not valid JSON, is not an object, or has no `services` array. Each service keeps `name` (empty string if not a string), `status` run through `normaliseStatus`, and, only when it is a string, `note`. It also keeps `group`, only when it is a string with non-blank content, stored trimmed.
- `groupServices(services)` returns `{ grouped, groups }`. See [grouping](grouping.md) for the merge, ordering and `Other` rules.
- `normaliseStatus(v)` trims and lowercases a string and returns `up` or `down`; anything else returns `unknown`.
- `isFutureTimestamp(updated, now, toleranceMs = FUTURE_TOLERANCE_MS)` is true when `updated` is a string more than `toleranceMs` ahead of `now`; the default is 5 minutes, and exactly 5 minutes ahead is tolerated as clock skew.
- `isStale(updated, now)` is true when `updated` is not a string, the date is invalid, it is a future timestamp beyond tolerance, or the age is more than 24 h; exactly 24 h is not stale.
- `formatRelativeAge(updated, now)` returns `unknown` when `updated` is not a string, the date is invalid or it is a future timestamp beyond tolerance (including a NaN `now`), `just now` under 60 s, `N min ago` under an hour, `N h ago` under a day, otherwise `1 day ago` or `N days ago`. `now` may be a Date, a string or a number.

## `src/main.js`

`serviceItem(s)` builds one `li.service` with a name and a badge: `badge--up` labelled Up, `badge--down` labelled Down, or `badge--unknown` labelled Unknown. A string `note` renders as `p.service__note`.

`render` calls `groupServices`. When `grouped` is false, the items are appended to the flat `ul#services`. When `grouped` is true, each group becomes a `section.group` holding an `h2.group__title` (id `group-<index>`) and its own `ul.services` with `aria-labelledby` pointing at that heading. The sections are inserted before `#services`, then the empty `#services` is removed.

The `updated` value is shown in a `time` element whose title holds the local time. For a future timestamp beyond tolerance the header reads "Updated time unknown" with the `time` element wrapping "time unknown" and keeping the raw value in `datetime`.

When `isStale` is true, a `p.banner` is added to `#notices` saying the status may be stale, with the age or "last updated time unknown".

The fetch uses `status.json?t=<now>` with `cache: 'no-store'`. A non-OK response, a fetch failure or a parse failure logs `console.warn`, on the first load clears the page (`showError` also removes any `main > section.group`) and shows a `role="alert"` box titled "Status unavailable" in `#notices`.

### Refresh

`render` is split into `renderHeader` (age line and stale banner; an unchanged banner keeps its node so the `role="status"` region does not re-announce) and `renderServices` (rebuilds the list, re-inserting `#services` after `#notices` if grouped mode detached it). After a successful first load `main.js` starts a poller that re-fetches `status.json` every 5 minutes. If the text is unchanged only the header is refreshed; if it changed and parses, both parts re-render. A failed or unparseable refresh only logs `console.warn` and keeps the current view; the error box is first-load-only.

## `src/refresh.js`

Pure, DOM-free. Exports `REFRESH_INTERVAL_MS` (300000), `hasChanged(last, next)` and `startPoller({ run, intervalMs, timer, doc, now })`, which returns `{ stop }`. `timer` provides `setInterval`/`clearInterval`. Ticks are skipped while `doc.visibilityState` is `hidden`; when the tab becomes visible and at least one interval has passed since the last fetch, a catch-up run fires. Overlapping runs are skipped and run errors never stop the poller.

## Head metadata

`index.html` sets the title `beacon — service status`, a `meta name="description"`, and an inline SVG favicon (a green circle) as a `data:` URI, so no icon file is served.

`main.js` is not unit tested; `status.js` functions, including `isStale` boundaries, are.

# How the page renders

`index.html` loads `src/main.js` as a module. `main.js` fetches `status.json`, passes the text to `parseStatus`, and renders into `#updated` and the `#services` list.

## `src/status.js`

Pure functions, covered by `test/status.test.js`:

- `parseStatus(text)` parses JSON and returns `{ updated, services }`. It throws when the text is not valid JSON, is not an object, or has no `services` array. Each service keeps `name` (empty string if not a string), `status` run through `normaliseStatus`, and, only when it is a string, `note`.
- `normaliseStatus(v)` trims and lowercases a string and returns `up` or `down`; anything else returns `unknown`.
- `isStale(updated, now)` is true when `updated` is not a string, the date is invalid, or the age is more than 24 h; exactly 24 h is not stale.
- `formatRelativeAge(updated, now)` returns `unknown` when `updated` is not a string or the date is invalid (including a NaN `now`), `just now` under 60 s, `N min ago` under an hour, `N h ago` under a day, otherwise `1 day ago` or `N days ago`. `now` may be a Date, a string or a number.

## `src/main.js`

Each service becomes an `li.service` with a name and a badge: `badge--up` labelled Up, `badge--down` labelled Down, or `badge--unknown` labelled Unknown. A string `note` renders as `p.service__note`. The `updated` value is shown in a `time` element whose title holds the local time.

When `isStale` is true, a `p.banner` is added to `#notices` saying the status may be stale, with the age or "last updated time unknown".

The fetch uses `status.json?t=<now>` with `cache: 'no-store'`. A non-OK response, a fetch failure or a parse failure logs `console.warn`, clears the page and shows a `role="alert"` box titled "Status unavailable" in `#notices`.

`main.js` is not unit tested; `status.js` functions, including `isStale` boundaries, are.

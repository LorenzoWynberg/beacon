# How the page renders

`index.html` loads `src/main.js` as a module. `main.js` fetches `status.json`, passes the text to `parseStatus`, and renders into `#updated` and the `#services` list.

## `src/status.js`

Pure functions, covered by `test/status.test.js`:

- `parseStatus(text)` parses JSON and returns `{ updated, services }`, where each service keeps `name`, `status` and, only when it is a string, `note`. It throws on invalid JSON or a missing `services` array.
- `formatRelativeAge(updated, now)` returns `unknown` when `updated` is not a string or the date is invalid (including a NaN `now`), `just now` under 60 s, `N min ago` under an hour, `N h ago` under a day, otherwise `1 day ago` or `N days ago`. `now` may be a Date, a string or a number.

## `src/main.js`

Each service becomes an `li.service` with a name and a `badge--down` badge when `status` is `down`, and `badge--up` for any other value. A string `note` renders as `p.service__note`. The `updated` value is shown in a `time` element whose title holds the local time. Any fetch or parse failure replaces the header text with "Status is unavailable right now."

`main.js` is not unit tested, and neither are the `parseStatus` failure paths.

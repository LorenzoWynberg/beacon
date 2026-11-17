# Updating the status

Edit `status.json`, commit and push to `main`. GitHub Pages can take up to about 10 minutes to publish.

```json
{
  "updated": "2026-11-16T18:00:00+00:00",
  "services": [
    { "name": "Database", "status": { "state": "down", "since": "2026-11-16T14:30:00+00:00" }, "note": "Investigating." }
  ]
}
```

- `updated`: ISO 8601 timestamp with offset; the page shows it as a relative age.
- `services[].name`: display name.
- `services[].status.state`: `up` or `down` (case and surrounding spaces ignored); anything else shows as Unknown.
- `services[].status.since`: optional ISO 8601 timestamp with offset, shown as `· since 3 h ago`. A missing or unparseable value, or one more than 5 minutes in the future, shows no since text.
- `services[].status.history`: optional array of earlier `{ "state", "since" }` entries, oldest first. When a service changes state, append the previous `{state, since}` and set the new current `state` and `since`. The page shows `99.9% up · 24 h` beside the since text only when history (or the current `since`) reaches back at least 24 hours; the figure has one decimal, rounded down, and `unknown` time is excluded. An invalid, out-of-order or non-array history (including one whose last entry is not before the current `since`) is ignored as a whole. Entries may be trimmed once a newer entry precedes the 24 h window, so the oldest kept `since` is at or before 24 h ago. The figure is only as accurate as every transition being appended.
- A plain string `status` shows an `Invalid status` badge on that row only; the other rows are unaffected.
- `services[].note`: optional short text under the service.
- `services[].group`: optional heading the service is listed under. See [Grouping services](groups.md).

If `updated` is missing, invalid or more than 24 hours old, the page shows a stale banner. If `status.json` is missing or malformed, it shows "Status unavailable".

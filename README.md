# beacon

A single static status page for your services. No build step, no dependencies:
plain HTML, CSS and ES modules, hosted on GitHub Pages from `main` at `/`.

## status.json

```json
{
  "updated": "2026-11-16T18:00:00+00:00",
  "services": [
    { "name": "Website", "status": { "state": "up", "since": "2026-11-16T15:00:00+00:00" } },
    { "name": "Database", "status": { "state": "down", "since": "2026-11-16T14:30:00+00:00" }, "note": "Investigating." }
  ]
}
```

- `updated`: ISO 8601 timestamp with offset.
- `services[].name`: display name. A missing or blank name shows "Unnamed service".
- `services[].status.state`: `up` or `down`, case- and whitespace-insensitive. Any other value shows a grey `Unknown` badge.
- `services[].status.since`: optional ISO 8601 timestamp with offset, shown as `· since 3 h ago`. A missing or unparseable value, or one more than 5 minutes in the future, shows no since text.
- A plain string `status` (the old format) shows an `Invalid status` badge on that row only; the other rows are unaffected.
- `services[].note`: optional short text.
- `services[].group`: optional group name, trimmed. Names merge case-insensitively under the first-seen spelling, and groups appear in order of first appearance. Services with no group go under a final "Other" heading. A file with no groups renders as one flat list.

If `updated` is missing, unparseable, more than 24 hours old, or more than
5 minutes in the future relative to the viewer's clock (up to 5 minutes ahead is
tolerated as clock skew), a banner reads
"This status may be stale", and the header shows "Updated time unknown". If `status.json` is missing or malformed (invalid
JSON, not an object, or `services` not an array), the page shows "Status unavailable".

## Dark mode

The page follows your OS light/dark preference. A "Dark mode" button in the header overrides it and remembers the choice in this browser.

## Updating the page

Edit `status.json`, commit, push to `main`. Pages may take up to ~10 minutes to publish.

## Local preview

`fetch` does not work over `file://`. From the repo root run:

```sh
python3 -m http.server 8000
```

then open http://localhost:8000/.

## Tests

From the repo root, with Node 22.12 or newer:

```sh
node --test
```

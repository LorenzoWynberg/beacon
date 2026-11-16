# beacon

A single static status page for your services. No build step, no dependencies:
plain HTML, CSS and ES modules, hosted on GitHub Pages from `main` at `/`.

## status.json

```json
{
  "updated": "2026-11-16T18:00:00+00:00",
  "services": [
    { "name": "Website", "status": "up" },
    { "name": "Database", "status": "down", "note": "Investigating." }
  ]
}
```

- `updated`: ISO 8601 timestamp with offset.
- `services[].name`: display name.
- `services[].status`: `up` or `down`.
- `services[].note`: optional short text.

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

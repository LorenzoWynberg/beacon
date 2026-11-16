# Updating the status

Edit `status.json`, commit and push to `main`. GitHub Pages can take up to about 10 minutes to publish.

```json
{
  "updated": "2026-11-16T18:00:00+00:00",
  "services": [
    { "name": "Database", "status": "down", "note": "Investigating." }
  ]
}
```

- `updated`: ISO 8601 timestamp with offset; the page shows it as a relative age.
- `services[].name`: display name.
- `services[].status`: `up` or `down`; anything other than `down` shows as Up.
- `services[].note`: optional short text under the service.

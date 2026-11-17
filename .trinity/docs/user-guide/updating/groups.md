# Grouping services

Add an optional `group` to a service in `status.json` to list it under a heading.

```json
{ "name": "Database", "group": "API", "status": "down" }
```

- Names are trimmed and match case-insensitively; the first spelling used is shown.
- Groups appear in the order they first appear in the file.
- Services without a group, or in a group called "Other", are listed under a final "Other" heading.
- If no service has a group, the page shows one flat list with no headings.

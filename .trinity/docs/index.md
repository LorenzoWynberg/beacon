# Status board

A single static page that lists named services with an Up or Down badge each, read from `status.json`. Plain HTML, CSS and ES modules; no build step, no dependencies. Hosted on GitHub Pages from `main` at `/`.

## Rules for every change

- Keep it dependency-free and build-free; the page must work when served as static files.
- `node --test` (Node 22.12 or newer) is the only gate and must exit 0.

## Commands

- `node --test`: run the unit tests in `test/`.
- `python3 -m http.server 8000`: preview locally (`fetch` fails over `file://`).

## Guides

- [How the page renders](tech-guide/page/rendering.md)
- [Share metadata](tech-guide/page/share-metadata.md)
- [Service groups](tech-guide/page/grouping.md)
- [Updating the status](user-guide/updating/status-json.md)
- [Grouping services](user-guide/updating/groups.md)

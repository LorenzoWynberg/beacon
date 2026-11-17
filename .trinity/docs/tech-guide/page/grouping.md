# Service groups

Grouping is opt-in through an optional `group` string on each service in `status.json`.

## `src/status.js`

- `parseStatus` keeps `group` on a service only when it is a string with non-blank content, trimmed. Blank and non-string values are dropped.
- `groupServices(services)` returns `{ grouped, groups }`. When no service has a group it returns `{ grouped: false, groups: [{ name: null, services }] }`, the flat case.
- Otherwise group names merge case-insensitively under the first-seen spelling, and groups are ordered by first appearance. Services with no group, and any group named `other` in any case, collect into a final `Other` group, which is omitted when empty.

## `src/main.js`

`serviceItem(s)` builds one `li.service`. When `grouped` is false, the items go into `#services` as before. When true, each group becomes a `section.group` holding an `h2.group__title` (id `group-<index>`) and a `ul.services` labelled by it with `aria-labelledby`. The sections are inserted before `#services`, and the empty `#services` list is removed. `showError` removes any `main > section.group` before showing the error box.

`groupServices` and the `group` parsing are unit tested in `test/status.test.js`; the DOM render path is not.

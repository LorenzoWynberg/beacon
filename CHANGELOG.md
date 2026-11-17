# Changelog

## 1.1.0 - 2026-11-17

### New: 24-hour uptime on each status card

Each service card can now show how reliable the service has been over the last day, as well as its current state. A muted figure such as `99.9% up · 24 h` appears beside the `· since` text. It has one decimal place and is always rounded down, so a service with 99.96% uptime shows `99.9%`, not `100.0%`. Time spent in an unknown state is left out of the figure.

The figure appears only when the service's history covers the whole 24-hour window. The board never shows a figure for part of a day. A service whose current state began more than 24 hours ago gets a figure without any history. A service that changed state more recently needs history entries that reach back that far. The figure also stays current: every 5 minutes the board updates it in place, even when `status.json` has not changed. It appears when the window fills and disappears when it no longer applies.

### For people who update status.json

Each service's `status` can take an optional `history` array of earlier `{ "state", "since" }` entries, oldest first. When a service changes state, add its previous `state` and `since` to the end of `history`, then set the new current `state` and `since`. Entries must be in strictly ascending time order, and the last one must be earlier than the current `since`. If the history is out of order, malformed or not an array, the board ignores all of it. The card still shows its badge and since text, but no uptime figure. You can drop old entries once a newer entry is older than 24 hours, so long as the oldest entry you keep is at least 24 hours old. The figure is only as accurate as the history: every state change has to be recorded.

The sample `status.json` now includes history for the API service, so the API card shows a 24-hour uptime figure. The format is documented in the README and in the user guide page on updating `status.json`.

## 1.0.0 - 2026-11-17

### New: see how long each service has been in its current state

Each service now shows how long it has been up or down, not only its current state. Next to the badge, the board shows a muted line such as `· since 3 h ago`. Hover over it to see the exact local date and time. The age keeps counting on every automatic refresh, so it stays current without a page reload, even when `status.json` hasn't changed.

To use it, give a service a `status` object with a `state` and an optional `since` timestamp (ISO 8601 with an offset):

```json
{ "name": "Database", "status": { "state": "down", "since": "2026-11-16T14:30:00+00:00" }, "note": "Investigating." }
```

`state` works as before. `up` or `down` is accepted in any case and with surrounding spaces, and any other value shows a grey **Unknown** badge. If `since` is missing, can't be read as a date, or is more than 5 minutes in the future, the row shows its badge with no "since" text.

### Changed: the `status` format (breaking)

The `{ state, since }` object is now the only accepted format for `status`. A service still written the old way, as a plain string like `"status": "up"`, now shows an outlined red **Invalid status** badge. Only that row is affected: the rest of the board keeps rendering normally. If an incident catches `status.json` half-migrated, you get one flagged row instead of a blank page.

**To upgrade:** in `status.json`, replace each `"status": "up"` or `"status": "down"` with `"status": { "state": "up" }`, and add a `since` timestamp wherever you want the board to show how long that state has lasted. The README, the bundled `status.json` and the guides for editing `status.json` and grouping services all use the new format.

## 0.6.0 - 2026-11-17

### New

#### The status board now updates itself

An open status page now keeps itself current. Once the board has loaded, it re-fetches `status.json` every 5 minutes and shows any change you've published, with no reload. A wall display or a tab left open overnight now matches what's in the repo. After you commit and push to `main`, an open page shows the update within about 5 minutes of Pages publishing it.

When `status.json` hasn't changed, the service list is left alone. Only the "Updated" age line and the stale-status banner are refreshed, so the relative time keeps counting and the stale warning appears or clears on time. If the banner text is the same as before, the banner isn't replaced, so screen readers don't announce it again on every check.

In a hidden background tab, the board skips its scheduled checks. When you switch back to the tab and at least 5 minutes have passed since the last check, it fetches right away.

### Improved

#### A failed refresh never blanks a good board

If a refresh fails because of a network error, a bad response or a file that won't parse, the board keeps showing the last good status and tries again on the next check. The red "Status unavailable" box now appears only when the page can't load the status the first time it opens.

#### A hung request no longer freezes updates

Each request for `status.json`, including reading the response, now gives up after 30 seconds. Before this, a request that never answered could stop all later updates without any sign. Now it counts as an ordinary failed refresh and the next check runs as normal. On the first page load, a request that hangs now ends in the "Status unavailable" message instead of a page that never finishes loading.

## 0.5.0 - 2026-11-17

### New: dark mode for the status board

The status board now has a dark appearance. By default, the page opens in light or dark to match your device's setting, and switches on its own if you change that setting while the page is open and haven't picked a mode yourself.

To pick a mode yourself, press the new **Dark mode** button in the header. It shows whether dark mode is on, reading "Dark mode: on" or "Dark mode: off", and works from the keyboard with Tab, then Enter or Space. Your choice is saved in this browser and comes back on later visits, taking priority over your device setting. A saved choice is applied before the page first draws, so it doesn't flash light before turning dark.

The dark palette keeps the board easy to scan. Backgrounds and text stay neutral, and the green and red Up and Down badges remain the strongest colours on the page in both light and dark.

### Good to know

- If your browser blocks storage, the button still switches modes, but the choice lasts only until you close the page.
- With JavaScript turned off, the button is hidden and the page follows your device setting.
- The header layout has changed a little: the page title and the Dark mode button now share the top row, and the "Updated" line sits underneath on its own line.

## 0.4.0 - 2026-11-16

### New: service groups

You can now list related services together under a heading. Give a service an optional `group` in `status.json`, for example `{ "name": "Database", "group": "API", "status": "down" }`, and the board shows each group as its own titled section, one after another. Screen readers announce each section's list by its heading.

Grouping is meant to be forgiving. Group names are trimmed and matched case-insensitively, so `Web`, `web` and ` WEB ` all end up in one group, shown with the spelling used first in the file. Groups appear in the order they first appear in the file. Services with no group, and services in a group called "Other" (in any case), go under a final **Other** heading. That heading only appears when it has services in it. A blank or non-text `group` value is ignored.

### Unchanged: boards without groups

Grouping is opt-in. If no service in your `status.json` has a `group`, the page shows the same single flat list as before, with no headings, so you don't need to change existing files.

The sample `status.json` now uses groups: Website is under **Web**, API and Database are under **API**, and Email, which has no group, appears under **Other**.

### Improved: documentation

The docs now cover the grouped board. A new **Grouping services** guide explains the `group` field and the rules for merging names, ordering groups and the **Other** heading. The `status.json` field reference and the README both list `services[].group`, and the technical guide explains how the page renders grouped and flat boards.

## 0.3.1 - 2026-11-16

### Fixed

**A future `updated` timestamp no longer reads as fresh.** Before this release, a `status.json` whose `updated` time was in the future showed as "just now" and never raised the stale banner, so the board claimed freshness it couldn't confirm. Now, if `updated` is more than 5 minutes ahead of the viewer's clock, the header reads "Updated time unknown" and the "This status may be stale" banner appears, with the last updated time given as unknown. The raw timestamp stays in the `time` element's `datetime` attribute, so you can still inspect it.

**Small clock differences are still tolerated.** A timestamp up to 5 minutes ahead, including exactly 5 minutes, counts as normal clock skew and displays as before (for example, "just now"). Past timestamps work exactly as they did: the banner appears only when `updated` is missing, can't be parsed, or is more than 24 hours old.

### Changed

The README now lists the future-timestamp rule among the conditions that trigger the stale banner. If you publish `status.json` from a machine whose clock runs fast, keep it within 5 minutes of real time to avoid showing the stale banner.

## 0.3.0 - 2026-11-16

### New

#### Shared links now show a proper preview

When you paste the status board's URL into Slack, X or Discord, it now unfurls into a titled card instead of a bare link. The card reads **Beacon status** with the description *"Live up/down status for every Beacon service, at a glance."* Teammates can see what the link is before they click it. The preview is text only and has no image.

### Improved

#### One official address for search engines

The board now declares `https://lorenzowynberg.github.io/beacon/` as its canonical URL. Search engines treat that as the one official address, so copies of the board reached by slightly different URLs no longer compete with it in search results. This closes the two open SEO follow-ups: the missing canonical link and the missing Open Graph/Twitter preview tags.

Nothing else on the board changes. It looks and behaves exactly as before, with the same services, badges and status data.

## 0.2.0 - 2026-11-16

### Highlights

#### Status board: tab title, favicon and link preview

The status board looks more like a real site in your browser and when you share it. The browser tab now reads **beacon — service status**, and a small green circle favicon matching the "up" badge makes the tab easy to find. Links to the board shared in chat apps or shown in search results now carry a short description of the page.

The board's behaviour hasn't changed. It reads the same JSON file and shows the same up/down badges.

## 0.1.0 - 2026-11-16

### New

#### A live status board on GitHub Pages
Status board is now live: a single page on GitHub Pages that lists each named service with an **Up** or **Down** badge, plus an optional short note under each one. The page reads everything from `status.json`. To update it, edit that file, commit, and push to `main`. GitHub Pages can take up to about 10 minutes to publish the change. The page also shows how long ago the status was last updated, taken from the file's `updated` timestamp.

### Improved

#### Stays honest when the data goes wrong
Someone updates the board by editing a JSON file by hand, so it now tells you when that file can't be trusted:

- **Stale data:** if `updated` is missing, invalid or more than 24 hours old, a banner warns that the status may be out of date.
- **Broken file:** if `status.json` is missing or malformed, the page shows "Status unavailable" instead of a blank screen.
- **Unrecognised status:** a service whose status is anything other than `up` or `down` shows as **Unknown**, and the rest of the board renders normally. Capital letters and stray spaces are ignored, so `" Up "` still counts as up.

#### Always the latest status
The page fetches a fresh copy of `status.json` on every load, so visitors see the most recently published status instead of an old copy saved by their browser.

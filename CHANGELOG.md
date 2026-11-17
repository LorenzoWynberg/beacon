# Changelog

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

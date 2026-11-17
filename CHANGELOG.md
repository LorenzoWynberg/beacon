# Changelog

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

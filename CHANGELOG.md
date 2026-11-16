# Changelog

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

# Share metadata

`index.html` carries a canonical link, Open Graph tags and Twitter card tags in `<head>`.

- Canonical and `og:url` are `https://lorenzowynberg.github.io/beacon/`.
- `og:type` is `website`, `og:site_name` is `Beacon`, and `og:title` and `twitter:title` equal the `<title>` (`Beacon status`).
- `og:description` and `twitter:description` are `Live up/down status for every Beacon service, at a glance.`
- `twitter:card` is `summary`. No `og:image` or `twitter:image` tag exists, and the test asserts that.

`test/meta.test.js` reads `index.html` and checks that each tag occurs exactly once with these values. Change the page and the test together.

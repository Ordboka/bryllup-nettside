# Wedding Website

A simple, responsive website for our wedding. It includes the date, location, schedule of events, and a photo gallery. The visual theme uses earthy, natural tones and features the invitation artwork from `image.png` to reflect the mountain setting.

Made with Codex and good vibes.

The homepage is now a bilingual thank-you page featuring `Pictures/After/bryllupsbilde.jpg`.
The original wedding website is preserved at `original.html`, including its gallery and game.
Both pages share the saved language preference.

The album button requires JavaScript and a user click. Its destination is encoded rather
than included in HTML links, and the homepage asks compliant crawlers not to index it or
follow links. These measures deter basic scraping only: the destination remains recoverable
from the public JavaScript. Guaranteed privacy requires access control, such as a backend
that authenticates guests before supplying the link, or sharing the album privately.

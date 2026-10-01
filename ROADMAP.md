# GentlyFix: feature roadmap

Status key: [x] done, [ ] not started.

## Foundation (done)
- [x] India business data: 81,955 listings from Overture Maps (free, open), loaded into Supabase/PostGIS. Pipeline in `data-pipeline/`.
- [x] App reads everything from Supabase: businesses, categories (table) and category icons (public Storage bucket `category-icons`). No third-party API key in the app.
- [x] Light and dark theme, native navigation, memoized lists, on-device caching.
- [x] Database migrations: `data-pipeline/schema.sql`, then `data-pipeline/schema-phase1.sql` (both applied).

## Phase 1 (do these before ratings)
- [x] Real search: category autocomplete, fuzzy name search with `pg_trgm`, and a "near me" or manual-location toggle.
- [x] Filters for has phone and distance.
- [ ] Filter for open now. Blocked: the open data has no business hours. Owners will supply hours in phase 2.
- [x] A map view, a list/map toggle, and "get directions". (Map uses OpenStreetMap tiles in a WebView.)
- [x] Save and favourite businesses. (Stored on the device until accounts exist.)
- [x] Report wrong info, and suggest an edit or add a missing business. (Submissions land in `business_reports` / `business_suggestions` for review in the Supabase dashboard.)
- [x] Offline cache of recent results.
- [x] Pull-to-refresh, retry and proper empty/error states. (Home pull-to-refresh reloads services and retries GPS.)
- [x] Services cached on the device for 24 hours, with icons prefetched to disk.

### Phase 1 follow-ups
- [ ] Review screen for reports and suggestions (today: Supabase dashboard only), and a script to apply approved ones.
- [ ] Rate limiting on report/suggestion inserts (currently open to the public key).
- [ ] Better fuzzy search for multi-typo queries (use `word_similarity`).
- [ ] Sharper category icons (current ones are 64 px). TV Repairer and Decoration have no businesses yet.
- [ ] Add Foursquare Open Source Places and OSM data to fill thin categories (plumber, welder, locksmith, carpenter).
- [ ] Production map tiles (OpenStreetMap's public server is for light use only).
- [ ] Rotate the old RapidAPI key (it is in git history).

## Phase 2
- [ ] User accounts (phone OTP) and ratings/reviews: one review per user per business, Bayesian average, moderation.
- [ ] Claim-your-business flow, verified by OTP to the listed phone.
- [ ] Business dashboard: profile editor, photos, review replies and basic analytics (views, calls, directions taps).
- [ ] Call and WhatsApp tap tracking, so owners see value and you get the first engagement metric.
- [ ] Verified badges, and "responds quickly" badges.
- [ ] Push notifications for new reviews and replies.

## Phase 3
- [ ] Request-a-quote: the user posts "my tap is leaking" and nearby verified providers respond. This is the largest growth lever.
- [ ] In-app booking and job tracking. Verified-job reviews come from here.
- [ ] Chat or masked calling to protect users' numbers.
- [ ] Service price ranges or rate cards.
- [ ] Subscription or promoted listings for owners. Keep ads clearly labelled so ratings stay trusted.
- [ ] Multi-language support (important if you are targeting India), and a web version for SEO. "Plumber in Pune" landing pages generated from your DB can bring organic traffic.
- [ ] Emergency (24×7) tag and availability.

# `tabforge rating` — Bookmark Rating Commands

Rate your bookmarks on a scale of 1–5 to surface your most valuable links.

## Commands

### `tabforge rating set <url> <score>`

Assign a numeric rating (1–5) to a bookmark.

```bash
tabforge rating set https://example.com 5
```

### `tabforge rating get <url>`

Display the current rating for a bookmark.

```bash
tabforge rating get https://example.com
# https://example.com: 5/5
```

### `tabforge rating clear <url>`

Remove the rating from a bookmark.

```bash
tabforge rating clear https://example.com
```

### `tabforge rating top [--count <n>]`

List the highest-rated bookmarks. Defaults to top 10.

```bash
tabforge rating top
tabforge rating top --count 5
```

Output format:
```
[5/5] Example Site  https://example.com
[4/5] Another Site  https://another.com
```

### `tabforge rating avg`

Print the average rating across all rated bookmarks.

```bash
tabforge rating avg
# Average rating: 4.20/5
```

## Notes

- Ratings are stored as a `rating` field on each bookmark entry.
- Unrated bookmarks are excluded from `top` and `avg` calculations.
- Ratings persist in your git-backed bookmark store and sync across machines.

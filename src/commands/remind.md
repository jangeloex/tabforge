# `tabforge remind`

Helps you revisit bookmarks you may have forgotten about by tracking when you last visited them.

## Subcommands

### `tabforge remind list [options]`

Prints bookmarks that haven't been visited recently.

**Options:**

| Flag | Default | Description |
|------|---------|-------------|
| `-d, --days <number>` | `30` | Number of days before a bookmark is considered stale |

**Example:**

```bash
# Show bookmarks not visited in 30 days (default)
tabforge remind list

# Show bookmarks not visited in the last 7 days
tabforge remind list --days 7
```

---

### `tabforge remind visited <url>`

Marks the given bookmark as visited right now, updating its `lastVisited` timestamp in the store.

**Example:**

```bash
tabforge remind visited https://example.com
```

---

## How staleness is determined

- If a bookmark has a `lastVisited` field, that date is used.
- If a bookmark has never been marked visited but has an `addedAt` field, that date is used as a fallback.
- Bookmarks with neither field are ignored.

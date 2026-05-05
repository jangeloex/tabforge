# `tabforge priority`

Manage priority levels on your bookmarks to surface what matters most.

## Subcommands

### `priority set <url> <level>`

Assign a numeric priority level to a bookmark.

| Level | Label  |
|-------|--------|
| 1     | low    |
| 2     | medium |
| 3     | high   |

```bash
tabforge priority set https://example.com 3
# Set priority to high for https://example.com
```

### `priority clear <url>`

Remove the priority from a bookmark.

```bash
tabforge priority clear https://example.com
# Cleared priority for https://example.com
```

### `priority list [--level <n>]`

List all bookmarks that have a priority assigned, sorted highest first.
Use `--level` to filter to a specific priority level.

```bash
tabforge priority list
# [HIGH] Example Site — https://example.com
# [LOW]  Another Site  — https://another.com

tabforge priority list --level 3
# [HIGH] Example Site — https://example.com
```

## Notes

- Priority is stored as a numeric field on each bookmark object.
- Bookmarks without a priority are excluded from `priority list` output.
- Use in combination with `tabforge sort` to order your full bookmark list.

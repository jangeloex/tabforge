# `tabforge score`

Rank your bookmarks by a multi-signal relevance score.

## Usage

```
tabforge score [options]
```

## Options

| Flag | Description | Default |
|------|-------------|--------|
| `-n, --top <n>` | Show top N results | `10` |
| `--all` | Show all bookmarks with scores | false |
| `--json` | Output results as JSON | false |

## Scoring Signals

Each bookmark is scored using a weighted combination of:

| Signal | Weight | Description |
|--------|--------|-------------|
| Rating | 30% | Star rating (0–5) |
| Visits | 25% | Visit count relative to most-visited |
| Recency | 20% | How recently the bookmark was visited |
| Priority | 15% | `high` / `medium` / `low` |
| Favorite | 10% | Whether the bookmark is favorited |

Scores are expressed as a percentage (0–100%).

## Examples

```bash
# Show top 10 bookmarks by score
tabforge score

# Show top 5
tabforge score --top 5

# Export all scores as JSON
tabforge score --all --json
```

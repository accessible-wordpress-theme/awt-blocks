# Performance history

One row per main-branch CI run, appended by the "Performance budgets"
job. The data lives on the **`perf-history`** branch (the workflow bot
cannot push to protected `main`):

```bash
git fetch origin perf-history
git show origin/perf-history:docs/perf-history.csv
```

Columns: `date, sha, editor_tti_ms, editor_floor_tti_ms,
editor_overhead_ms, editor_tbt_ms, css_kb_gz, js_kb_gz`.

# Ranking edit history design

Scope instrumented
- create ranking
- edit ranking metadata/items (rename + add/remove/reorder)
- add item
- remove item
- item-level edit
- explicit reorder endpoint
- restore from historical snapshot

Storage model
- Snapshot-per-edit (chosen) using one history row that stores:
  - action type
  - user-visible summary
  - full ranking snapshot JSON (title, description, visibility, ordered items)
  - created timestamp
- Why snapshot-per-edit over row-per-change:
  - restore becomes deterministic and single-read (no replay engine)
  - lower implementation risk in current codebase where edits happen through multiple endpoints
  - supports mixed edits (rename + reorder + add/remove) in one atomic entry
- Tradeoff:
  - higher storage usage than row-per-change
  - acceptable for current ranking sizes and frequency

Retention
- keep full history indefinitely for now
- no auto-prune in this slice; can add a cap/TTL later without changing API shape

Authorization
- history list/restore endpoints require auth and ranking ownership checks
- non-owner calls return not found/forbidden behavior consistent with existing ranking routes

# Kihon — SQL and databases

## Form

1. **Parameterized queries only** — no string-concatenated SQL with user/input data.
2. **Migrations are forward, reviewed, and reversible when possible** — ship schema change as a named migration; don’t “fix prod by hand” without a recorded path.
3. **Transactions for multi-step writes** — commit/rollback boundaries explicit; no partial applies left silent.
4. **Least privilege DB roles** — app runtime ≠ migration/admin role; no shared superuser in app configs (see [`secrets.md`](secrets.md)).
5. **No secrets in connection strings in git** — hostnames ok in examples; passwords/tokens from env or secret manager.
6. **Touch production carefully** — prefer read replicas / explain analyze on large queries; destructive DDL has a backup or expand-contract plan stated first.

## Exceptions

One-off DBA break-glass: document in the change note (redacted), don’t pretend it was a migration.

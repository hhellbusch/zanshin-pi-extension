# Kihon — git hygiene

## Form

1. **One idea per commit** — message says *why*, not only *what*.
2. **Don’t force-push shared default branches** (`main` / `master`) — feature branches only, and only when you own them and haven’t shared widely.
3. **Pull before push** — `git pull --rebase` (or the repo’s stated equivalent) on the branch you’re updating.
4. **No secrets in history** — if committed, rotate + purge per consumer process; don’t “fix” by committing a deletion alone.
5. **Don’t commit machine junk** — `.env`, tokens, `kubeconfig`, IDE spam; fix `.gitignore` instead.
6. **Submodules** — commit inside the submodule first, then bump the parent SHA (never edit submodule files only in the parent tree).

## Exceptions

Emergency revert commits and empty “kick CI” commits: say so in the message.

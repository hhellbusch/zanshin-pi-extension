# Kihon — Ansible

Minimum form. Role design and collection strategy stay in consumer `devops/ansible/` guides.

## Form

1. **FQCN for modules** — `ansible.builtin.copy`, not bare `copy` (unless the project explicitly standards otherwise).
2. **Idempotent by default** — tasks should be safe to re-run; shell/command used only when no module exists, with `creates`/`removes`/`changed_when` as appropriate.
3. **No secrets in playbooks/vars committed** — Vault, ansible-vault, or external secret lookup (see [`secrets.md`](secrets.md), [`vault.md`](vault.md)).
4. **`become` intentional** — only where needed; don’t global-become for convenience.
5. **Check mode considered** — for risky plays, note whether `--check` is meaningful or which tasks are skipped.
6. **Inventory is data** — don’t bury environment-specific hosts in role defaults; keep env vars/inventory clear.
7. **Defaults over flag forests** — new `enable_*` / extra-vars need a reason (experiment mat vs unpaid config). That’s craft **convention over configuration** if the role is becoming a control panel.

## Exceptions

One-shot break-glass command tasks: comment why no module, and don’t leave passwords in the task.

If the playbook is growing real control flow (nested `when`/`loop`, homemade "standard library" roles that encode domain rules), that's **craft** — orchestration vs program — not a missing Ansible kihon bullet. See `ENGINEERING-PRINCIPLES.md`.

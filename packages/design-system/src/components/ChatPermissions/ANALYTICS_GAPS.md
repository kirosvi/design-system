# ChatPermissions — Analytics Gaps

Per [`docs/metrics/contract.md`](../../../../../docs/metrics/contract.md) (Closed-Target Gaps).

Audited: 2026-10-21 · Owner: Design System team

## Already covered (not gaps)

| Target | Seam | Node |
|---|---|---|
| Trigger | `ChatPermissionsTrigger` `{...rest}` + `ref` | `<button>` |
| Tool row toggle | `ChatPermissionsItem` `{...rest}` + `ref` | `<label>` |
| Popover panel `data-*` / `aria-*` / handlers / `ref` | `ChatPermissionsContent` `{...rest}` → `PopoverContent` (`data-slot='chat-permissions-content'`) | `div[role=dialog]` |

## Gaps

None.

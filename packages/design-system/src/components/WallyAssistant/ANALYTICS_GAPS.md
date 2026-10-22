# WallyAssistant — Analytics Gaps

Per [`docs/metrics/contract.md`](../../../../../docs/metrics/contract.md) (Closed-Target Gaps). Covers `WallyAssistant` and the L2 data views in this folder (`ChatViewProvider`, `ChatMessageView`, `ChatPartView`, `ChainOfThoughtView`, `ApprovalCardView`).

Audited: 2026-10-22 · Owner: Design System team

## Already covered (not gaps)

| Target | Seam | Node |
|---|---|---|
| Panel root `data-*` / `aria-*` / `id` / `ref` / `className` | `WallyAssistant` `{...rest}` → `Chat` | `<section>` |
| Header, title, header actions, banners, input tools, input, empty state | Slot instances (`header`, `headerTitle`, `headerActions`, `footerStart`, `inputTools`, `input`, `emptyState`) | consumer nodes |
| Custom parts, step bodies, actions rows | Whatever `renderPart`, `renderStepContent`, `renderMessageActions` return | consumer nodes |
| View roots | `ApprovalCardView`, `ChainOfThoughtView` `{...rest}` | `div` / `ol` |

## Closed-target gaps

| Target | Callback workaround | Composition seam |
|---|---|---|
| Suggestion pills | `onSuggestionSelect(item)` | Pass no `suggestions`; render `ChatSuggestions` in `emptyState` / `footerStart` |
| Textarea, Send, Stop | `onSubmit(text)`, `onStop()` | `input` |
| Permissions trigger and rows | `onPermissionChange(permission, allowed)` | `inputTools` with your own `ChatPermissions` (pass no `permissions`) |
| Context chip remove | `onContextRemove(item)` | `input` |
| Copy, thumbs | `onCopy(message, text)`, `onFeedback(message, value)` | `renderMessageActions` with `MessageAction` (spec v2 §6.3 recipe) |
| Approval options | `onApprovalRespond(response, approval)` | `ApprovalCardView` children via `renderPart` |
| Retry | `onRetry(message, part)` | `renderPart` (error) with `AssistantMessageError action={<Button …/>}` |
| Scroll-to-latest button (always the default `ConversationScrollButton`) | — (pure UI scroll, no product event) | Custom layout with `Conversation` + `ConversationScrollButton` |
| Step and summary toggles, Show more | — | `renderPart` with `ChainOfThought*` or `UserMessageBubble showMore` |
| Links, inline-code copy and code-block copy inside markdown | — | `markdown` with `AssistantMessageMarkdown components={{ a, inlineCode, codeBlock }}` wrapping the exported parts |

## Rules

- No analytics-named props; `meta` is never written to the DOM; `data-analytics-props` is never parsed.
- Next decision point: when product asks for per-target analytics inside the closed panel.

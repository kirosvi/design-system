# Wally AI chat: architecture v2 (data model, data views, Conversation, WallyAssistant)

> **User decision 2026-10-22: ChatPanel renamed to WallyAssistant** (folder, files, symbols, story `AI/WallyAssistant`). The v1 composed-panel e2e `Chat/ChatPanel.e2e.ts` became `Chat/ChatComposed.e2e.ts` (`describe('Component: ChatComposed')`). Also: the scroll-to-latest button is the stock small Button with no custom shape, there is no `scrollButton` slot and `useConversation()` is not exported (no custom scroll controls).

> **Extends** the approved v1 spec `docs/superpowers/specs/2026-10-21-ai-components-design.md`; its "User decisions" still apply. **Nothing built is renamed.** Claims marked *verified* were checked against `packages/design-system/src` on 2026-10-21.
>
> This version folds in four stress tests: a CopilotKit mapper, a custom SSE/REST mapper, two years of API evolution, and consumer DX. §15 logs every gap and how it was resolved.

**Shape: three layers, all compound.**
- **L1, open parts.** The built families, plus the new `Conversation` family, `AssistantMessageLoader` and `AssistantMessageError`.
- **L2, data views.** `ChatViewProvider`, `ChatMessageView`, `ChatPartView`, `ChainOfThoughtView`, `ApprovalCardView` and the pure function `deriveChatState()`.
  - They turn the DS data model into L1 parts.
  - They are exported, so custom layouts reuse every rule instead of re-implementing it.
- **L3, `WallyAssistant`.** The closed component: data and callbacks go in, the Figma panel comes out. It is built only from L2 and L1 exports.

**Unchanged:** no renames, no new dependencies (exception: `marked` and `remend` for the DS markdown renderer, addendum A), and no CopilotKit, AG-UI or AI SDK imports or types in the DS.

| Requirement | Where it is met |
|---|---|
| R1 CopilotKit only through headless hooks | The mapper and the wiring live in the app (§10.1). The DS imports nothing from CopilotKit or AG-UI. |
| R2 dumb components | Only UI-local state: scroll stickiness, step open toggles, and an optional uncontrolled draft (§1). |
| R3 maximally compound | Every visual piece is an exported L1 part, every data rule is an exported L2 view or function, and every seam hands back the default (§6.3). |
| R4 DS-owned, versionable data model | `WallyAssistant/model.ts` (§3), the identity rules (§7.2) and the versioning policy (§8). |
| R5 Conversation | `Conversation*` (§4.1, §7.6). |
| R6 no renames; AI Elements as the example | §2.2 maps AI Elements to our names and lists what we borrowed. |
| R7 closed component | `WallyAssistant` (§6). The open parts stay public (§5). |

---


## ⚠️ User answers (2026-10-21): open questions resolved

1. **Reasoning step:** open automatically while live, folded when done (the AI Elements Reasoning behavior). A manual user toggle always wins.
2. **WallyAssistant default approval options:** as in Figma 182:4099. A SplitButton "Always allow in this session" with "Allow once" in its menu, plus Reject.
3. **While an approval is pending:** Send is blocked. Typing still works.
4. **A resolved approval card** stays docked above the input until the next user message or the next pending approval.
5. **Visuals not in Figma:** the scroll-to-bottom button, AssistantMessageError and the danger tone for an error step all ship as specified. Retry uses the `RefreshCcw` icon. All of them go to design review later.
6. **i18n:** English defaults, overridable through `labels`. No translation infrastructure in v1.
7. **History pagination and virtualization** are out of scope for v1.
8. **Leftovers from the compound-layer review**, to be fixed in this iteration:
   - `ChatPermissionsContent` must set `data-slot='chat-permissions-content'`, now that PopoverContent places its own slot before the spread, and needs a ref test.
   - `ChainOfThought.test.tsx:10` looks up an element by data-slot. Replace that lookup with test ids.
   - ChatInput: make Esc→`onStop` work inside a Drawer or Dialog without the host recipe, if that can be done cleanly: e.g. handle Esc in capture phase on the textarea while running and `preventDefault` so the dismissable layer skips it. Otherwise keep the recipe and document why.

## 0. Decisions

| # | Decision | Evidence |
|---|---|---|
| 1 | Three layers: L1 parts → L2 data views → L3 WallyAssistant. WallyAssistant uses only exported L2 and L1 pieces. | R3/R7. Without exported views, the custom layouts in the stress tests had to re-implement the fold, the Working row, icons, docking and copy/feedback, and they drifted from WallyAssistant (stress 2, 3, 4). |
| 2 | Built internals stay internal: the ChatInput box, context bar and disclaimer; the ApprovalCard caption, surface and status row; the UserMessage text and fade; the step icon, label and metric cells. | *Verified:* their content is already a prop, and none of them is an interactive target. Their roots always render them, so an exported copy couldn't be recomposed, and extracting them would move baselines. |
| 3 | `ConversationContent` renders the built `ChatBody` as its scroll element. | `role=log`, the default `aria-label`, `px-16 pt-12 pb-16`, `data-slot='chat-body'` and the `--body` test id all stay. `Chat/ChatComposed.e2e.ts` uses `chat--body`. |
| 4 | `Conversation` is transparent in the test-id cascade. | The `useTestId()` transparent-wrapper pattern (Popover). A `conversation` slot would turn `chat--body` into `chat--conversation--body`. |
| 5 | The content column has no gap. The empty state renders inside the scroller and is not centered. | v1 §3.1: the 30px actions row is the gap between messages. `ChatGreeting`'s `pt-103` assumes ChatBody's `pt-12`, which puts the block top at 163px (Figma 44:1738). |
| 6 | Errors use the new `AssistantMessageError`, not `Alert`. | *Verified in `Alert.tsx`:* no `data-slot`; `className` isn't forwarded; an inline `min/maxWidth` style; and it re-provides its raw `data-testid`, which cuts the cascade. |
| 7 | A chain-of-thought block folds under its `summary` only once the run is over. A live reasoning step is shown open. Both are derived from data, with no timers. | Designer note 498:523: "…then the whole run collapses into a final summary". AI Elements Reasoning. Folding as soon as text followed made the block flicker between tool calls (stress 1, 4). |
| 8 | Consumer render callbacks run through `useRenderEveryTime` (`Table/lib/useRenderEveryTime.ts`). The default node is built in the compiled view and handed out as `defaultRender`. `markdown` is a component. Callbacks must not call hooks. | *Verified:* `RenderCallback` renders the callback as its own component, so the host never sees an `undefined` it could fall back from (stress 2, 4). A fresh default node per call re-parsed every answer on every delta (stress 3). See also TABLE_DESIGN.md → React Compiler. |
| 9 | Lifecycle unions (`ChatStatus`, `ChatStepStatus`, `ChatApprovalStatus`) are closed. Vocabularies (icon keys, step kinds, option kinds) are open (`ChatOpen<…>`). | Statuses drive visuals, so a typo should fail to compile. The vocabularies belong to the app. Unknown runtime values still get a neutral visual (§8). |
| 10 | Model type names never equal component names. | `ChatSuggestionItem` (the component `ChatSuggestion` exists), `ChatToolPermission` (`ChatPermissions*`), `ChatContextItem` (`ChatInputContext.ts`). `ApprovalCardStatus` is an existing type. |
| 11 | Docking: the pending approvals of the last message dock above the input. When none is pending, the message's last approval stays docked as its resolved row until a newer message exists. Every other approval renders inline. | The built `ApprovalDocked`/`ApprovalResolved` stories keep the card in place, so ApprovalCard's focus handoff and its always-mounted `role=status` keep working. Keeping only one resolved card docked stops several HITL calls from stacking up (stress 1). |
| 12 | CopilotKit HITL cards render in place through `renderPart`: it returns CopilotKit's element, which renders `ApprovalCardView`. `onApprovalRespond` is for backends that take the answer over REST or SSE. | *Verified (stress 1, `@copilotkit/core` 1.79.1):* `respond` exists only in the render props, and whether args are still streaming or the tool is executing is private core state. |
| 13 | The log gets `tabIndex={-1}`: a focus target for scripts, not a Tab stop. | The scroll button hands focus to it. A WallyAssistant log always contains focusable rows (Copy on every user message), so keyboard users can scroll by tabbing. Custom layouts can pass `tabIndex={0}`. |
| 14 | No new dependencies, except `marked@18.1.1` and `remend@1.4.0` for the DS markdown renderer (22.2 KB gz; amended 2026-10-22 by the markdown addendum, user-approved). | `use-stick-to-bottom` is still not added; the core we need is about 60 lines (§7.6). The DS owns presentational markdown (`AssistantMessageMarkdown`, the default `markdown`); the app can still replace `markdown`. See `2026-10-22-ai-chat-markdown-addendum.md`. |
| 15 | This work starts after the integration workflow that is in progress lands. Popover and ChatPermissions aren't touched. | The uncommitted `Popover/PopoverContent.tsx` change (a consumer `ref`, and `data-slot` moved before the spread) belongs to that workflow. |
| 16 | Callbacks receive DS objects (message, part, suggestion, permission, context item), never bare ids. Handler-only callbacks are read through a ref that always holds their latest value. | Server calls need `meta`, which holds backend ids. Inline app callbacks must not re-render the whole log on every delta (stress 2, 3). |
| 17 | `ChatStep.label` is required. The DS computes no step text: "Thinking..." and "Thought for 5s" come from the mapper. Only the synthetic Working row uses `labels.working`. | "Required unless the kind is reasoning" lived only in JSDoc. Tightening it later would be a major release (stress 2, 3, 4). |
| 18 | Times are data (`createdAt`, an ISO string). Formatting is a prop (`formatTimestamp`), defaulting to the DS `formatRelativeTime`. | A preformatted "2m ago" in the model went stale and tied the mapper to the wall clock (stress 2, 3, 4). |
| 19 | `meta` and custom `data` are typed `unknown`. There is no `ChatJsonValue` and no `CHAT_MODEL_VERSION`. | *Verified (stress 3, 4):* interfaces and `Record<string, unknown>` aren't assignable to a JSON index type (TS2322). Nothing read the version constant; the package semver already carries the version. |
| 20 | While the last message has a pending approval, Send is disabled. The draft stays editable, and Stop stays available while the reply streams. | Sending would start a new run while a tool call still has no result (stress 1). *Verified:* `ChatInputSubmit` already takes `disabled`, so ChatInput doesn't change. |
| 21 | WallyAssistant's own props never reuse DOM attribute names. Besides `onSubmit` and `onCopy`, which are already used, `title`, `defaultValue` and `onError` are reserved now. | Adding a prop called `title` later fails with TS2430 (stress 3). |
| 22 | DS code targets ES2022, so it uses no `Array.prototype.findLast`. | *Verified:* the `lib` in `typescript-config/base.json` is `es2022`. |

---

## 1. Layers

```
APP   CopilotKit headless hooks · custom SSE/REST · anything
      └─ mapper (pure, app-owned, unit-tested): External → ChatSnapshot (+ callbacks)
                               │ props only
L3    WallyAssistant (closed)                                            WallyAssistant/WallyAssistant.tsx
                               │ renders
L2    ChatViewProvider · ChatMessageView · ChatPartView ·
      ChainOfThoughtView · ApprovalCardView · deriveChatState()     WallyAssistant/*
                               │ renders
L1    Chat* · Conversation* (new) · ChatInput* · ChatPermissions* · ApprovalCard* · UserMessage*
      AssistantMessage* (+Loader, +Error: new) · MessageActions* · ChainOfThought* (+'error')
                               │ uses
L0    Button · SplitButton · DropdownMenu · Tooltip · Popover · Switch · Badge · TagClose · Copyable
      Separator · Text · WallyIcon · utils/Collapse · utils/formatDateTime · src/icons · shimmer-text
MODEL WallyAssistant/model.ts (types only) — imported by L2 and L3; L1 never imports it
```

| Owner | State |
|---|---|
| App | Messages and threads, run and reasoning durations, markdown parsing, the tool → label and icon-key mapping, the allow-list, persisted feedback, and the clock that keeps relative times fresh |
| Conversation | Scroll stickiness |
| L2 views | Step open toggles, kept per step id in `ChainOfThoughtView` |
| WallyAssistant | The draft, only when `value` is not passed |
| Built parts | Unchanged: bubble expand, step open state when uncontrolled, ApprovalCard focus |

---

## 2. Component catalog

**Legend:**
- **[B]** built, unchanged
- **[+]** built, with an additive change
- **[N]** new

### 2.1 Parts and views

| Family | Part | Element | data-slot | Test-id slot | Source |
|---|---|---|---|---|---|
| Chat | [B] Chat, ChatHeader, ChatHeaderActions, ChatFooter, ChatGreeting, ChatSuggestions, ChatSuggestion, ChatTrigger | as built | as built | as built | Figma 2:42, 44:1464, 44:1738, 8:3101, 101:1034 |
| | [+] ChatHeaderTitle | `div` | chat-header-title | title | gains `label` (§4.4) |
| | [+] ChatBody | `div role=log` | chat-body | body | JSDoc points to Conversation |
| Conversation | [N] Conversation | `div` (relative flex column) | conversation | transparent | AI Elements Conversation |
| | [N] ConversationContent | `ChatBody` → inner `div` | chat-body → conversation-content | body | ConversationContent |
| | [N] ConversationEmptyState | `div` → `ChatGreeting` | conversation-empty-state | empty-state | ConversationEmptyState |
| | [N] ConversationScrollButton | DS `Button` inside a `Tooltip` | conversation-scroll-button | scroll-button | ConversationScrollButton |
| AssistantMessage | [B] AssistantMessage, AssistantMessageContent | as built | | | |
| | [N] AssistantMessageLoader | `div role=status` | assistant-message-loader | loader | AI Elements Loader/Shimmer; Figma Working row 469:341 |
| | [N] AssistantMessageError | `div role=alert` | assistant-message-error | error | AI SDK `errorText`, AG-UI `RUN_ERROR` (not in Figma) |
| ChainOfThought | [B] ChainOfThought | `ol` | chain-of-thought | chain-of-thought | |
| | [+] ChainOfThoughtStep | `li` with its row | as built | step | `status` adds `'error'` |
| ChatInput, ChatPermissions, ApprovalCard, UserMessage, MessageActions | [B] all parts | as built | | | |
| WallyAssistant (L2) | [N] ChatViewProvider | no DOM | — | — | |
| | [N] ChatMessageView | its root is `UserMessage` or `AssistantMessage` | user-message / assistant-message | `user-message-{i}` / `assistant-message-{i}` | |
| | [N] ChatPartView | renders the part's own L1 element | — | — | |
| | [N] ChainOfThoughtView | its root is `ChainOfThought` | chain-of-thought | chain-of-thought | AI Elements ChainOfThought + Reasoning |
| | [N] ApprovalCardView | its root is `ApprovalCard` | approval-card | approval-card | AI Elements Confirmation |
| | [N] `deriveChatState()` | pure function | — | — | |
| WallyAssistant (L3) | [N] WallyAssistant | its root is `Chat` | chat | root | our addition (AI Elements has no closed component) |

### 2.2 AI Elements and our equivalents

| AI Elements | Ours | Borrowed |
|---|---|---|
| Conversation / ConversationContent / ConversationEmptyState / ConversationScrollButton | The same four names (§4.1) | stick-to-bottom while streaming, the scroll-to-latest button, the empty state |
| Message (user) / MessageContent | UserMessage / UserMessageBubble / UserMessageShowMore | — |
| Message (assistant) / MessageResponse (Streamdown) | AssistantMessage / AssistantMessageContent, plus the app's `markdown` component with `streaming`, `messageId` and `partId` | a seam for a streaming-safe parser |
| MessageActions / MessageAction / MessageToolbar | MessageActions / MessageAction / MessageTimestamp, plus `renderMessageActions` | the label doubles as aria-label and tooltip |
| Reasoning (opens and closes itself; "Thought for N s") | a reasoning `ChatStep`: open while live, closed when done, and a manual toggle wins | auto open/close, without timers |
| ChainOfThought / Header / Step | ChainOfThought / ChainOfThoughtStep. `ChainOfThoughtView` folds a finished run under its summary and fills gaps with a "Working..." row | — |
| Tool (7 states), ToolInput, ToolOutput | The `ChatStepStatus` superset maps to the running/done/error visuals. Output goes in `content` (markdown); rich output goes through `renderStepContent` | the state superset |
| Confirmation (Request/Accepted/Rejected/Actions) | ApprovalCard (gated by status) plus ApprovalCardView | parts that gate themselves on status |
| Suggestions / Suggestion with `onClick(suggestion)` | ChatSuggestions / ChatSuggestion, with `onSuggestionSelect(item)` | callbacks that receive objects |
| Shimmer | the built `shimmer-text` utility | — |
| Loader | AssistantMessageLoader | — |
| Task (sub-agent log) | a nested ChainOfThought under an `agent` step | — |
| PromptInput / PromptInputSubmit (status, onStop) / PromptInputTools | ChatInput / ChatInputTextarea / ChatInputSubmit (`isRunning`), plus the `inputTools` slot | — |
| Sources, InlineCitation | Not built (no Figma). Use `custom` parts. The markdown component gets `messageId` and `partId`, so it can resolve `[1]`. | — |
| MessageBranch | Not built. Keep branch info in `meta` and render it through `renderMessageActions`. | — |
| Attachments | Not built. Use `custom` user parts. | — |
| Plan, Queue, Checkpoint, Context, ConversationDownload | Not built. | — |

---

## 3. Data model: `WallyAssistant/model.ts`

```ts
/**
 * Wally chat data model, owned by the design system and independent of CopilotKit, AG-UI and the AI SDK.
 * The app writes one pure mapper (its API → these types); WallyAssistant renders the result, streaming included.
 *
 * Rules (mapper obligations: spec §7.2)
 * - Plain data: no ReactNode, functions, Date or class instances. Times are ISO 8601 strings. `meta` and
 *   custom `data` are opaque to the DS (never read, rendered or serialized) and should stay JSON-serializable.
 * - Every message, part, step and option has an `id` that never changes across snapshots.
 * - Snapshots are immutable: pass new arrays and objects on change; keep unchanged nodes by identity where you can.
 * - Empty strings and empty arrays mean "absent".
 * - Renderers never throw on an unknown type, status, kind or icon value. New union members arrive in
 *   minor releases, so every `switch` over a DS union needs a `default` branch.
 */
export type ChatId = string;
/** Opaque app data, e.g. backend ids for feedback calls. */
export type ChatMeta = Readonly<Record<string, unknown>>;
/** Open vocabulary: known literals autocomplete, any other string still type-checks. */
export type ChatOpen<T extends string> = T | (string & {});

/** Same literals as AI SDK `ChatStatus`. 'error' behaves like 'ready'; the failure itself is an `error` part. */
export type ChatStatus = 'ready' | 'submitted' | 'streaming' | 'error';

/** Figma 483:1899 step types (resolved to src/icons inside the DS), or any key from the `icons` prop. */
export type ChatIconKey = ChatOpen<
  | 'thinking' | 'plan' | 'decision' | 'subagent' | 'tool' | 'command' | 'web-search' | 'query'
  | 'datastore' | 'api' | 'read' | 'fetch' | 'filter' | 'create' | 'edit' | 'cite' | 'threat'
  | 'scan' | 'pending' | 'summary' | 'created'
>;

interface ChatPartBase {
  readonly id: ChatId;
  readonly meta?: ChatMeta;
}

/** Assistant text is markdown (rendered by `markdown`); user text is plain, whitespace kept.
 *  While streaming, `text` grows under the same `id`: snapshots, never deltas. */
export interface ChatTextPart extends ChatPartBase {
  readonly type: 'text';
  readonly text: string;
}

/** A superset of AI SDK tool states, CopilotKit ToolCallStatus and AG-UI events:
 *  pending = args streaming · running = executing · awaiting-approval = waiting for a human ·
 *  done = has a result · error = failed · denied = the user rejected it · cancelled = the run stopped first. */
export type ChatStepStatus =
  | 'pending' | 'running' | 'awaiting-approval' | 'done' | 'error' | 'denied' | 'cancelled';

/** Changes defaults only: reasoning → Brain icon, open while live; tool → Wrench; agent → Bot. */
export type ChatStepKind = ChatOpen<'reasoning' | 'tool' | 'agent'>;

/** One chain-of-thought row (Figma chain-item 201:1660). Recursive for sub-agents and grouped calls. */
export interface ChatStep {
  readonly id: ChatId;
  readonly status: ChatStepStatus;
  /** Localized row text: "Thinking...", "Thought for 5s", "Searched for ABC". */
  readonly label: string;
  readonly kind?: ChatStepKind;
  /** Machine name of the tool or agent ('propose_add_to_denylist'). Never rendered; for `renderStepContent`. */
  readonly name?: string;
  /** `null` = Figma "Simple" row (no icon cell, no connector). Absent = the kind's default. */
  readonly icon?: ChatIconKey | null;
  /** Right-aligned mono result (Figma "Simple-result"), e.g. "1,204". */
  readonly metric?: string;
  /** Collapsible body, markdown: reasoning text, tool output, error detail. Grows while the step is live.
   *  Rendered before `steps`. */
  readonly content?: string;
  /** Nested steps. For an ordered sub-agent log (text, step, text), put the text in child steps with `icon: null`.
   *  A sub-agent's own text never goes into the answer. */
  readonly steps?: readonly ChatStep[];
  readonly meta?: ChatMeta;
}

/** One block of steps, rendered as one ChainOfThought. */
export interface ChatChainOfThoughtPart extends ChatPartBase {
  readonly type: 'chain-of-thought';
  readonly steps: readonly ChatStep[];
  /** "Worked for 3m 45s", or "Thought for 12s" for reasoning-only runs. When set, the block folds under this
   *  row once the run is over (§7.3). Leave it out to keep the block flat (e.g. a single reasoning step). */
  readonly summary?: string;
}

/** Same literals as the built `ApprovalCardStatus`. */
export type ChatApprovalStatus = 'pending' | 'approved' | 'rejected';
/** Figma 182:4099: the first non-reject option is the primary button; other non-reject options go into its
 *  SplitButton menu; 'reject' options are secondary buttons. Unknown kinds count as allow. */
export type ChatApprovalOptionKind = ChatOpen<'allow-always' | 'allow-once' | 'reject'>;
export interface ChatApprovalOption {
  readonly id: ChatId;
  readonly kind: ChatApprovalOptionKind;
  /** Localized button or menu text. */
  readonly label: string;
}

/** Human-in-the-loop request (tool approval or interrupt). The answer leaves through `onApprovalRespond`;
 *  the new status arrives in the next snapshot — the DS keeps no optimistic state. */
export interface ChatApprovalPart extends ChatPartBase {
  readonly type: 'approval';
  readonly status: ChatApprovalStatus;
  /** What Wally wants to do, markdown: inline code, a fenced args block (Figma 171:1790). */
  readonly content: string;
  /** Default: allow-always, allow-once, reject, with ChatLabels texts (Figma 182:4099). */
  readonly options?: readonly ChatApprovalOption[];
  /** Disables the buttons: the answer can't be sent yet, or one is in flight. */
  readonly disabled?: boolean;
  /** Replaces "Approved"/"Rejected" in the resolved row, e.g. "Expired" with status 'rejected'. */
  readonly resolvedLabel?: string;
}

/** A failure shown inside an answer. A run that fails before any output is an assistant message with only this part. */
export interface ChatErrorPart extends ChatPartBase {
  readonly type: 'error';
  /** Localized plain text. */
  readonly text: string;
  /** Shows Retry when `onRetry` is set. */
  readonly retryable?: boolean;
}

/** App-defined generative UI, rendered only by `renderPart`. Type your payload: `ChatCustomPart<AttackChart>`. */
export interface ChatCustomPart<D = unknown> extends ChatPartBase {
  readonly type: 'custom';
  /** Namespaced by convention: 'wallarm.attack-chart'. */
  readonly kind: string;
  readonly data: D;
}

export type ChatUserPart = ChatTextPart | ChatCustomPart;
export type ChatAssistantPart =
  | ChatTextPart | ChatChainOfThoughtPart | ChatApprovalPart | ChatErrorPart | ChatCustomPart;
export type ChatPart = ChatUserPart | ChatAssistantPart;

interface ChatMessageBase {
  readonly id: ChatId;
  /** ISO 8601 → `<time dateTime>`, text from `formatTimestamp`. */
  readonly createdAt?: string;
  readonly meta?: ChatMeta;
}
export interface ChatUserMessage extends ChatMessageBase {
  readonly role: 'user';
  readonly parts: readonly ChatUserPart[];
}
export type ChatFeedback = 'positive' | 'negative';
/** One assistant turn: the mapper folds the turn's reasoning, tool and text source messages into it. */
export interface ChatAssistantMessage extends ChatMessageBase {
  readonly role: 'assistant';
  readonly parts: readonly ChatAssistantPart[];
  /** App-owned current feedback; null or absent = none. */
  readonly feedback?: ChatFeedback | null;
  /** What Copy copies. Default: the text parts joined by a blank line. */
  readonly copyText?: string;
}
export type ChatMessage = ChatUserMessage | ChatAssistantMessage;

export interface ChatSuggestionItem {
  readonly id: ChatId;
  /** Pill text. */
  readonly label: string;
  /** Sent on click; default `label`. */
  readonly prompt?: string;
  readonly meta?: ChatMeta;
}
/** One "Always allowed in this conversation" switch row. */
export interface ChatToolPermission {
  readonly id: ChatId;
  /** Tool name, e.g. 'propose_add_to_denylist'. */
  readonly title: string;
  readonly description?: string;
  readonly allowed: boolean;
}
/** A context chip in the input bar (Figma 26:656 / 26:657). */
export interface ChatContextItem {
  readonly id: ChatId;
  readonly label: string;
  /** Default: Quote. */
  readonly icon?: ChatIconKey;
  /** Default true; removing needs `onContextRemove`. */
  readonly removable?: boolean;
}

export interface ChatApprovalResponse {
  readonly approvalId: ChatId;
  readonly optionId: ChatId;
  readonly kind: ChatApprovalOptionKind;
  /** `kind !== 'reject'`. */
  readonly approved: boolean;
}

/** What a mapper returns; it spreads straight into <WallyAssistant {...snapshot} />. */
export interface ChatSnapshot {
  readonly messages: readonly ChatMessage[];
  readonly status: ChatStatus;
  readonly suggestions?: readonly ChatSuggestionItem[];
  readonly permissions?: readonly ChatToolPermission[];
  readonly context?: readonly ChatContextItem[];
}
```

**Left out on purpose.** Each of these can be added later as a minor release, except the last row.

| Left out | Why |
|---|---|
| Per-message and per-part status | Derived from `status` and position (§7.1). AG-UI and CopilotKit don't carry these flags either. |
| Numeric durations, preformatted timestamps | The app passes labels for durations. Times are `createdAt`, formatted by a prop (decision 18). |
| Tool input/output objects | The DS renders display strings. Rich output goes through `renderStepContent`, keyed on `step.name`. |
| Sources, files, branches, loading suggestions | Not in Figma. Until designed, they travel as `custom` parts, `meta` or a filtered list. |
| `ChatJsonValue`, `CHAT_MODEL_VERSION` | Removed (decision 19). |

---

## 4. Open parts: new and additive

Every part follows v1 §1:
- CVA in `classes.ts`, `cn()`, a kebab-case `data-slot` and a `displayName`
- a `ref` on the real node, with `{...rest}` landing there
- the `useTestId` cascade
- tokens only
- the consumer's handler runs first, and `defaultPrevented` stops the DS handler

### 4.1 `Conversation` (new folder)

```ts
export interface ConversationProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
  /** Distance in px from the bottom that still counts as "at bottom". Default 70. */
  threshold?: number;
  /** When it changes, re-stick and scroll to the bottom even if the reader scrolled up. Pass the last user
   *  message id, so sending always reveals the answer. For a thread switch, remount instead: `key={threadId}`. */
  autoScrollKey?: string | number;
}
/** The scroller: renders the built ChatBody (role=log; `ref`, `className`, `aria-*`, `tabIndex` land on it)
 *  around an inner measured column. */
export interface ConversationContentProps extends ChatBodyProps {
  /** Classes for the inner column (`flex flex-col`, no gap — v1 §3.1). */
  contentClassName?: string;
}
export interface ConversationEmptyStateProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title'>, TestableProps {
  ref?: Ref<HTMLDivElement>;
  /** Greeting heading. Default 'How can I help you today?'. */
  title?: ReactNode;
  /** Under the heading, e.g. <ChatSuggestions placement='greeting'>. */
  children?: ReactNode;
}
export interface ConversationScrollButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'color'>, TestableProps {
  ref?: Ref<HTMLButtonElement>;
  /** Accessible name and tooltip. Default 'Scroll to latest message'. */
  label?: string;
}
```

**`Conversation`**
- Renders a `div` with `relative flex min-h-0 flex-1 flex-col`, which takes ChatBody's place between ChatHeader and ChatFooter.
- Keeps the scroll and content elements in `useState`, filled through callback refs, and runs `useStickToBottom` (§7.6).
- Renders `data-testid` only when one is passed, and provides `testIdProp ?? useTestId()` to its children. Inside `<Chat data-testid='chat'>` the ids therefore stay `chat--body`, `chat--scroll-button` and `chat--empty-state`.

**`ConversationContent`**
- Renders `<ChatBody tabIndex={-1} {...props} ref={mergeRefs(ref, setScrollEl)} className={cn('outline-none', className)}>`.
- Inside it: `<div ref={setContentEl} data-slot='conversation-content' className={cn('flex flex-col', contentClassName)}>{children}</div>`.
- Throws outside `Conversation`. A consumer's `tabIndex` wins (decision 13).

**`ConversationEmptyState`**
- Renders `div data-slot='conversation-empty-state'` with `flex flex-col` and test-id slot `empty-state`.
- Inside it: `<ChatGreeting title={title}>{children}</ChatGreeting>`.
- Render it inside `ConversationContent` (decision 5). To replace the greeting entirely, render your own node instead.

**`ConversationScrollButton`**
- `Button variant='outline' color='neutral' size='small'`, icon-only `<ArrowDown />`, inside a `Tooltip` anchored by `ids.trigger`. This is the MessageAction/ChatTrigger pattern; a consumer `id` wins.
- The stock smallest Button, not customised (user decision 2026-10-22: no custom scroll controls). Classes: positioning only, `absolute inset-x-0 bottom-12 mx-auto`. No transform, so nothing clashes with Button's state classes.
- All hooks run first; then it renders `null` while `isAtBottom`, so it holds no Tab stop at the bottom.
- `onClick`:
  1. The consumer's handler runs first.
  2. Unless `defaultPrevented`, it calls `scrollToBottom('smooth')`.
  3. Then `scrollEl.focus({ preventScroll: true })`, so focus doesn't fall to `<body>` when the button unmounts.
- Not in Figma. It reuses Button tokens and is flagged for design review.

### 4.2 `AssistantMessageLoader` and `AssistantMessageError` (AssistantMessage folder)

```ts
export interface AssistantMessageLoaderProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
  /** Default 'Working...'. */
  children?: ReactNode;
}
export interface AssistantMessageErrorProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
  /** Trailing control, e.g. a Retry Button (yours, so analytics land on it). Rendered inside the error's
   *  test-id cascade, so it derives `<error>--<slot>`. */
  action?: ReactNode;
}
```

**`AssistantMessageLoader`**
- Renders `<div role='status' data-slot='assistant-message-loader'>` with `flex items-start gap-6 self-stretch text-xs leading-xs text-text-secondary`.
- Inside it:
  - `<span aria-hidden className={chainOfThoughtIconVariants()}><CircleDashed /></span>`
  - `<span className={chainOfThoughtLabelVariants({ status: 'running' })}>{children ?? 'Working...'}</span>`
- The classes are imported from `../ChainOfThought/classes`, the same precedent as `ChatPermissionsContent` importing `DropdownMenu/classes`.
- It matches the Figma Working row (469:341) pixel for pixel, without list semantics. It is static under reduced motion, because `shimmer-text` already handles that.
- Test-id slot: `loader`.

**`AssistantMessageError`**
- Renders `<div role='alert' data-slot='assistant-message-error'>` with `flex items-start gap-8 self-stretch text-sm text-text-danger`.
- Inside it:
  - `<OctagonAlert size='md' aria-hidden className='mt-2 shrink-0 text-icon-danger' />`
  - `<div className='min-w-0 flex-1 break-words'>{children}</div>`
  - `action`, wrapped in `<TestIdProvider value={testId}>`
- Test-id slot: `error`. Not in Figma; flagged for design review.

Both are direct children of `AssistantMessage`, and its existing `gap-4` spaces them, so no new spacing rule is needed. Composition order (amends v1 §3.6): ChainOfThought → ApprovalCard → AssistantMessageContent → AssistantMessageError → MessageActions. The loader stands alone, before the first output.

### 4.3 `ChainOfThoughtStep`: `status` adds `'error'`

- `status?: 'running' | 'done' | 'error'`, default `'done'`, reflected in the `li`'s `data-status`.
- `chainOfThoughtLabelVariants.status` gains `error: 'text-text-danger'`.
- `chainOfThoughtIconVariants` gains `status: { running: '', done: '', error: 'text-icon-danger' }` (default `'done'`), applied through `cn()` so it overrides the base `text-icon-secondary`.
- The no-argument output of `chainOfThoughtIconVariants()` stays byte-identical, because AssistantMessageLoader relies on it. The running and done classes don't change, so no baselines move.
- Not in Figma; flagged for design review.

### 4.4 `ChatHeaderTitle`: `label?: ReactNode`

- The title shown when there are no children.
- Default: today's markup, `Ask <span className='font-mono font-medium text-text-brand'>Wally</span>` inside the existing `ml-8 truncate` span, so the DOM is identical.
- Needed for i18n: today the only way to change the text is to pass children, and children switch the title to the Variant2 "/" joint.

### 4.5 `ChatBody`

JSDoc only: "For stick-to-bottom and a scroll button use `Conversation`; `ConversationContent` renders ChatBody." Nothing else changes.

---

## 5. Data views (L2, exported from `WallyAssistant/`)

### 5.1 Configuration and `ChatViewProvider`

```ts
export interface ChatMarkdownProps {
  text: string;
  /** The text is still growing (the streaming answer's tail, or the body of a live step): use a streaming-safe parser. */
  streaming: boolean;
  /** 'chain-of-thought': Figma 494:4292 wants InlineCodeSnippet copyable={false} size='sm' text-secondary there. */
  variant: 'answer' | 'chain-of-thought' | 'approval';
  /** Absent for an ApprovalCardView rendered without a message (e.g. a CopilotKit HITL card). */
  messageId?: ChatId;
  /** The part's id — the step's id for chain-of-thought bodies — e.g. to resolve [1] citations from your store. */
  partId: ChatId;
}
export interface ChatPartRenderContext {
  message: ChatMessage;
  /** `message` is the last row. */
  isLast: boolean;
  /** This part is the growing tail of the streaming answer. */
  streaming: boolean;
  placement: 'inline' | 'docked';
  /** The DS rendering of this part (null for custom and unknown types). Wrap it, or return it as is. */
  defaultRender: () => ReactNode;
}
export interface ChatStepRenderContext {
  message: ChatMessage;
  /** The default body: `content` as markdown, then the nested steps (null when both are absent). */
  defaultRender: () => ReactNode;
}
/** Prebuilt nodes for the actions row; null when not applicable (no text, no onFeedback, no createdAt). */
export interface ChatMessageActionNodes {
  copy: ReactNode;
  like: ReactNode;
  dislike: ReactNode;
  timestamp: ReactNode;
}

/** Everything the data views read. WallyAssistant takes the same props; custom layouts pass them to ChatViewProvider. */
export interface ChatViewConfig {
  /** Default 'ready'. */
  status?: ChatStatus;
  labels?: Partial<ChatLabels>;
  /** Icon key → element from src/icons; wins over the built-in Figma 483:1899 table (§7.4). */
  icons?: Readonly<Record<string, ReactNode>>;
  /** Your markdown renderer, defined at module scope (never inline). Default: plain text, whitespace kept.
   *  You own sanitizing. */
  markdown?: ComponentType<ChatMarkdownProps>;
  /** ISO → label. Default: DS formatRelativeTime (honours DateFormatProvider). Give it a new identity on your
   *  clock tick to refresh "2 min ago" — the DS runs no clock. */
  formatTimestamp?: (createdAt: string) => string;
  /** 'docked': the last message's approvals render in the footer (§7.5). Default 'inline' here;
   *  WallyAssistant defaults to 'docked' (Figma). */
  approvalPlacement?: 'docked' | 'inline';
  /** Called for every part, custom and unknown types included. undefined = the default; null = nothing. */
  renderPart?: (part: ChatPart, ctx: ChatPartRenderContext) => ReactNode | undefined;
  /** A step's collapsible body: rich tool output, or a card for one tool via `step.name`.
   *  undefined = the default; null = no body (the row isn't collapsible). */
  renderStepContent?: (step: ChatStep, ctx: ChatStepRenderContext) => ReactNode | undefined;
  /** The actions row's children (Figma Wally order: Copy, ThumbsUp, ThumbsDown, Ellipsis, Timestamp).
   *  undefined = the default order; null = no row. */
  renderMessageActions?: (message: ChatMessage, actions: ChatMessageActionNodes) => ReactNode | undefined;
  /** Absent → approval buttons are disabled. */
  onApprovalRespond?: (response: ChatApprovalResponse, approval: ChatApprovalPart) => void;
  /** Absent → no thumbs. Clicking the pressed thumb sends null. */
  onFeedback?: (message: ChatAssistantMessage, value: ChatFeedback | null) => void;
  /** Fired after Copy copied; Copy itself shows whenever the message has text. */
  onCopy?: (message: ChatMessage, text: string) => void;
  /** Absent → no Retry on error parts. */
  onRetry?: (message: ChatAssistantMessage, part: ChatErrorPart) => void;
}
export interface ChatViewProviderProps extends ChatViewConfig {
  children: ReactNode;
}
export declare const ChatViewProvider: FC<ChatViewProviderProps>; // renders no DOM
```

**What `ChatViewProvider` does**
- **Labels.** Merges them as `{ ...DEFAULT_CHAT_LABELS, ...labels }`.
- **Defaults:**
  - plain-text `Markdown` (`<p className='whitespace-pre-wrap'>`)
  - `formatTimestamp = iso => formatRelativeTime(new Date(iso), new Date(), useDateFormat())`
  - `approvalPlacement: 'inline'`
- **Handlers.** `onApprovalRespond`, `onFeedback`, `onCopy` and `onRetry` go into a ref written in `useLayoutEffect` and read only inside event handlers. Plain `has*` booleans next to it decide what to render. Inline app callbacks therefore never change the context value (decision 16).
- **Context value.** It holds the render-time config: labels, icons, markdown, formatTimestamp, the render callbacks, status and placement. Keep these stable in long threads (§7.7).
- **No provider.** Outside a provider the views use the same defaults and never throw.

### 5.2 Views

```ts
export interface ChatMessageViewProps {
  message: ChatMessage;
  /** Position in the rendered rows: drives the test id (`user-message-{index}` / `assistant-message-{index}`). */
  index: number;
  /** The last row: loader, streaming, docked approvals, always-visible actions. */
  isLast: boolean;
}
export interface ChatPartViewProps {
  part: ChatPart;
  message: ChatMessage;
  isLast: boolean;
  /** 'docked' when you render a docked approval in your own footer. Default 'inline'. */
  placement?: 'inline' | 'docked';
}
export interface ChainOfThoughtViewProps extends Omit<ChainOfThoughtProps, 'children'> {
  part: ChatChainOfThoughtPart;
  message: ChatMessage;
  /** The run is still producing this message: the block stays flat and never folds. */
  active?: boolean;
  /** Append the synthetic "Working..." row: the run is busy but no step is live. */
  working?: boolean;
}
export interface ApprovalCardViewProps
  extends Omit<ApprovalCardProps, 'status' | 'children' | 'caption' | 'approvedLabel' | 'rejectedLabel'> {
  approval: ChatApprovalPart;
  message?: ChatMessage;
  /** Default: the provider's onApprovalRespond. Absent → buttons disabled. */
  onRespond?: (response: ChatApprovalResponse) => void;
  /** ORed with `approval.disabled`; ChatPartView sets it for approvals in older messages. */
  disabled?: boolean;
  /** Replaces the default option buttons: render your own ApprovalCardActions (the analytics seam). */
  children?: ReactNode;
}
```

**`ChatMessageView`**
- **User messages.**
  - Renders `<UserMessage aria-label={labels.you}>` with its index test id.
  - Each part goes through ChatPartView.
  - Then the actions row: Timestamp, then Copy (Figma Type=User). It reveals on hover.
- **Assistant messages.**
  - Renders `<AssistantMessage aria-label={labels.assistant} aria-busy={…§7.1}>`.
  - Each part goes through ChatPartView as a **direct child**, so the built `[&>[data-slot=chain-of-thought|approval-card|message-actions]]` spacing keeps working.
  - Skips empty text parts, chains without steps, and docked approvals (when `isLast && approvalPlacement === 'docked'`).
  - Renders `<AssistantMessageLoader>{labels.working}</AssistantMessageLoader>` when it is the last row, the run is going, and nothing else renders.
  - Renders the actions row unless the turn is still open (`isLast && (running || pending approval)`), with `visible={isLast}`.
- **Empty messages.** An assistant message with nothing to show that isn't loading renders nothing.
- **When the actions row exists.** When at least one non-approval part rendered.
- **The prebuilt nodes:**
  - `copy`: `Copyable` around `MessageAction aria-label={labels.copy}` with `CopyableIcon`. The text is `copyText ?? text parts joined '\n\n'`; `onCopy` fires after copying.
  - `like` / `dislike`: `MessageAction` with `aria-pressed` from `feedback`. Clicking the pressed one sends `null`.
  - `timestamp`: `<MessageTimestamp dateTime={createdAt}>{formatTimestamp(createdAt)}</MessageTimestamp>`.
- **Test ids inside the row.** The nodes are small internal components rendered inside `MessageActions`, so their `useTestId` sees `--actions`.

**`ChatPartView`**

`renderPart` runs first for every part (§5.3). When it returns `undefined`, the default below is used:

| `part.type` | Default |
|---|---|
| `text` in a user message | `<UserMessageBubble showMore={<UserMessageShowMore showMoreLabel={labels.showMore} showLessLabel={labels.showLess} />}>{text}</UserMessageBubble>` |
| `text` in an assistant message | `<AssistantMessageContent><Markdown text streaming variant='answer' messageId partId /></AssistantMessageContent>` |
| `chain-of-thought` | `<ChainOfThoughtView part message active={running && isLast} working={…§7.3} />` |
| `approval` | `<ApprovalCardView approval message disabled={!isLast} />` |
| `error` | `<AssistantMessageError action={retryable && hasRetry ? <Retry /> : null}>{text}</AssistantMessageError>`. `Retry` is `Button variant='ghost' color='neutral' size='small'` with `{labels.retry}` and test-id slot `retry`, calling `onRetry(message, part)`. |
| `custom` or unknown | nothing |

**`ChainOfThoughtView`**
- Follows the lifecycle in §7.3.
- `{...rest}` lands on the root `ChainOfThought` (`ol`).
- Step test ids: `step-{j}`, `step-working` and `step-summary`.

**`ApprovalCardView`**
- **What it renders:** `<ApprovalCard {...rest} status caption={labels.approvalCaption} approvedLabel={resolvedLabel ?? labels.approved} rejectedLabel={resolvedLabel ?? labels.rejected}>`, then `<ApprovalCardContent><Markdown text={content} streaming={false} variant='approval' messageId partId={approval.id} /></ApprovalCardContent>`, then `children ?? defaultActions`.
- **Default actions** (Figma 182:4099; v1 §3.4):
  - Options are `approval.options ?? [allow-always, allow-once, reject]`; for the defaults, ids equal kinds and labels come from ChatLabels.
  - The first non-reject option is the primary `Button`.
  - When more non-reject options exist, it becomes `DropdownMenu` > `SplitButton`: the primary Button, plus a `DropdownMenuTrigger asChild` `Button aria-label={labels.approvalMoreOptions}` with `<ChevronDown />`. The other options become `DropdownMenuItem onSelect` entries.
  - `reject` options are `Button variant='secondary' color='neutral'`.
  - All buttons get `disabled={disabled || approval.disabled || !respond}`.
  - A click sends `{ approvalId, optionId, kind, approved: kind !== 'reject' }`.
  - Test-id slots: `option-{optionId}` and `more`.

### 5.3 Render seams: how they run

```tsx
// Inside a compiled view (ChatPartView shown; renderStepContent and renderMessageActions work the same way).
const defaultNode = defaultPartNode(part, message, …);          // built in the compiled body → memoized on its inputs
const ctx = { message, isLast, streaming, placement, defaultRender: () => defaultNode };
const custom = useRenderEveryTime(() => renderPart?.(part, ctx)); // Table/lib ('use no memo'): runs on every render
return custom === undefined ? defaultNode : custom;              // undefined → default · null → nothing · node → replaces
```

**Rules for render callbacks**
- They are render functions: no hooks inside. Return elements, and put any hooks in the components you return. CopilotKit's `renderToolCall(...)` already works this way.
- They run on every render of their view, so keep them cheap.
- The returned node becomes a direct child of the message. Return DS parts unwrapped, so the built spacing applies. Give a custom card its own `self-stretch mb-8` to match the card rhythm.

### 5.4 Labels: `WallyAssistant/labels.ts`

```ts
export interface ChatLabels {
  /** Header title text; undefined keeps the built "Ask Wally" mark. */
  title?: string;
  region: string;              // 'Wally chat'                    (Chat aria-label)
  log: string;                 // 'Chat messages'                 (log aria-label)
  greeting: string;            // 'How can I help you today?'
  suggestions: string;         // 'Suggestions'
  placeholder: string;         // 'Ask Wally...'
  input: string;               // 'Message Wally'                 (textarea aria-label)
  send: string;                // 'Send'
  stop: string;                // 'Stop response'
  disclaimer: string;          // 'Wally can make mistakes; always verify.'
  scrollToBottom: string;      // 'Scroll to latest message'
  you: string;                 // 'You'
  assistant: string;           // 'Wally'
  showMore: string;            // 'Show more'
  showLess: string;            // 'Show less'
  working: string;             // 'Working...'                    (loader and Working row)
  messageActions: string;      // 'Message actions'
  copy: string;                // 'Copy'
  feedbackPositive: string;    // 'Good response'
  feedbackNegative: string;    // 'Bad response'
  retry: string;               // 'Retry'
  approvalCaption: string;     // 'Requires your approval'
  approvalAllowAlways: string; // 'Always allow in this session'
  approvalAllowOnce: string;   // 'Allow once'
  approvalReject: string;      // 'Reject'
  approvalMoreOptions: string; // 'More approval options'
  approved: string;            // 'Approved'
  rejected: string;            // 'Rejected'
  permissions: string;         // 'Permission settings'
  permissionsHeading: string;  // 'Always allowed in this conversation'
  removeContext: (label: string) => string; // l => `Remove ${l}`
}
export const DEFAULT_CHAT_LABELS: ChatLabels;
```

- Labels are always passed to the parts explicitly. Passing `undefined` would wipe the parts' own defaults, which are written before `{...rest}`.
- Labels are props, not model data, so the function-valued `removeContext` is fine.
- Type translations as `Partial<ChatLabels>`, so a key added in a minor release doesn't break the build.

### 5.5 `deriveChatState()`: one source for every derived rule

```ts
export interface ChatViewState {
  /** `messages`, plus an empty reply { role: 'assistant', id: `${lastUserMessageId}:reply`, parts: [] } while
   *  running and the last message is the user's (the loading row; the same id as the recommended mapper reply). */
  rows: readonly ChatMessage[];
  empty: boolean;            // messages.length === 0
  running: boolean;          // status is 'submitted' | 'streaming'
  awaitingApproval: boolean; // the last row has a pending approval part
  busy: boolean;             // running && !awaitingApproval
  lastUserMessageId?: ChatId;                   // → Conversation autoScrollKey
  /** Placement 'docked' only (§7.5). Render each with <ChatPartView part message={rows.at(-1)} isLast placement='docked' />. */
  dockedApprovals: readonly ChatApprovalPart[];
}
export declare function deriveChatState(
  messages: readonly ChatMessage[], status?: ChatStatus, approvalPlacement?: 'docked' | 'inline',
): ChatViewState; // defaults: 'ready', 'inline'
```

It is a pure function. WallyAssistant and ChatMessageView share its internal helpers (`isRunningStatus`, `isLiveStep`, `getDockedApprovals`, `hasPendingApproval`, `copyTextOf`), so the open and closed paths can't drift apart.

---

## 6. Closed component: `WallyAssistant`

### 6.1 Contract

```ts
/** DOM attribute names WallyAssistant keeps for its own props (now or later); they never reach the root. */
type WallyAssistantReservedProps = 'children' | 'onSubmit' | 'onCopy' | 'title' | 'defaultValue' | 'onError';

export interface WallyAssistantProps
  extends Omit<ChatProps, WallyAssistantReservedProps>, Omit<ChatViewConfig, 'status'> {
  // ── data (a ChatSnapshot spreads straight in)
  messages: readonly ChatMessage[];
  /** Default 'ready'. */
  status?: ChatStatus;
  suggestions?: readonly ChatSuggestionItem[];
  permissions?: readonly ChatToolPermission[];
  context?: readonly ChatContextItem[];

  // ── draft: controlled when `value` is set; otherwise internal and cleared after a send
  value?: string;
  onValueChange?: (value: string) => void;
  /** Disables the textarea, Send and the suggestion pills (e.g. `!agent.isReady`). */
  disabled?: boolean;
  /** Focus management, e.g. focus the input after a thread switch. */
  textareaRef?: Ref<HTMLTextAreaElement>;

  // ── composer callbacks: a missing callback hides or disables its control
  /** Trimmed text. Not called when empty, while running, while an approval is pending, or when disabled. */
  onSubmit: (text: string) => void;
  /** Stop button, and Esc in the textarea while running. In a Drawer, handle Esc in the host (§6.3). */
  onStop?: () => void;
  /** Default: onSubmit(suggestion.prompt ?? suggestion.label). */
  onSuggestionSelect?: (suggestion: ChatSuggestionItem) => void;
  /** Absent, or no permissions → no permissions button in the input. */
  onPermissionChange?: (permission: ChatToolPermission, allowed: boolean) => void;
  /** Absent → context chips aren't removable. */
  onContextRemove?: (item: ChatContextItem) => void;

  // ── slots: undefined = default, null = none, a node replaces it
  header?: ReactNode;
  /** ChatHeaderTitle children, e.g. a thread Select (Figma Variant2). */
  headerTitle?: ReactNode;
  /** New chat, history, close: your Buttons, so analytics land on them. */
  headerActions?: ReactNode;
  /** Replaces the greeting and its pills (e.g. a history-loading state). */
  emptyState?: ReactNode;
  /** Top of ChatFooter, above the suggestions (banners). */
  footerStart?: ReactNode;
  /** Extra toolbar items in the input, between permissions and Send. */
  inputTools?: ReactNode;
  /** Replaces the whole ChatInput composition (you wire value and submit yourself). */
  input?: ReactNode;
}
export declare const WallyAssistant: FC<WallyAssistantProps>; // displayName 'WallyAssistant'
```

- `background` (from `ChatProps`) defaults to `empty ? 'strong' : 'subtle'` (v1 §5.1).
- `approvalPlacement` defaults to `'docked'`.
- The root's `data-*`, `aria-*`, `id`, `ref` and `className` land on the `<section>`.
- A type test asserts that WallyAssistant's own prop names overlap `HTMLAttributes<HTMLElement>` only in the reserved list.

### 6.2 Composition (everything here is an exported L2 or L1 piece)

```tsx
const labels = { ...DEFAULT_CHAT_LABELS, ...labelsProp };
const state = deriveChatState(messages, status, approvalPlacement);   // approvalPlacement defaults to 'docked'
const submit = (text: string) => {
  if (state.awaitingApproval) return;               // Enter still requests submit: guard here too
  onSubmit(text);
  if (value === undefined) setInnerDraft('');
};

<ChatViewProvider status={status} approvalPlacement={approvalPlacement} labels={labelsProp} /* …ChatViewConfig */>
  <Chat background={background ?? (state.empty ? 'strong' : 'subtle')} aria-label={labels.region} {...rest}>
    {header !== undefined ? header : (
      <ChatHeader>
        <ChatHeaderTitle label={labels.title}>{headerTitle}</ChatHeaderTitle>
        {headerActions != null ? <ChatHeaderActions>{headerActions}</ChatHeaderActions> : null}
      </ChatHeader>
    )}
    <Conversation autoScrollKey={state.lastUserMessageId}>
      <ConversationContent aria-label={labels.log} aria-busy={state.busy}>
        {state.empty
          ? emptyState !== undefined ? emptyState : (
              <ConversationEmptyState title={labels.greeting}>{pills('greeting')}</ConversationEmptyState>
            )
          : state.rows.map((m, i) => (
              <ChatMessageView key={m.id} message={m} index={i} isLast={i === state.rows.length - 1} />
            ))}
      </ConversationContent>
      <ConversationScrollButton label={labels.scrollToBottom} />
    </Conversation>
    <ChatFooter>
      {footerStart}
      {!state.empty && !state.running && !state.awaitingApproval ? pills('footer') : null}
      {state.dockedApprovals.map(a => (
        <ChatPartView key={a.id} part={a} message={state.rows[state.rows.length - 1]} isLast placement='docked' />
      ))}
      {input !== undefined ? input : (
        <ChatInput value={draft} onValueChange={setDraft} onSubmit={submit} onStop={onStop}
          isRunning={state.running} disabled={disabled} disclaimer={labels.disclaimer}
          context={context?.length ? <ContextChips items={context} onRemove={onContextRemove} /> : undefined}>
          <ChatInputTextarea ref={textareaRef} placeholder={labels.placeholder} aria-label={labels.input} />
          {permissions?.length && onPermissionChange ? <PermissionsMenu items={permissions} onChange={onPermissionChange} /> : null}
          {inputTools}
          <ChatInputSubmit sendLabel={labels.send} stopLabel={labels.stop}
            disabled={state.awaitingApproval && !state.running} /* Stop stays usable while streaming */ />
        </ChatInput>
      )}
    </ChatFooter>
  </Chat>
</ChatViewProvider>
```

**Internal helpers** (each one is a few lines)
- **`pills(placement)`**
  - `<ChatSuggestions placement label={labels.suggestions}>`, rendered only when there are suggestions.
  - One pill per item: `ChatSuggestion` with test-id slot `suggestion-{i}`, `disabled={disabled}`, and `onClick` → `onSuggestionSelect ? onSuggestionSelect(s) : submit(s.prompt ?? s.label)`.
- **`ContextChips`** (the verified v1 §3.2 recipe from `ChatInput.stories`)
  - Each chip is `<Badge type='secondary' color='blue'>` with test-id slot `context-{i}`.
  - Inside: the resolved icon (default `<Quote />`), the label, then a `TagClose`.
  - The `TagClose` gets `aria-label={labels.removeContext(label)}` and `className='rounded-4 focus-visible:ring-3 focus-visible:ring-focus-primary'`. It sits inside `TestIdProvider value={chipId}`, so it derives `…--context-{i}--close`.
  - It renders only when the chip is removable and `onContextRemove` is set.
- **`PermissionsMenu`** (the `ChatPermissions.stories` precedent)
  - `<ChatPermissions><ChatPermissionsTrigger aria-label={labels.permissions} /><ChatPermissionsContent label={labels.permissionsHeading}>`.
  - Inside: the allowed rows, then `<Separator spacing={4} />` when both groups exist, then the other rows.
  - Each row is a `ChatPermissionsItem` with test-id slot `item-{i}` (i is the index in `permissions`), `checked={p.allowed}` and `onCheckedChange={({ checked }) => onPermissionChange(p, checked)}`.

### 6.3 Override seams (all of them hand back the defaults)

| Need | Seam |
|---|---|
| Wording, i18n | `labels` |
| Tool icons | `icons` |
| Markdown, code, citations | `markdown`, which gets `messageId` and `partId` |
| Generative UI, CopilotKit HITL cards, wrapping a default | `renderPart` with `defaultRender`; `custom` parts |
| One tool's output as a card | `renderStepContent` keyed on `step.name`. The row stays data-driven: ChainOfThought needs `<li>` steps, so the card goes in the body. Alternatively, a separate `custom` part. |
| Ellipsis menu, analytics on copy or thumbs, reordering | `renderMessageActions` with built parts (recipe below) |
| Analytics on approval buttons | `ApprovalCardView` children (your own `ApprovalCardActions`), returned from `renderPart` |
| Header, banners, input tools | `header`, `headerTitle`, `headerActions`, `footerStart`, `inputTools` |
| A different greeting or input | `emptyState`, `input` |
| Full-page layout | `className` with data-slot variants, e.g. `[&_[data-slot=conversation-content]]:mx-auto [&_[data-slot=conversation-content]]:max-w-768` (data-slot is the CSS seam) |
| Fully custom layout | `ChatViewProvider` + `deriveChatState` + `Chat`/`Conversation*` + `ChatMessageView`/`ChatPartView` (the Custom Layout story) |
| Drawer host | `<Drawer onEscapeKeyDown={e => { if (running && (e.target as Element \| null)?.closest('[data-slot=chat-input-textarea]')) { e.preventDefault(); stop(); } }}>`. The drawer sees Esc first (ChatInputProps.onStop JSDoc). Also `<DrawerContent aria-label='Wally'>`. |
| Thread switch | `<WallyAssistant key={threadId}>` |
| History still loading | `emptyState={loading ? <ConversationEmptyState title=''><AssistantMessageLoader /></ConversationEmptyState> : undefined}` together with `background='subtle'` |

Analytics on Copy and the thumbs, composed from built parts:

```tsx
renderMessageActions={(m, a) => m.role === 'user' ? undefined : (
  <>
    <Copyable text={copyTextOf(m)}>
      <MessageAction aria-label='Copy' data-analytics-id='wally.copy'><CopyableIcon /></MessageAction>
    </Copyable>
    {a.like}{a.dislike}<MoreMenu message={m} />{a.timestamp}
  </>
)}
```

### 6.4 Test ids inside `<WallyAssistant data-testid='wally'>`

**Rules**
- Lists that the DS renders get an index suffix (option buttons get their id).
- When a message repeats a part type (for example two text parts), those parts share an id; use `.nth()`.

**Notation**
- `M` is a message's test id, e.g. `wally--assistant-message-1`.
- `C` is a chain's test id, i.e. `M--chain-of-thought`.

**Panel**

| Node | `data-testid` |
|---|---|
| root, header, title, header actions | `wally`, `wally--header`, `wally--title`, `wally--actions` |
| log, scroll button | `wally--body`, `wally--scroll-button` |
| empty state, greeting, suggestion group, pill *i* | `wally--empty-state`, `wally--greeting`, `wally--suggestions`, `wally--suggestion-{i}` |
| message row *i* (index in `rows`; the loading row is last) | `wally--user-message-{i}`, `wally--assistant-message-{i}` |

**Inside a message**

| Node | `data-testid` |
|---|---|
| user bubble, its text, Show more | `M--bubble`, `M--text`, `M--show-more` |
| answer text, loader, error, Retry | `M--content`, `M--loader`, `M--error`, `M--error--retry` |
| chain, step *j*, nested step *k* | `C`, `C--step-{j}`, `C--step-{j}--chain-of-thought--step-{k}` |
| Working row; summary row; a step folded under the summary | `C--step-working`; `C--step-summary`; `C--step-summary--chain-of-thought--step-{j}` |
| inline approval, an option, the chevron, the status row | `M--approval-card`, `M--approval-card--option-{optionId}`, `M--approval-card--more`, `M--approval-card--status` |
| actions row and its nodes | `M--actions`, `M--actions--copy`, `--like`, `--dislike`, `--timestamp` |

**Footer**

| Node | `data-testid` |
|---|---|
| footer, footer pills | `wally--footer`, `wally--suggestions`, `wally--suggestion-{i}` |
| docked approval (ChatFooter opens no cascade; several docked cards share it) | `wally--approval-card`, plus `--option-{id}`, `--more`, `--status` |
| input | `wally--input`, `--input--textarea`, `--input--submit`, `--input--disclaimer` |
| permissions | `--input--permissions--trigger`, `--input--permissions--content`, `--input--permissions--item-{i}` |
| context chips | `--input--context-{i}`, `--input--context-{i}--close` |

### 6.5 Analytics: `WallyAssistant/ANALYTICS_GAPS.md` (contract §Closed-Target Gaps)

These gaps also cover the L2 views in the same folder.

**Not gaps**
- The root's `data-*`, `aria-*`, `id` and `ref` land on the `<section>`.
- Slot instances are consumer nodes: `header*`, `inputTools`, `input`, `emptyState`, `footerStart`.
- Whatever `renderPart`, `renderStepContent` and `renderMessageActions` return is consumer nodes.

**Closed-target gaps**

| Target | Callback workaround | Composition seam |
|---|---|---|
| Suggestion pills | `onSuggestionSelect(item)` | Pass no `suggestions`; render `ChatSuggestions` in `emptyState` / `footerStart` |
| Textarea, Send, Stop | `onSubmit`, `onStop` | `input` |
| Permissions trigger and rows | `onPermissionChange(permission, allowed)` | `inputTools` with your own `ChatPermissions` (pass no `permissions`) |
| Context chip remove | `onContextRemove(item)` | `input` |
| Copy, thumbs | `onCopy`, `onFeedback` | `renderMessageActions` with `MessageAction` (§6.3 recipe) |
| Approval options | `onApprovalRespond(response, approval)` | `ApprovalCardView` children via `renderPart` |
| Retry | `onRetry(message, part)` | `renderPart` (error) with `AssistantMessageError action={<Button …/>}` |
| Step and summary toggles, Show more | — | `renderPart` with `ChainOfThought*` or `UserMessageBubble showMore` |

Rules: no analytics-named props, `meta` is never written to the DOM, and `data-analytics-props` is never parsed. Owner: the Design System team. Next decision point: when product asks for per-target analytics in the closed panel.

---

## 7. Streaming and scroll semantics

### 7.1 Snapshots in, derived state out

**Snapshots, not events.**
- The app folds its stream (AG-UI, SSE, anything) into a new immutable `messages` array plus `status`, and passes them on every delta. The DS has no delta or patch API.
- Throttle on the app side: CopilotKit `useAgent({ throttleMs: 50 })`, an rAF batch, or `useDeferredValue`.

| Value | Rule |
|---|---|
| `running` | `status` is `'submitted'` or `'streaming'` → ChatInput `isRunning` (Send becomes Stop; Esc stops) |
| loading row | `running` and the last message is a user message → `rows` gets an empty reply that renders `AssistantMessageLoader`. The same happens for a last assistant message with nothing to render. |
| `awaitingApproval` | The last row has a pending approval part. Send is disabled unless the reply is streaming (Stop stays usable); footer pills hide; that message's actions row hides. With CopilotKit, `status` stays `'ready'` during the wait — that is normal (§7.5). |
| `busy` | `running && !awaitingApproval` → `aria-busy` on the log and on the last AssistantMessage. It is false while a decision is pending, so assistive tech announces the card. |
| part `streaming` | `running`, the message is the last row, and the part is its last part → `ChatMarkdownProps.streaming` and `ctx.streaming` |
| docked approvals | Placement `'docked'`: the last row's pending approvals; if none is pending, its last approval. Rendered in ChatFooter above the input. Never shown once a newer message exists (§7.5). |
| footer suggestions | `!empty && !running && !awaitingApproval && suggestions?.length` |
| actions row | Every message with at least one rendered non-approval part, except the last while running or awaiting. `visible` on the latest assistant message; hover/focus reveal elsewhere. Copy needs text, the thumbs need `onFeedback`, the timestamp needs `createdAt`. |
| `background` | prop `?? (empty ? 'strong' : 'subtle')` |
| `autoScrollKey` | `lastUserMessageId` |
| status `'error'` | Behaves like `'ready'`. The failure itself is an `error` part where the mapper put it. |

### 7.2 Identity rules (mapper obligations, also written in the `model.ts` header)

1. **Text parts.** A text part's `id` is fixed when it starts; its `text` grows.
2. **Turns.** A turn's id should be `${userMessageId}:reply`, stable from the loading row through the answer or an error. Backend ids go in `meta` (e.g. `meta.sourceIds`). WallyAssistant's loading row uses exactly this id, so the real reply doesn't remount.
3. **Errors.** A run that fails before any output becomes an assistant message with only an `error` part.
4. **Optimistic user messages.** They keep their client id after the server echoes them. Send the client id to the server, and have history echo it back.
5. **Steps.** Step ids are unique within a message, so step toggles survive the stream.
6. **Source-order mappers** (recommended). Steps that arrive after a text part open a new chain-of-thought part; approvals don't close a block. Merging everything into one block followed by one text part (§10.1) is also valid. The DS handles both, because folding happens only at run end.
7. **Structural sharing.** Keep unchanged messages and parts by identity where you can. Correctness doesn't depend on it (§7.7).
8. **Threads.** On a thread switch, remount with `key={threadId}`.

### 7.3 Chain-of-thought lifecycle (`ChainOfThoughtView`, no timers)

```
live(step)  = status ∈ {pending, running, awaiting-approval}, or any child is live
active      = running && the message is the last row                  (ChatPartView → ChainOfThoughtView.active)
working     = active && only approval parts follow the block && no step in the block is live
folded      = summary is non-empty && !active && no step in the block is live
```

**How each state renders**
- **Folded** (Figma 409:3847, designer note 498:523):
  ```tsx
  <ChainOfThought>
    <ChainOfThoughtStep icon={every top-level step is reasoning ? <Brain /> : <Activity />}
                        label={summary} open={toggles[part.id] ?? false}>
      <ChainOfThought>{…steps}</ChainOfThought>
    </ChainOfThoughtStep>
  </ChainOfThought>
  ```
- **Otherwise flat:** the steps, then a synthetic Working row when `working` (`status='running'`, the default icon, `labels.working`). The Working row fills the gaps between tool calls, so the log never looks stalled (the v1 §5.2 adapter precedent).

**When the fold happens**
- When the run ends, or when a newer message makes this one no longer last. That is the designer note's "then the whole run collapses into a final summary".
- A mapper that doesn't want a fold (for example a single "Thought for 5s" step) leaves `summary` out.

**Open state**
- `open = toggles[step.id] ?? (step.kind === 'reasoning' && own status is live)`.
- So a reasoning step is open while it streams and closes when it's done, and any manual toggle wins. This is AI Elements Reasoning without the timer.
- Other steps start closed.
- Toggles live in ChainOfThoughtView's `useState`, keyed by step id. Steps are always controlled, so the toggles survive new snapshots and the fold.

**Step body**
- `renderStepContent?.(step, ctx)` runs first.
- When it returns `undefined`, the body is `content` as `<Markdown variant='chain-of-thought' streaming={own status live} partId={step.id} />`, then the nested `<ChainOfThought>`.
- When it returns `null`, or there is nothing to show, the row isn't collapsible.

### 7.4 Step visuals and icons

**Status → visual**

| `ChatStepStatus` | `ChainOfThoughtStep status` |
|---|---|
| `pending`, `running`, `awaiting-approval` | `running` (shimmer). `awaiting-approval` matches the built ApprovalDocked story, where the HITL step runs while the card waits. |
| `done`, `denied`, `cancelled`, or any unknown value | `done`. The text comes from the label ("Stopped", "Rejected"). |
| `error` | `error` (new: danger label tone and danger icon tint; §4.3). `content` holds the detail. |

**Icon resolution**, tried in order:
1. `icon === null` → the Simple row.
2. `icons[key]` from the app.
3. The internal `STEP_TYPE_ICONS` map (the Figma 483:1899 table).
4. The kind's default: reasoning → Brain, tool → Wrench, agent → Bot.
5. `<CircleDashed />`.

Context chips use the same lookup, with Quote as the default.

**The `STEP_TYPE_ICONS` table.** Every icon was verified to exist in `src/icons`. The table is not exported.

| Key | Icon |
|---|---|
| thinking | Brain |
| plan | ListChecks |
| decision | GitBranch |
| subagent | Bot |
| tool | Wrench |
| command | Terminal |
| web-search | Globe |
| query | Search |
| datastore | Database |
| api | Plug |
| read | FileText |
| fetch | Download |
| filter | Filter |
| create | FilePlus |
| edit | Pencil |
| cite | Link |
| threat | ShieldAlert |
| scan | Radar |
| pending | CircleDashed |
| summary | Activity |
| created | BadgeCheck |

### 7.5 Approvals: the round trip

1. **A pending approval part arrives.** By default it docks above the input; with `approvalPlacement='inline'` it renders in the message. While it is pending, Send is disabled (decision 20).
2. **The user picks an option.**
   - Over SSE or REST: WallyAssistant calls `onApprovalRespond(response, approval)`.
   - With CopilotKit: the card that `renderPart` returned calls `respond` itself (§10.1).
3. **While the answer is in flight**, the app sets `disabled: true`, or keeps its own guard as the CopilotKit card does.
4. **The next snapshot resolves it.** It carries `approved` or `rejected`.
   - The same card instance (keyed by id) swaps to its status row, and ApprovalCard moves focus there when focus was inside the card.
   - The card stays docked until a newer message exists, or until another approval in the turn becomes pending. Then it renders inline at its position.
5. **Other endings.**
   - Expired: `status: 'rejected'` with `resolvedLabel: 'Expired'`.
   - Stopped: `status: 'rejected'` with `resolvedLabel: 'Cancelled'`.
   - Approvals in older messages render disabled.
6. **Status during the wait.**
   - CopilotKit runs HITL tools after the run has resolved, so `isRunning` is false for the whole wait and `status` is `'ready'`. That is normal. The way out is Reject.
   - With SSE, set `status: 'submitted'` when the server resumes after an approval. Recipe for a failed POST: clear `disabled` and append an `error` part.

### 7.6 Stick-to-bottom: `Conversation/useStickToBottom.ts` (internal)

```ts
const reducedMotion = () =>
  typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches; // FeedbackPulse precedent
const isEditable = (t: EventTarget | null) =>
  t instanceof HTMLElement && (t.isContentEditable || t.matches('input, textarea, select'));
const SCROLL_UP_KEYS = new Set(['ArrowUp', 'PageUp', 'Home']);

export function useStickToBottom(
  scrollEl: HTMLElement | null, contentEl: HTMLElement | null, threshold: number, autoScrollKey: unknown,
) {
  const [isAtBottom, setIsAtBottom] = useState(true);
  const stuck = useRef(true); // read and written only in effects and handlers — never in render

  useEffect(() => {
    if (!scrollEl || !contentEl) return;
    let lastTop = scrollEl.scrollTop;
    let lastHeight = scrollEl.scrollHeight;
    const near = () => scrollEl.scrollHeight - scrollEl.scrollTop - scrollEl.clientHeight <= threshold;
    const sync = () => {
      lastTop = scrollEl.scrollTop;
      lastHeight = scrollEl.scrollHeight;
      setIsAtBottom(near()); // same value → React bails out
    };
    const selecting = () => { // scoped: utils/hasTextSelection is page-wide
      const s = document.getSelection();
      return !!s && !s.isCollapsed && scrollEl.contains(s.anchorNode);
    };
    // Content grew or shrank, or the viewport changed (a docked card or a taller textarea shrinks the log).
    const onResize = () => {
      if (stuck.current && !selecting()) scrollEl.scrollTop = scrollEl.scrollHeight; // instant: smooth lags behind tokens
      sync();
    };
    const onScroll = () => {
      const shrank = scrollEl.scrollHeight < lastHeight; // a clamp after a fold is not the reader scrolling up
      if (!shrank && scrollEl.scrollTop < lastTop) stuck.current = false; // the reader moved up
      else if (near()) stuck.current = true;                               // …and came back down
      sync();
    };
    // Intent arrives before the scroll it causes: unstick at once, or a growing answer pins the view back mid-gesture.
    const escape = () => { stuck.current = false; };
    const onWheel = (e: WheelEvent) => { if (e.deltaY < 0) escape(); };
    const onKeyDown = (e: KeyboardEvent) => { if (SCROLL_UP_KEYS.has(e.key) && !isEditable(e.target)) escape(); };
    const observer = new ResizeObserver(onResize); // at most once per frame; no rAF needed
    observer.observe(contentEl);
    observer.observe(scrollEl);
    scrollEl.addEventListener('scroll', onScroll, { passive: true });
    scrollEl.addEventListener('wheel', onWheel, { passive: true });
    scrollEl.addEventListener('touchmove', escape, { passive: true }); // onScroll re-sticks near the bottom
    scrollEl.addEventListener('keydown', onKeyDown);
    scrollEl.scrollTop = scrollEl.scrollHeight; // a long history opens at the latest message
    sync();
    return () => {
      observer.disconnect();
      scrollEl.removeEventListener('scroll', onScroll);
      scrollEl.removeEventListener('wheel', onWheel);
      scrollEl.removeEventListener('touchmove', escape);
      scrollEl.removeEventListener('keydown', onKeyDown);
    };
  }, [scrollEl, contentEl, threshold]);

  // Sending re-sticks even after the reader scrolled up (a no-op on mount: already pinned).
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-run when the key changes
  useEffect(() => {
    if (!scrollEl) return;
    stuck.current = true;
    scrollEl.scrollTo({ top: scrollEl.scrollHeight, behavior: reducedMotion() ? 'auto' : 'smooth' });
  }, [autoScrollKey, scrollEl]);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (!scrollEl) return;
    stuck.current = true;
    scrollEl.scrollTo({ top: scrollEl.scrollHeight, behavior: reducedMotion() ? 'auto' : behavior });
  };
  return { isAtBottom, scrollToBottom };
}
```

**What the user sees**
- While an answer streams, the view follows it frame by frame.
- If the reader scrolls up by any amount, the view stops following, `isAtBottom` turns false and the scroll button appears.
- These re-stick the view: clicking the button, scrolling back down to within 70px, or sending a message.
- When the footer grows (a docked card appears, or the textarea grows), a stuck view re-pins.
- Selecting text inside the log pauses following.

**Accessibility**
- `role=log` already implies `aria-live=polite`. With `aria-busy` set while busy, the answer is announced once it settles rather than token by token.
- Reduced motion turns smooth scrolling into instant scrolling.
- Autoscroll never moves focus. The only focus move is the scroll button handing focus back to the log.

**React Compiler**
- No ref is read or written during render, and the listeners are created inside the effect.
- The elements reach the effect through `useState` callback refs.
- No `'use no memo'` is needed. Check with `compiler:audit`.

### 7.7 Performance

- **Per delta.** With stable config, only the streaming message's views re-render. The Markdown element is memoized on `text`: the compiler tracks `part.text`, not the part object. Unchanged answers are therefore not re-parsed, even without structural sharing.
- **Render callbacks.** They run on every render of their view and must only return elements.
- **Inline config re-renders every message.** Inline `labels`, `icons`, `markdown`, `formatTimestamp` or render callbacks change the context value, so every message view re-renders on each parent render. That is correct, just slower. Define them at module scope or memoize them; the React Compiler in the app does that automatically.
- **Handler callbacks** never cause re-renders, because they're read through the latest-value ref.
- **Perf unit test.** It pins this behavior: 300 messages and one growing text; only the growing part's Markdown re-renders per snapshot.
- **No virtualization in v1.** When it comes, it is a separate part (`ConversationVirtualContent`), not a mode of ConversationContent.
- **App trap with CopilotKit.** `@copilotkit/core` mutates `agent.messages` in place. In an app built with the React Compiler, mark the wiring component `'use no memo'` (§10.1).

---

## 8. Extensibility and versioning

- **One contract file.** `WallyAssistant/model.ts` is exported as types. The package's semver is the version; there is no constant.
- **Minor release (`feat(wally-assistant): …`):**
  - a new part `type`
  - a new optional field
  - a new vocabulary value
  - a new status member

  A new status member breaks exhaustive `switch` statements at compile time. Announce it in the release notes; the model header already requires `default` branches.
- **Major release (`feat(wally-assistant)!: …`):** renaming or removing a field, kind or value; making a field required; changing what a field means.
- **Deprecation.** Mark the field `@deprecated` in JSDoc, pointing to its replacement. The views read both the old and the new field (new wins) for at least one major.
- **Forward compatibility at runtime**, for snapshots built as JSON by a newer server:

  | Unknown value | Renders as |
  |---|---|
  | part `type` | `renderPart`, otherwise nothing |
  | step status | `done` |
  | option kind | the allow group |
  | icon key | the kind's default, then CircleDashed |
  | role | nothing |
  | `ChatStatus` | `'ready'` |

  Every view has a "renders an unknown value without throwing" test.
- **No speculative fields.** Sources, files, branches and attachments travel as `custom` parts with `renderPart` until they are designed, and get promoted to first-class parts later as minor releases.
- **Extension seams.** `custom` parts, `renderPart`, `renderStepContent`, `renderMessageActions`, `markdown`, `icons`, `labels`, `formatTimestamp`, the slots, and `meta` on every node. Apps can add UI without a DS release.
- **The DS never imports external types.** When CopilotKit, AG-UI or the AI SDK change, only the app's mapper changes.

---

## 9. File layout and `src/index.ts`

```
packages/design-system/src/components/
  Conversation/                          NEW
    Conversation.tsx  ConversationContent.tsx  ConversationEmptyState.tsx  ConversationScrollButton.tsx
    ConversationContext.ts               internal context (not exported)
    useStickToBottom.ts                  internal (§7.6)
    classes.ts  index.ts
    Conversation.stories.tsx  Conversation.test.tsx  Conversation.analytics.test.tsx  Conversation.e2e.ts
  WallyAssistant/                             NEW
    model.ts                             §3 (types only)
    labels.ts                            ChatLabels + DEFAULT_CHAT_LABELS
    deriveChatState.ts                   §5.5 + shared helpers
    stepIcons.tsx                        internal STEP_TYPE_ICONS + resolver (§7.4)
    ChatViewContext.ts                   internal context + useChatView()
    ChatViewProvider.tsx  ChatMessageView.tsx  ChatPartView.tsx  ChainOfThoughtView.tsx  ApprovalCardView.tsx
    WallyAssistant.tsx
    mocks.ts                             reduceWally, WALLY_SCRIPT, fixtures, useMockWally (excluded from build and d.ts, like Table/mocks.tsx)
    index.ts
    deriveChatState.test.ts  mocks.test.ts  ChatViews.test.tsx  WallyAssistant.test.tsx  WallyAssistant.analytics.test.tsx
    WallyAssistant.stories.tsx  WallyAssistant.e2e.ts  ANALYTICS_GAPS.md
  AssistantMessage/   + AssistantMessageLoader.tsx, AssistantMessageError.tsx (classes, index, tests, stories, e2e)
  ChainOfThought/     ChainOfThoughtStep.tsx + classes.ts ('error'), story, test, e2e
  Chat/               ChatHeaderTitle.tsx (label), ChatBody.tsx (JSDoc), story, test
```

**Notes**
- `useRenderEveryTime` is imported from `../Table/lib/useRenderEveryTime`, the same kind of cross-folder reuse as `../Textarea/useAutoResize`. Move it to `src/utils/` when a third consumer appears.
- There is no `.figma.ts` for Conversation or WallyAssistant, because neither has a Figma node.
- *Verified:* snapshot paths are per folder (`{testFileDir}/{testFileName}-snapshots`), so `WallyAssistant/WallyAssistant.e2e.ts` doesn't collide with `Chat/ChatComposed.e2e.ts` (the v1 composed-panel e2e, `describe('Component: ChatComposed')`), which covers the AI/Chat composed stories.

Barrel additions (Biome-sorted, merged into the existing entries):

```ts
export {
  AssistantMessage, AssistantMessageContent, type AssistantMessageContentProps,
  AssistantMessageError, type AssistantMessageErrorProps,
  AssistantMessageLoader, type AssistantMessageLoaderProps, type AssistantMessageProps,
} from './components/AssistantMessage';
export {
  ApprovalCardView, type ApprovalCardViewProps, ChainOfThoughtView, type ChainOfThoughtViewProps,
  type ChatApprovalOption, type ChatApprovalOptionKind, type ChatApprovalPart, type ChatApprovalResponse,
  type ChatApprovalStatus, type ChatAssistantMessage, type ChatAssistantPart, type ChatChainOfThoughtPart,
  type ChatContextItem, type ChatCustomPart, type ChatErrorPart, type ChatFeedback, type ChatIconKey, type ChatId,
  type ChatLabels, type ChatMarkdownProps, type ChatMessage, type ChatMessageActionNodes, ChatMessageView,
  type ChatMessageViewProps, type ChatMeta, type ChatOpen, WallyAssistant, type WallyAssistantProps, type ChatPart,
  type ChatPartRenderContext, ChatPartView, type ChatPartViewProps, type ChatSnapshot, type ChatStatus,
  type ChatStep, type ChatStepKind, type ChatStepRenderContext, type ChatStepStatus, type ChatSuggestionItem,
  type ChatTextPart, type ChatToolPermission, type ChatUserMessage, type ChatUserPart, type ChatViewConfig,
  ChatViewProvider, type ChatViewProviderProps, type ChatViewState, copyTextOf, DEFAULT_CHAT_LABELS, deriveChatState,
} from './components/WallyAssistant';
export {
  Conversation, ConversationContent, type ConversationContentProps,
  ConversationEmptyState, type ConversationEmptyStateProps, type ConversationProps,
  ConversationScrollButton, type ConversationScrollButtonProps,
} from './components/Conversation';
```

---

## 10. Mapper examples (app code, never in the DS)

### 10.1 CopilotKit 1.79.1 headless hooks (AG-UI 1.0.3) → `ChatSnapshot`

**CopilotKit facts the mapper relies on** (verified by stress 1 against the 1.79.1 tarballs):
1. HITL and frontend tools run in `processAgentResult` after `agent.runAgent()` resolved, so `agent.isRunning` is false for the whole approval wait.
2. The runtime writes a placeholder tool result, `'Forwarded to client'`. It is the `FORWARDED_TO_CLIENT` constant, which is not exported.
3. Sub-agent parent ids exist only on `SUBAGENT_STARTED`, and status only on `SUBAGENT_FINISHED`/`SUBAGENT_ERROR`. Messages carry only `subagentRunId`.
4. AG-UI messages carry no `createdAt`.
5. Between `addMessage` and `RUN_STARTED`, `isRunning` is false.
6. `respond` exists only in the HITL render props.
7. `useInterrupt` returns one element, for the primary interrupt. A resolved interrupt leaves `pendingInterrupts`.
8. `@copilotkit/core` mutates `agent.messages` in place.

```ts
// apps/console/src/wally/toChatSnapshot.ts — the only app file that knows AG-UI shapes. Pure; unit-tested.
import type { Interrupt, Message, ToolCall, ToolMessage } from '@ag-ui/core'; // make it a direct app dependency
import type {
  ChatApprovalPart, ChatAssistantPart, ChatFeedback, ChatMessage, ChatSnapshot, ChatStep, ChatStepStatus,
} from '@wallarm-org/design-system';
import { approvalText, HITL_TOOLS, toolIcon, toolLabel, toolMetric } from './tools'; // app tables (Figma 483:1899 keys, -ing/-ed wording)

/** Facts agent.messages doesn't carry, collected by useWallyRunUi() from agent.subscribe(). */
export interface WallyRunUi {
  readonly summaries: ReadonlyMap<string, string>;       // user message id → "Worked for 3m 45s"
  readonly reasoningLabels: ReadonlyMap<string, string>; // reasoning message id → "Thought for 5s"
  readonly subagents: ReadonlyMap<string, {
    readonly name: string; readonly parentToolCallId?: string; readonly parentSubagentRunId?: string;
    readonly status: 'running' | 'done' | 'error'; readonly error?: string;
  }>;
  readonly errors: ReadonlyMap<string, string>;          // user message id → RUN_ERROR / onRunFailed text
  readonly seenAt: ReadonlyMap<string, number>;          // message id → first seen
  readonly stopped: ReadonlySet<string>;                 // user message ids whose turn was stopped
  readonly resolvedInterrupts: ReadonlyMap<string, { readonly userId: string; readonly status: 'approved' | 'rejected' }>;
  readonly feedback: ReadonlyMap<string, ChatFeedback>;  // reply id → feedback
  readonly sending: boolean;                             // send() … RUN_STARTED
}

const PLACEHOLDER = 'Forwarded to client';
const textOf = (c: unknown): string =>
  typeof c === 'string' ? c
    : Array.isArray(c) ? c.flatMap(p => (p?.type === 'text' && typeof p.text === 'string' ? [p.text] : [])).join('\n')
    : '';
const parse = (s: string): unknown => { try { return JSON.parse(s); } catch { return undefined; } };
/** Shared with the HITL card, so the card and the snapshot never disagree. */
export const approvedOf = (result: unknown) =>
  (parse(textOf(result)) as { approved?: unknown } | undefined)?.approved === true;
const iso = (ms: unknown) => (Number.isFinite(Number(ms)) ? new Date(Number(ms)).toISOString() : undefined);

type StepDraft = Omit<ChatStep, 'steps'> & { steps: StepDraft[] };
const freeze = (s: StepDraft): ChatStep => ({ ...s, steps: s.steps.length ? s.steps.map(freeze) : undefined });
const findStep = (list: StepDraft[], id: string): StepDraft | undefined => {
  for (const s of list) { if (s.id === id) return s; const hit = findStep(s.steps, id); if (hit) return hit; }
  return undefined;
};
type Turn = { userId: string; root: StepDraft[]; sub: Map<string, StepDraft[]>; approvals: ChatApprovalPart[]; text: string[]; sourceIds: string[] };

export function toChatSnapshot(
  messages: readonly Message[], isRunning: boolean, interrupts: readonly Interrupt[],
  ui: WallyRunUi, autoAllowed: ReadonlySet<string>,
): Pick<ChatSnapshot, 'messages' | 'status'> {
  const results = new Map<string, ToolMessage>();
  for (const m of messages) if (m.role === 'tool' && textOf(m.content).trim() !== PLACEHOLDER) results.set(m.toolCallId, m);
  const lastUserId = [...messages].reverse().find(m => m.role === 'user')?.id;
  const out: ChatMessage[] = [];
  let turn: Turn | undefined;

  const toolStatus = (tc: ToolCall, res: ToolMessage | undefined, t: Turn): ChatStepStatus => {
    const hitl = HITL_TOOLS.has(tc.function.name);
    if (res) return res.error ? 'error' : hitl && !approvedOf(res.content) ? 'denied' : 'done';
    if (ui.stopped.has(t.userId)) return 'cancelled';
    const argsDone = parse(tc.function.arguments || '{}') !== undefined;
    if (hitl) return argsDone ? 'awaiting-approval' : 'pending'; // BEFORE isRunning: it is false for the whole wait
    if (t.userId !== lastUserId) return 'cancelled';             // an orphan from a reload mid-run
    return argsDone ? 'running' : 'pending';
  };

  const flush = () => {
    if (!turn) return;
    const t = turn;
    for (const [runId, steps] of t.sub) { // sub-agents hang under their parent tool call or parent sub-agent
      const info = ui.subagents.get(runId);
      const node: StepDraft = {
        id: `subagent:${runId}`, kind: 'agent', name: info?.name, icon: 'subagent', label: info?.name ?? 'Sub-agent',
        status: info?.status === 'error' ? 'error' : info?.status === 'done' ? 'done' : ui.stopped.has(t.userId) ? 'cancelled' : 'running',
        content: info?.error, steps,
      };
      const parent = (info?.parentToolCallId && findStep(t.root, info.parentToolCallId))
        || (info?.parentSubagentRunId && findStep(t.root, `subagent:${info.parentSubagentRunId}`)) || undefined;
      (parent ? parent.steps : t.root).push(node);
    }
    for (const [id, r] of ui.resolvedInterrupts)
      if (r.userId === t.userId) t.approvals.push({ type: 'approval', id: `interrupt:${id}`, content: '', status: r.status });
    const id = `${t.userId}:reply`; // the id WallyAssistant's loading row uses: no remount on the first token
    const parts: ChatAssistantPart[] = [];
    if (t.root.length) parts.push({ type: 'chain-of-thought', id: `${id}:cot`, steps: t.root.map(freeze), summary: ui.summaries.get(t.userId) });
    parts.push(...t.approvals);
    if (t.text.length) parts.push({ type: 'text', id: `${id}:text`, text: t.text.join('\n\n') });
    const error = ui.errors.get(t.userId);
    if (error) parts.push({ type: 'error', id: `${id}:error`, text: error, retryable: t.userId === lastUserId });
    if (parts.length) out.push({
      role: 'assistant', id, parts, feedback: ui.feedback.get(id) ?? null,
      createdAt: iso(ui.seenAt.get(t.sourceIds[0] ?? '')),
      meta: { sourceIds: t.sourceIds }, // backend feedback needs the AG-UI ids
    });
    turn = undefined;
  };

  for (const m of messages) {
    if (m.role === 'user') {
      flush();
      out.push({ role: 'user', id: m.id, createdAt: iso(m.metadata?.createdAt ?? ui.seenAt.get(m.id)),
        parts: [{ type: 'text', id: `${m.id}:text`, text: textOf(m.content) }] });
      turn = { userId: m.id, root: [], sub: new Map(), approvals: [], text: [], sourceIds: [] }; // an error before the first token still gets a reply
      continue;
    }
    if (!turn || (m.role !== 'assistant' && m.role !== 'reasoning')) continue; // tool results join through `results`
    const t = turn;
    t.sourceIds.push(m.id);
    let bucket = t.root;
    if (m.subagentRunId) { bucket = t.sub.get(m.subagentRunId) ?? []; t.sub.set(m.subagentRunId, bucket); }
    if (m.role === 'reasoning') {
      const live = isRunning && m === messages[messages.length - 1];
      bucket.push({ id: m.id, kind: 'reasoning', icon: 'thinking', status: live ? 'running' : 'done',
        label: live ? 'Thinking...' : ui.reasoningLabels.get(m.id) ?? 'Thought', content: m.content, steps: [] }); // '' when only encryptedValue
      continue;
    }
    for (const tc of m.toolCalls ?? []) {
      const name = tc.function.name;
      const res = results.get(tc.id);
      bucket.push({ id: tc.id, kind: 'tool', name, icon: toolIcon(name), label: toolLabel(tc, res), status: toolStatus(tc, res, t),
        metric: res && !res.error ? toolMetric(tc, res) : undefined, content: res?.error, steps: [] });
      if (!HITL_TOOLS.has(name)) continue;
      const stopped = !res && ui.stopped.has(t.userId);
      const auto = !res && autoAllowed.has(name); // keep the part: its CopilotKit card must mount to auto-respond
      t.approvals.push({ type: 'approval', id: tc.id, content: approvalText(tc),
        status: res ? (approvedOf(res.content) ? 'approved' : 'rejected') : auto ? 'approved' : stopped ? 'rejected' : 'pending',
        resolvedLabel: stopped ? 'Cancelled' : auto ? 'Always allowed' : undefined });
    }
    if (m.content) {
      if (m.subagentRunId) bucket.push({ id: `${m.id}:note`, icon: null, label: m.content, status: 'done', steps: [] }); // stays in its step
      else t.text.push(m.content);
    }
  }
  if (turn) { // AG-UI interrupts (useInterrupt, renderInChat: false) are not messages: attach them to the open turn
    for (const i of interrupts)
      if (!ui.resolvedInterrupts.has(i.id) && !(i.toolCallId && results.has(i.toolCallId)))
        turn.approvals.push({ type: 'approval', id: `interrupt:${i.id}`, content: i.message ?? i.reason, status: 'pending' });
  }
  flush();
  const busy = isRunning || ui.sending;
  return {
    messages: out,
    status: busy ? (out[out.length - 1]?.role === 'user' ? 'submitted' : 'streaming')
      : lastUserId && ui.errors.has(lastUserId) ? 'error' : 'ready',
  };
}
```

```ts
// apps/console/src/wally/useWallyRunUi.ts — the subscribe() side table (abridged: markSending, markStopped,
// clearError, resolveInterrupt and setFeedback are one-line patch() wrappers).
export function useWallyRunUi(agent: AbstractAgent) {
  const [ui, setUi] = useState<WallyRunUi>(EMPTY_RUN_UI);
  const patch = (f: (d: WallyRunUi) => Partial<WallyRunUi>) => setUi(d => ({ ...d, ...f(d) }));
  useEffect(() => { // useAgent swaps the agent when isReady flips → resubscribe
    const runStart = new Map<string, number>();
    const reasoningStart = new Map<string, number>();
    const lastUser = () => [...agent.messages].reverse().find(m => m.role === 'user')?.id;
    const at = (e: { timestamp?: number }) => e.timestamp ?? Date.now();
    const fail = (message: string) => { const u = lastUser(); if (u) patch(d => ({ errors: new Map(d.errors).set(u, message), sending: false })); };
    const subagent = (id: string, change: Partial<{ status: 'done' | 'error'; error: string }>) =>
      patch(d => { const p = d.subagents.get(id); return p ? { subagents: new Map(d.subagents).set(id, { ...p, ...change }) } : {}; });
    return agent.subscribe({
      onMessagesChanged: ({ messages }) => patch(d => {
        const fresh = messages.filter(m => !d.seenAt.has(m.id));
        if (!fresh.length) return {};
        const seenAt = new Map(d.seenAt);
        for (const m of fresh) seenAt.set(m.id, Date.now());
        return { seenAt };
      }),
      onRunStartedEvent: ({ event }) => { const u = lastUser(); if (u && !runStart.has(u)) runStart.set(u, at(event)); patch(() => ({ sending: false })); },
      // Follow-up runs after a HITL answer overwrite it, so the summary spans the whole turn.
      onRunFinishedEvent: ({ event }) => { const u = lastUser(); const s = u ? runStart.get(u) : undefined;
        if (u && s != null) patch(d => ({ summaries: new Map(d.summaries).set(u, `Worked for ${formatDuration(at(event) - s)}`) })); },
      onRunErrorEvent: ({ event }) => fail(event.message),
      onRunFailed: ({ error }) => fail(error.message),
      onReasoningStartEvent: ({ event }) => { reasoningStart.set(event.messageId, at(event)); },
      onReasoningEndEvent: ({ event }) => { const s = reasoningStart.get(event.messageId);
        if (s != null) patch(d => ({ reasoningLabels: new Map(d.reasoningLabels).set(event.messageId, `Thought for ${formatDuration(at(event) - s)}`) })); },
      onSubagentStartedEvent: ({ event }) => patch(d => ({ subagents: new Map(d.subagents).set(event.subagentRunId, {
        name: event.name, parentToolCallId: event.parentToolCallId, parentSubagentRunId: event.parentSubagentRunId, status: 'running' }) })),
      onSubagentFinishedEvent: ({ event }) => subagent(event.subagentRunId, { status: 'done' }),
      onSubagentErrorEvent: ({ event }) => subagent(event.subagentRunId, { status: 'error', error: event.message }),
    }).unsubscribe;
  }, [agent]);
  return { ui, markSending, markStopped, clearError, resolveInterrupt, setFeedback };
}
```

```tsx
// apps/console/src/wally/WallyChat.tsx
'use no memo'; // @copilotkit/core mutates agent.messages in place: a compiled component would cache the snapshot and freeze the log.
import { type ComponentProps, type FC, type ReactNode, useEffect, useMemo, useState } from 'react';
import { ToolCallStatus } from '@copilotkit/core';
import {
  type ReactHumanInTheLoop, useAgent, useCopilotKit, useHumanInTheLoop, useInterrupt, useRenderToolCall, useSuggestions,
} from '@copilotkit/react-core/v2/headless';
import { ApprovalCardView, type ChatMarkdownProps, WallyAssistant, type ChatPart } from '@wallarm-org/design-system';
import { InlineCodeSnippet } from '@wallarm-org/design-system/CodeSnippet';
import { formatRelativeTime } from '@wallarm-org/design-system/utils/formatDateTime';
import { z } from 'zod';

const DENYLIST = 'propose_add_to_denylist';
const DenylistArgs = z.object({ ips: z.array(z.string()) });
type DenylistArgs = z.infer<typeof DenylistArgs>;

/** Module scope: a new identity would remount every answer on every delta. */
const WallyMarkdown: FC<ChatMarkdownProps> = ({ text, streaming, variant }) => (
  <AppMarkdown source={text} streaming={streaming} inlineCode={variant === 'chain-of-thought' ? CotInlineCode : undefined} />
);
const CotInlineCode: FC<{ children: string }> = ({ children }) => (
  <InlineCodeSnippet code={children} size='sm' copyable={false} className='text-text-secondary' />
);

/** HITL card: CopilotKit mounts it through renderToolCall(); `respond` exists only here. Module scope (stable `render`). */
function DenylistApproval(props: ComponentProps<ReactHumanInTheLoop<DenylistArgs>['render']>) {
  const { toolCallId, status, args } = props;
  const { isAllowed, allow } = useAllowList();
  const [sent, setSent] = useState(false); // the DS keeps no optimistic state; the double-click guard lives here
  const respond = status === ToolCallStatus.Executing ? props.respond : undefined;
  const auto = isAllowed(DENYLIST);
  useEffect(() => {
    if (respond && auto && !sent) { setSent(true); void respond({ approved: true, scope: 'session' }); }
  }, [respond, auto, sent]);
  return (
    <ApprovalCardView
      approval={{
        type: 'approval', id: toolCallId, content: `Add \`${(args.ips ?? []).join('`, `')}\` to the denylist`,
        status: status === ToolCallStatus.Complete ? (approvedOf(props.result) ? 'approved' : 'rejected') : auto ? 'approved' : 'pending',
        disabled: !respond || sent,
      }}
      onRespond={({ approved, kind }) => {
        if (!respond || sent) return;
        setSent(true);
        if (kind === 'allow-always') allow(DENYLIST);
        void respond({ approved, scope: kind === 'allow-always' ? 'session' : 'once' });
      }}
    />
  );
}

export function WallyChat({ headerActions }: { headerActions: ReactNode }) {
  const { agent, isReady } = useAgent({ throttleMs: 50 });
  const { copilotkit } = useCopilotKit();
  const { suggestions } = useSuggestions();
  const renderToolCall = useRenderToolCall();
  const { allowed, setAllowed } = useAllowList();
  const run = useWallyRunUi(agent);
  const now = useNow(60_000); // the DS runs no clock: a new formatter each minute refreshes "2 min ago"
  const formatTimestamp = useMemo(() => (iso: string) => formatRelativeTime(new Date(iso), new Date(now)), [now]);
  useHumanInTheLoop({ name: DENYLIST, description: 'Propose adding IPs to the denylist', parameters: DenylistArgs, render: DenylistApproval });
  // One element for the primary interrupt; InterruptApproval (module scope) renders ApprovalCardView,
  // calls resolve/cancel and records the outcome with run.resolveInterrupt (resolved interrupts leave pendingInterrupts).
  const interruptElement = useInterrupt({ renderInChat: false, render: InterruptApproval });

  const snapshot = toChatSnapshot(agent.messages, agent.isRunning, agent.pendingInterrupts, run.ui,
    new Set(Object.keys(allowed).filter(k => allowed[k])));
  const lastUserId = [...agent.messages].reverse().find(m => m.role === 'user')?.id;
  const send = (text: string) => {
    run.markSending(); // isRunning stays false until RUN_STARTED: this gives the 'submitted' frame
    agent.addMessage({ id: crypto.randomUUID(), role: 'user', content: text, metadata: { createdAt: Date.now() } });
    void copilotkit.runAgent({ agent });
  };
  // WallyAssistant decides WHERE an approval goes (docked or inline); CopilotKit supplies the live card.
  const renderPart = (part: ChatPart) => {
    if (part.type !== 'approval') return undefined;
    if (part.id.startsWith('interrupt:')) return part.status === 'pending' ? (interruptElement ?? undefined) : undefined;
    const found = findToolCall(agent.messages, part.id); // { toolCall, toolMessage } | undefined
    return found ? (renderToolCall(found) ?? undefined) : undefined;
  };

  return (
    <WallyAssistant
      {...snapshot}
      data-testid='wally'
      disabled={!isReady}
      suggestions={suggestions.filter(s => !s.isLoading).map((s, i) => ({ id: `${i}:${s.title}`, label: s.title, prompt: s.message }))}
      permissions={Object.entries(allowed).map(([id, on]) => ({ id, title: id, allowed: on }))}
      onPermissionChange={(permission, on) => setAllowed(permission.id, on)}
      onSubmit={send}
      onStop={() => { if (lastUserId) run.markStopped(lastUserId); copilotkit.stopAgent({ agent }); }}
      onRetry={() => { if (!lastUserId) return; run.clearError(lastUserId); run.markSending(); void copilotkit.runAgent({ agent }); }}
      onFeedback={(message, value) => { run.setFeedback(message.id, value); void postFeedback(message.meta?.sourceIds, value); }}
      formatTimestamp={formatTimestamp}
      renderPart={renderPart}
      markdown={WallyMarkdown}
      headerActions={headerActions}
    />
  );
}
```

Still true from v1 §5.3:
- `CopilotKitProvider` with `enableInspector={false}` and `showIntelligenceIndicator={false}`.
- Never import `CopilotChat*` or `v2/styles.css`.
- Keep `render` stable.
- `@ag-ui/core` and `@copilotkit/core` are direct app dependencies.
- Activity messages (`role: 'activity'`) map to `custom` parts and render through `renderPart` (e.g. `useRenderActivityMessage`).

### 10.2 Custom SSE/REST API → the same model (`WallyAssistant/mocks.ts`, which also drives the stories)

```ts
import type {
  ChatApprovalPart, ChatAssistantMessage, ChatAssistantPart, ChatChainOfThoughtPart, ChatSnapshot, ChatStatus, ChatStep, ChatStepStatus,
} from './model';

export type WallyEvent =
  | { t: 'user'; id: string; text: string; at?: string }
  | { t: 'step'; step: ChatStep; parentId?: string }  // insert, or replace by id anywhere in the reply
  | { t: 'text'; delta: string }                       // deltas aren't idempotent: real streams carry offsets or snapshots
  | { t: 'approval'; approval: ChatApprovalPart }     // insert, or replace by id (resolving it too)
  | { t: 'summary'; text: string }                     // "Worked for 12s", stamped on the first block
  | { t: 'error'; text: string }
  | { t: 'end'; stopped?: boolean };

const LIVE = new Set<ChatStepStatus>(['pending', 'running', 'awaiting-approval']);
const upsert = <T extends { id: string }>(list: readonly T[], item: T): readonly T[] => {
  const i = list.findIndex(x => x.id === item.id);
  return i < 0 ? [...list, item] : list.map((x, j) => (j === i ? item : x));
};
const isCot = (p: ChatAssistantPart): p is ChatChainOfThoughtPart => p.type === 'chain-of-thought';
const hasStep = (steps: readonly ChatStep[], id: string): boolean => steps.some(s => s.id === id || hasStep(s.steps ?? [], id));
/** Depth-first map; untouched branches keep their identity. */
const mapSteps = (steps: readonly ChatStep[], f: (s: ChatStep) => ChatStep): readonly ChatStep[] => {
  const next = steps.map(s => { const kids = s.steps && mapSteps(s.steps, f); return f(kids === s.steps ? s : { ...s, steps: kids }); });
  return next.every((s, i) => s === steps[i]) ? steps : next;
};
const mapBlocks = (m: ChatAssistantMessage, f: (steps: readonly ChatStep[]) => readonly ChatStep[]): ChatAssistantMessage => {
  const parts = m.parts.map(p => { if (!isCot(p)) return p; const steps = f(p.steps); return steps === p.steps ? p : { ...p, steps }; });
  return parts.every((p, i) => p === m.parts[i]) ? m : { ...m, parts };
};
const addStep = (m: ChatAssistantMessage, step: ChatStep, parentId?: string): ChatAssistantMessage => {
  const has = (id: string) => m.parts.some(p => isCot(p) && hasStep(p.steps, id));
  if (has(step.id)) return mapBlocks(m, s => mapSteps(s, x => (x.id === step.id ? { ...step, steps: step.steps ?? x.steps } : x)));
  if (parentId && has(parentId)) return mapBlocks(m, s => mapSteps(s, x => (x.id === parentId ? { ...x, steps: [...(x.steps ?? []), step] } : x)));
  const tail = [...m.parts].reverse().find(p => p.type !== 'approval'); // approvals don't close a block
  if (tail && isCot(tail)) return { ...m, parts: m.parts.map(p => (p === tail ? { ...tail, steps: [...tail.steps, step] } : p)) };
  return { ...m, parts: [...m.parts, { type: 'chain-of-thought', id: `${m.id}:cot:${m.parts.length}`, steps: [step] }] }; // after text: a new block
};
const settle = (m: ChatAssistantMessage, to: ChatStepStatus) => mapBlocks(m, s => mapSteps(s, x => (LIVE.has(x.status) ? { ...x, status: to } : x)));
const cancelApprovals = (m: ChatAssistantMessage): ChatAssistantMessage => ({ ...m, parts: m.parts.map(p =>
  p.type === 'approval' && p.status === 'pending' ? { ...p, status: 'rejected' as const, resolvedLabel: 'Cancelled' } : p) });
const lastUserId = (s: ChatSnapshot) => { for (let i = s.messages.length - 1; i >= 0; i--) if (s.messages[i]?.role === 'user') return s.messages[i]?.id; return undefined; };
/** The reply to the last user message, created on demand; its id is the one WallyAssistant's loading row uses. */
const withReply = (s: ChatSnapshot, f: (m: ChatAssistantMessage) => ChatAssistantMessage, status: ChatStatus = 'streaming'): ChatSnapshot => {
  const id = `${lastUserId(s) ?? 'boot'}:reply`;
  const prev = s.messages.find(m => m.id === id);
  const reply: ChatAssistantMessage = prev?.role === 'assistant' ? prev : { role: 'assistant', id, parts: [] };
  return { ...s, status, messages: upsert(s.messages, f(reply)) }; // untouched messages keep their identity
};

export function reduceWally(s: ChatSnapshot, e: WallyEvent): ChatSnapshot {
  switch (e.t) {
    case 'user':
      return { ...s, status: 'submitted', messages: upsert(s.messages, {
        role: 'user', id: e.id, createdAt: e.at, parts: [{ type: 'text', id: `${e.id}:text`, text: e.text }] }) };
    case 'step':
      return withReply(s, m => addStep(m, e.step, e.parentId));
    case 'text':
      return withReply(s, m => {
        const last = m.parts[m.parts.length - 1];
        return last?.type === 'text'
          ? { ...m, parts: [...m.parts.slice(0, -1), { ...last, text: last.text + e.delta }] }
          : { ...m, parts: [...m.parts, { type: 'text', id: `${m.id}:text:${m.parts.length}`, text: e.delta }] };
      });
    case 'approval':
      return withReply(s, m => ({ ...m, parts: upsert(m.parts, e.approval) }));
    case 'summary':
      return withReply(s, m => {
        const first = m.parts.find(isCot);
        return first ? { ...m, parts: m.parts.map(p => (p === first ? { ...first, summary: e.text } : p)) } : m;
      });
    case 'error':
      return withReply(s, m => { const n = settle(m, 'error');
        return { ...n, parts: upsert(n.parts, { type: 'error', id: `${m.id}:error`, text: e.text, retryable: true }) }; }, 'error');
    case 'end':
      return e.stopped ? withReply(s, m => cancelApprovals(settle(m, 'cancelled')), 'ready') : { ...s, status: 'ready' };
    default:
      return s; // unknown events are ignored: forward compatible
  }
}
// const [snap, dispatch] = useReducer(reduceWally, initial); EventSource → batch per rAF → dispatch.
// <WallyAssistant {...snap} onSubmit={post} onStop={() => { abort(); dispatch({ t: 'end', stopped: true }); }}
//   onApprovalRespond={r => post(`/approvals/${r.approvalId}`, r)} onRetry={(message) => resendTurn(message.id)} />
```

`mocks.ts` also exports:
- **`WALLY_SCRIPT`**, an array of `[delayMs, WallyEvent]` pairs.
- **Fixtures:** `EMPTY`, `CONVERSATION` (two finished turns plus follow-up suggestions), `APPROVAL_PENDING`, `ERROR_TURN`, and `longThread(n)` for the perf test.
- **`useMockWally({ initial, script, speed })`**, which returns `{ snapshot, send, stop, respond }`:
  - ids are deterministic (`u1`, `u2`, …), so screenshots are stable;
  - it replays the script with a `setTimeout` chain;
  - timers are cleared on Stop and on unmount;
  - `respond` dispatches the resolved approval.

---

## 11. Stories and tests

### 11.1 Stories

Each story file has a `DESCRIPTION` constant and a one-line JSDoc per story. Meta uses `satisfies Meta<typeof X>`, and every root gets a `data-testid`.

| Title (id) | Stories |
|---|---|
| AI/Conversation (`ai-conversation`) | **Default:** a long history that opens at the latest message. **Empty:** `ConversationEmptyState` with greeting pills. **Streaming:** an interval appends paragraphs; the view sticks, and scrolling up shows the button. **Analytics:** `data-analytics-id` on the scroll button. |
| AI/AssistantMessage (add) | **Loading:** `AssistantMessageLoader`. **Error:** `AssistantMessageError` with a Retry `Button` in `action`. |
| AI/ChainOfThought (add) | **Error Step** |
| AI/Chat (add) | **Localized Title:** `ChatHeaderTitle label` |
| AI/WallyAssistant (`ai-wallyassistant`) | Empty; Conversation; **Streaming Simulation**; **Approval** (docked; Allow or Reject goes through `onApprovalRespond`, and the next snapshot resolves it); **Error** (an error part with Retry); **Overrides**; **Custom Layout**; **In Drawer** (`ChatTrigger`, a 480px Drawer, the Esc recipe from §6.3, `DrawerContent aria-label`); Analytics |

**Overrides story**
- `renderPart` for a `custom` part, `wallarm.attack-summary`.
- `renderStepContent` that renders a table for `step.name === 'search_attacks'`.
- `renderMessageActions` that adds an Ellipsis `DropdownMenu` between the thumbs and the timestamp, plus a tagged Copy (the §6.3 recipe).
- `headerTitle` set to a thread `Select`.
- `inputTools`.
- Localized `labels`.

**Custom Layout story**
- A full-page chat built from `ChatViewProvider`, `deriveChatState`, `Chat` and its own header, `Conversation`, `ChatMessageView`, docked approvals through `ChatPartView placement='docked'`, and its own `ChatInput`.
- A centered 768px column.
- It is the proof that the open parts reuse every rule.

**Streaming Simulation story**, driven by `useMockWally()`:
- **Setup:** two finished turns of history (so the log overflows the 640px panel) and follow-up suggestions.
- **Starting a run:** typing, or clicking a pill, starts the script at about 30ms per token (the `speed` arg).
- **What it walks through:**
  1. the loader while `submitted`
  2. a reasoning step, open with a "Thinking..." shimmer while its text streams, closing when done
  3. three tool steps that go from running to done, one of them with a `metric`
  4. the "Working..." row in the gaps between them
  5. the answer streaming word by word
  6. `summary`, then `end`: the block folds under "Worked for 12s", and the actions row appears
- **Stop:** cancels the timers, marks live steps `cancelled` and cancels pending approvals.
- **Markdown:** the stories pass no `markdown` prop, so they render through the default `AssistantMessageMarkdown`. `WallyAssistant` mounts its own lazy Prism adapter for fenced code unless an outer `CodeSnippetAdapterProvider` supplies one.

### 11.2 Unit tests

Rstest, RTL and user-event. Find elements by `data-testid`; use `getByRole` only for a11y assertions.

**Conversation**
- **Setup:** a capturing `ResizeObserver` mock overrides the global no-op from `rstest.setup.ts`. `scrollHeight`, `clientHeight` and `scrollTop` are stubbed with `Object.defineProperty`. Spy on `Element.prototype.scrollTo`.
- **Pinning:**
  - The log is pinned on mount.
  - When content grows while stuck, it pins again and the button stays hidden.
  - When the scroll element shrinks while stuck (the footer grew), it re-pins.
- **Unsticking:**
  - After a wheel-up, or any decrease in `scrollTop`, growth doesn't pin, and the button renders with its name.
  - Scrolling back down to within the threshold re-sticks.
  - A content shrink that clamps `scrollTop` doesn't unstick.
  - ArrowUp pressed inside an input in the log doesn't unstick.
  - A text selection inside the log blocks pinning.
  - A change to `autoScrollKey` re-sticks.
- **Scroll button:**
  - A click calls `scrollTo({ behavior: 'smooth' })` and moves focus to the log.
  - The consumer's `onClick` runs first, and its `preventDefault` cancels the scroll.
  - With mocked reduced motion, the behavior is `'auto'`.
- **Test ids and errors:**
  - Inside `<Chat data-testid='chat'>` the ids are `chat--body`, `chat--scroll-button` and `chat--empty-state`; the root gets an id only when one is passed.
  - `ConversationEmptyState` renders its `title`, with the default when none is given.
  - `ConversationScrollButton` and `ConversationContent` throw outside a `Conversation`.

**AssistantMessage**
- Loader: `role=status`, the default text, the `shimmer-text` class and the `--loader` id.
- Error: `role=alert`, the `action` slot, and `--error--<slot>` derived inside it.

**ChainOfThought**
- `status='error'` sets `data-status=error` and the danger classes.
- `chainOfThoughtIconVariants()` without arguments is unchanged (a snapshot of the class string).

**Chat**
- `ChatHeaderTitle label` replaces the text.
- Children still render the Variant2 joint.
- The default DOM is unchanged.

**`deriveChatState`**
- The synthetic reply appears only while running with the user message last, and it has the `:reply` id.
- `busy` and `awaitingApproval`.
- Docked approvals: the pending ones; otherwise the last resolved one; none once a newer user message exists; none with placement `'inline'`.
- `lastUserMessageId`.

**Views** (`ChatViews.test.tsx`)
- **ChainOfThoughtView:**
  - Flat while active; the Working row appears only when `working`.
  - Folds only when the summary is set, the block isn't active and no step is live. Both a preamble text part and a custom part after the block mid-run keep it flat (regression tests).
  - The fold uses Brain when every top-level step is reasoning, Activity otherwise.
  - A reasoning step is open while live and closes when done; a manual toggle sticks and survives the fold.
  - Every `ChatStepStatus`, plus an unknown value, maps to the right visual.
  - `renderStepContent`: `undefined` gives the default body, `null` makes the row non-collapsible, and a node replaces the body.
  - The step body's `streaming` flag, and the nested test ids.
- **ApprovalCardView:**
  - The default options render as a SplitButton with an "Allow once" menu item, plus Reject.
  - With a single allow option, a plain Button.
  - The `onRespond` payload.
  - It is disabled by `approval.disabled`, by the `disabled` prop, or when there is no callback.
  - `children` replace the actions; `resolvedLabel`; the markdown variant is `'approval'`.
  - Labels come from the provider, or from the defaults without one.
- **ChatPartView:**
  - `renderPart` returning `undefined` gives the default, `null` hides the part, and a node replaces it.
  - Wrapping `defaultRender`.
  - The ctx `placement` and `streaming` values.
  - An unknown type goes to `renderPart` only and never throws.
- **ChatMessageView:**
  - The loader appears only for a last, empty reply while running.
  - The actions row: present whenever a non-approval part rendered; hidden while the turn is open.
  - Copy uses `copyText ?? joined text` and fires `onCopy`.
  - Clicking the pressed thumb sends `null`.
  - The timestamp comes from `formatTimestamp`.
  - `renderMessageActions` returning `undefined`, `null` or custom content.
  - Docked approvals are skipped; test ids.
- **Provider:** labels merge; changing an inline handler callback doesn't re-render message views.
- **Perf:** with 300 messages and one growing text part, a counting `markdown` component re-renders only for that part per snapshot.

**WallyAssistant**, using `mocks.ts` fixtures
- **Empty state and draft:**
  - The empty panel shows the greeting with its pills and the `strong` background.
  - A pill click calls `onSuggestionSelect(item)`; without it, `onSubmit(prompt ?? label)`.
  - An uncontrolled draft clears after a send; a controlled one passes through unchanged.
- **Pending approvals:**
  - While an approval is pending, Send is disabled, Enter doesn't call `onSubmit`, the textarea stays editable and the footer pills hide.
  - With `'streaming'` plus a pending approval, Stop is enabled.
- **Input:**
  - Permissions appear only with both `permissions` and `onPermissionChange`, partitioned with a separator.
  - Context chips get their aria-label from `labels.removeContext` and call `onContextRemove(item)`.
- **Labels and slots:**
  - `labels` overrides reach the textarea, Send and the disclaimer.
  - Slots: `undefined` gives the default, `null` renders nothing, a node replaces it.
  - `textareaRef` reaches the textarea.
- **Test ids:** the full map from §6.4.
- **Type test:** WallyAssistant's own prop names overlap `HTMLAttributes` only in the reserved list.

**Reducer** (`mocks.test.ts`)
- Untouched messages keep their identity.
- Unknown events are ignored.
- A replayed `step` or `approval` event is idempotent.
- A `text` event before any reply creates `${userId}:reply`.
- Steps after a text part open a new block.
- A nested step lands under its parent.
- Stop cancels live steps and pending approvals.

**Analytics tests** (`*.analytics.test.tsx`, copied from `docs/metrics/testing-examples.md`)
- The scroll button forwards `data-analytics-*` verbatim, plus `ref`, to the real `<button>`.
- WallyAssistant's root forwards attributes to the `<section>`.
- Consumer instances keep their attributes: a `MessageAction` from `renderMessageActions`, and a Button inside `ApprovalCardView` children.
- Each closed target is tested by name as "closed target → callback", asserting the callback payload.

### 11.3 E2E

Files are `*.e2e.ts`, with `describe('Component: X')` split into Visual, Interactions and Accessibility. They run in CI only.

**`Conversation.e2e.ts` (`ai-conversation`)**
- Visual: Default (pinned to the bottom), Empty.
- Interactions:
  - A mouse-wheel scroll up shows the button. Clicking it returns the log to the bottom, and the button hides.
  - While streaming, the log stays pinned (`scrollTop + clientHeight ≈ scrollHeight`).
- Accessibility:
  - The button has an accessible name.
  - After a click, focus is on the log.
  - With emulated reduced motion, the log still reaches the bottom.

**`WallyAssistant/WallyAssistant.e2e.ts` (`ai-wallyassistant`, `describe('Component: WallyAssistant')`)**
- Visual: Empty, Conversation, Approval (docked), Error, and the end state of Streaming Simulation.
- Interactions:
  - A pill click shows the loader, then the streamed answer, then the folded summary.
  - Stop ends the run.
  - Allow resolves the docked card: `wally--approval-card--status` reads "Approved".
  - The thumbs toggle `aria-pressed`.
  - The summary row toggles.
- Accessibility:
  - Tab order is header → pills → textarea, with no Tab stop on the log.
  - `aria-busy` toggles.
  - In the Drawer, Esc stops the run without closing it.

### 11.4 Quality gates (every unit)

- `pnpm --filter @wallarm-org/design-system lint`
- `tsc --build tsconfig.app.json --noEmit`, because the package's `typecheck` script is a no-op. Also run `tsc --build tsconfig.unit.json --noEmit`, which type-checks the tests and the `mocks.ts` they import.
- `test`
- `compiler:audit`, with no new bailouts. `Table/lib/useRenderEveryTime.ts` is uncompiled on purpose.
- Screenshot baselines come only from CI, through a commit containing `[update-screenshots]`. Check the bot's commit for unrelated flaky baselines (FilterInput) and restore those from main. Never run `e2e:docker` locally.

---

## 12. Figma coverage

| Figma area | Nodes | Covered by | State |
|---|---|---|---|
| Panel shell, background Main/Chat | 2:42, 67:1254 | Chat; WallyAssistant picks `strong` or `subtle` | built |
| Header, thread title | 44:1464, 44:1465 | ChatHeader, ChatHeaderTitle (`label` added); `headerTitle`/`headerActions` | built + additive |
| Greeting with Large pills | 44:1738, 44:1706 | ConversationEmptyState → ChatGreeting + ChatSuggestions `greeting` | built + new wrapper |
| Footer pills | 91:1167, 8:3101 | ChatSuggestions / ChatSuggestion | built |
| App-header trigger | 101:1034 | ChatTrigger (in the app header, outside WallyAssistant) | built |
| Input, its states, the stop tooltip | 26:602, 74:1822, 87:1038 | ChatInput, ChatInputTextarea, ChatInputSubmit | built |
| Context chips (Variant2) | 26:603, 26:656, 26:657 | ChatInput `context` + Badge/TagClose (`WallyAssistant.context`) | built |
| Permissions popover | 172:1851, 174:2164, 174:2055, 172:1846, 181:2603 | ChatPermissions* (`WallyAssistant.permissions`) | built |
| Approval card: pending, approved, rejected | 171:1673, 171:1647, 171:1670, 168:2721 | ApprovalCard* via ApprovalCardView | built + view |
| Approval actions (SplitButton), content with code | 182:4099, 171:1790 | ApprovalCardView default options; `content` as markdown | view |
| User bubble with Show more/less | 26:737, 26:711, 299:1888, 300:1973 | UserMessage, UserMessageBubble, UserMessageShowMore | built |
| Answer prose | 91:1156, 21:4517 | AssistantMessageContent + the app's `markdown` | built |
| Actions row (user / Wally; visible on the latest) | 26:726, 307:2184, 91:1011 | MessageActions + §7.1 rule + `renderMessageActions` | built |
| CoT rows (Nested, Expanded, Simple, Simple-result, Working) | 201:1660, 206:2189, 409:3812 | ChainOfThought / ChainOfThoughtStep from `ChatStep` | built |
| Reasoning row "Thought for 5s" | 409:3853 | a reasoning `ChatStep`, open while live | built + view |
| Shimmer, "Working..." before the first token | 469:341 | `shimmer-text`; AssistantMessageLoader; the Working row | built + new part |
| Type icons | 483:1899 | `ChatIconKey` → internal map; `icons` overrides | view |
| Nested rich text, the inline-code note | 494:4292 | `ChatMarkdownProps.variant = 'chain-of-thought'` | app renderer |
| The run folds into "Worked for 3m 45s" | 409:3847, designer note 498:523 | `summary` fold at run end (§7.3) | view |
| Scroll-to-latest button | — | ConversationScrollButton (stock small Button, user decision 2026-10-22) | built |
| Answer error and Retry | — | AssistantMessageError | **needs design** |
| Step error | — | ChainOfThoughtStep `status='error'` | **needs design** |
| Expired or cancelled approval | — | `status: 'rejected'` + `resolvedLabel` | existing visual |
| Superseded or out of scope | 206:2480 braille spinner, 91:1030 old reasoning header, 26:537 Ask mode, 307:2058 hidden extra user action | — | v1 §11 |

---

## 13. Implementation waves

| Wave | Units | Gate |
|---|---|---|
| 0 | U1 ChainOfThought `'error'` · U2 ChatHeaderTitle `label` · U3 AssistantMessage Loader/Error · U4 Conversation · U5 model, labels, `deriveChatState`, mocks (all in parallel) | after the in-flight integration workflow lands (decision 15) |
| 1 | U6 data views | U1, U3, U5 |
| 2 | U7 WallyAssistant | U2, U4, U6 |
| 3 | U8 barrel, docs, full gates, CI screenshots | all |

**Rules**
- Units don't edit `src/index.ts`; only U8 does. This is the v1 precedent, and it avoids merge conflicts between parallel worktrees.
- Folders that are **not** touched: ChatInput, ChatPermissions, ApprovalCard, UserMessage, MessageActions, `ChainOfThought.tsx` itself, Popover and Table.

---

## 14. Amendments to the v1 spec

- **§1 Analytics.** "No `ANALYTICS_GAPS.md` is needed" now applies to the L1 folders only. `WallyAssistant/ANALYTICS_GAPS.md` exists (§6.5).
- **§3.1 ChatBody.** "The app attaches stick-to-bottom through `ref`" becomes "use `Conversation`/`ConversationContent`, which render ChatBody". ChatBody's API is unchanged.
- **§3.6 AssistantMessage composition order:** ChainOfThought → ApprovalCard → AssistantMessageContent → AssistantMessageError → MessageActions. AssistantMessageLoader stands alone, before the first output.
- **§3.8 ChainOfThought.**
  - Status is `'running' | 'done' | 'error'`.
  - The type → icon table is now WallyAssistant's internal default. It is still not exported, and `icons` overrides it.
- **§5 CopilotKit.**
  - The mapper (§10.1 here) is the default path for the closed panel. The v1 §5.2 adapter stays valid for custom layouts.
  - The v1 §5.1 rule `toolMessage ? 'done' : isRunning ? 'running' : 'done'` is wrong for HITL tools, because `isRunning` is false during the wait. Use §10.1's `toolStatus`.
- **User decision 5, timestamps.** The app still stamps `metadata.createdAt`. WallyAssistant formats it through `formatTimestamp`, which defaults to DS `formatRelativeTime`.
- **§9.** Add the §9 barrel entries.
- **§11 Out of scope.**
  - Remove "no auto-scroll or stick-to-bottom", "no scroll-to-bottom button" and "a CoT error status".
  - Keep "an exported type → icon map", "virtualization" and "no markdown renderer".
  - Still out of scope: branches, sources, attachments, edit, regenerate, read-aloud and loading older history. They can arrive later as minor releases, via `custom` parts and slots.

---

## 15. Stress-test resolution log

| Gap (source) | Resolution |
|---|---|
| HITL waits with `isRunning=false`, so the mapper showed waiting approvals as cancelled and the status was `'ready'` (S1, major) | **Accepted.** The mapper decides the HITL status before looking at `isRunning`, and decides `cancelled` from an app "stopped" set (§10.1). `'ready'` plus a pending approval is a documented normal state (§7.5). |
| Send was possible while an approval was pending (S1, major) | **Accepted.** `awaitingApproval` disables Send and guards submit; Stop stays available while streaming (decision 20). |
| The block folded and unfolded on preamble text or a custom part between tool calls (S1, S4, major) | **Accepted.** It folds only when the run is over (decision 7, §7.3); regression tests. |
| CopilotKit HITL can't be driven by data and callbacks alone (S1, major) | **Accepted as the documented path.** `renderPart` returns CopilotKit's card, which renders ApprovalCardView, which reads labels and markdown from the provider. `onApprovalRespond` is for SSE/REST (decision 12). |
| Resolved docked cards stayed docked, stacked up and shared one test id (S1, major) | **Partly accepted.** Only the pending ones dock, or else the last resolved one (decision 11), so cards no longer stack. Staying docked until a newer message is kept for the focus handoff and live region (open question 3). |
| The React Compiler freezes the CopilotKit log (S1, major) | **Accepted.** `'use no memo'` in the wiring component (§10.1, §7.7). |
| "Return undefined for the default" can't be built on `RenderCallback`; re-parsing (S2, S3, S4, major) | **Accepted.** `useRenderEveryTime` plus a default node built in the compiled view (decision 8, §5.3). |
| No per-step seam; the views were internal (S2, S3, S4, major) | **Accepted.** The views are exported with `ChatViewProvider`, plus `renderStepContent` and `ChatStep.name` (§5). |
| No "load older" for paginated history (S2, major) | **Rejected for v1.** It is not in Figma, and CopilotKit loads threads whole. It is additive later: a `logStart` slot plus anchoring on prepend (open question 7). |
| Inline callbacks changed the context and re-rendered every message (S3, major) | **Accepted.** Handlers are read through a latest ref; config stability is documented; a perf test pins it (§7.7). |
| `ChatJsonValue` rejects interfaces (S3, S4, major) | **Accepted.** `unknown` plus `ChatCustomPart<D>` (decision 19). |
| Prop names collided with DOM attributes (S3, major) | **Accepted.** Names are reserved, and a type test enforces it (decision 21). |
| Citations need ids in markdown (S3, major) | **Accepted.** `messageId` and `partId` (§5.1). |
| The actions row required text (S3, major) | **Accepted.** Any message with a rendered non-approval part gets the row (§7.1). |
| The ResizeObserver watched only the content (S4, major) | **Accepted.** It also observes the scroll element (§7.6). |
| Analytics on Copy, the thumbs and the approval buttons needed rebuilding them (S4, major) | **Partly accepted.** `ApprovalCardView` children replace its actions; Copy and the thumbs are a 3-line built-part recipe (§6.3); the gaps are documented (§6.5). No `MessageCopyAction` parts (YAGNI). |
| Drawer integration (S4, major) | **Partly accepted.** `textareaRef` and the recipe in §6.3. The Esc handling stays in the host, because the Drawer captures Esc first; a real fix belongs to Drawer (no `initialFocusEl` / Esc API today). |
| `timestampLabel` went stale and made mappers impure (S2, S3, S4) | **Accepted.** `createdAt` plus `formatTimestamp` (decision 18). |
| Minor gaps (S1–S4) | **Accepted:** the placeholder result; sub-agent nesting from a side table; `${user}:reply` ids; error-only replies; empty values mean absent; a required `label`; the CopilotKit example now compiles; the robust reducer; callbacks that receive objects; `onRetry(message, part)`; `placement` in ctx; filtered keydown escape; observing the footer; selection scoping; the thread-switch `key`; the history-loading recipe; `ChatToolPermission`; `title`/`content` reserved; the custom-part spacing note. **Rejected (YAGNI):** an `assertChatSnapshot` helper, published fixtures, exported status arrays, `loading` and `layout` props, a `submitDisabled` override, a DS duplicate-id warning (React already warns about duplicate keys), an axe run (no axe in this repo's e2e). |

---

## 16. Open questions

1. **Design review** for the visuals with no Figma frame:
   - the scroll-to-latest button (outline, round, bottom-centred)
   - `AssistantMessageError` and its Retry button (should Retry get the `RefreshCcw` icon?)
   - the CoT error tone (danger label and icon)
2. **Reasoning open while it streams.** This is AI Elements Reasoning behavior: open while live, closed when done. Keep it, or keep the row collapsed with only the shimmer? Figma draws only the static states.
3. **Resolved docked approval.** It stays above the input until the next user message (or a new pending approval). That keeps ApprovalCard's focus handoff and live region, as in the built ApprovalResolved story. Should it move inline straight away instead?
4. **Default approval options.** The default is the Figma SplitButton: "Always allow in this session", with "Allow once" in its menu, plus Reject. The built ApprovalDocked story uses Allow / Reject. Which should the closed panel use by default?
5. **Sending while an approval is pending.** The spec disables Send but keeps the draft editable. The alternative is that sending implicitly rejects the pending approval, which needs backend support.
6. **i18n.** Is v1 English-only, with `labels` as an override? Or do the consumer apps need localized labels now, and where would they come from?
7. **Older history and virtualization.** Confirm that loading older (paginated) history and virtualization stay out of v1. CopilotKit loads threads whole, and both can be added later as minor releases.

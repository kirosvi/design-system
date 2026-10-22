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
 *
 * Identity rules
 * 1. A text part's `id` is fixed when it starts; its `text` grows.
 * 2. A turn's id is `${userMessageId}:reply`, stable from the loading row through the answer or an error.
 *    Backend ids go in `meta` (e.g. `meta.sourceIds`).
 * 3. A run that fails before any output is an assistant message with only an `error` part.
 * 4. Optimistic user messages keep their client id after the server echoes them.
 * 5. Step ids are unique within a message, so step toggles survive the stream.
 * 6. Steps that arrive after a text part open a new chain-of-thought part; approvals don't close a block.
 *    One merged block followed by one text part is also valid.
 * 7. Keep unchanged messages and parts by identity where you can; correctness doesn't depend on it.
 * 8. On a thread switch, remount with `key={threadId}`.
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
  | 'thinking'
  | 'plan'
  | 'decision'
  | 'subagent'
  | 'tool'
  | 'command'
  | 'web-search'
  | 'query'
  | 'datastore'
  | 'api'
  | 'read'
  | 'fetch'
  | 'filter'
  | 'create'
  | 'edit'
  | 'cite'
  | 'threat'
  | 'scan'
  | 'pending'
  | 'summary'
  | 'created'
>;

interface ChatPartBase {
  readonly id: ChatId;
  readonly meta?: ChatMeta;
}

/** Assistant text is GFM markdown, rendered by `markdown` (default `AssistantMessageMarkdown`); user text is plain, whitespace kept.
 *  While streaming, `text` grows under the same `id`: snapshots, never deltas. */
export interface ChatTextPart extends ChatPartBase {
  readonly type: 'text';
  readonly text: string;
}

/** A superset of AI SDK tool states, CopilotKit ToolCallStatus and AG-UI events:
 *  pending = args streaming · running = executing · awaiting-approval = waiting for a human ·
 *  done = has a result · error = failed · denied = the user rejected it · cancelled = the run stopped first. */
export type ChatStepStatus =
  | 'pending'
  | 'running'
  | 'awaiting-approval'
  | 'done'
  | 'error'
  | 'denied'
  | 'cancelled';

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
  | ChatTextPart
  | ChatChainOfThoughtPart
  | ChatApprovalPart
  | ChatErrorPart
  | ChatCustomPart;
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

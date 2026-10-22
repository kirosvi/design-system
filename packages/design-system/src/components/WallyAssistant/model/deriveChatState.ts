import type {
  ChatApprovalPart,
  ChatId,
  ChatMessage,
  ChatStatus,
  ChatStep,
  ChatStepStatus,
} from './model';

export interface ChatViewState {
  /** `messages`, plus an empty reply `{ role: 'assistant', id: `${lastUserMessageId}:reply`, parts: [] }` while
   *  running and the last message is the user's (the loading row; the same id as the recommended mapper reply). */
  rows: readonly ChatMessage[];
  /** `messages.length === 0`. */
  empty: boolean;
  /** `status` is 'submitted' or 'streaming'. */
  running: boolean;
  /** The last row has a pending approval part. */
  awaitingApproval: boolean;
  /** `running && !awaitingApproval` → `aria-busy`. */
  busy: boolean;
  /** → Conversation `autoScrollKey`. */
  lastUserMessageId?: ChatId;
  /** Placement 'docked' only (§7.5). Render each with
   *  `<ChatPartView part message={rows.at(-1)} isLast placement='docked' />`. */
  dockedApprovals: readonly ChatApprovalPart[];
}

const LIVE_STEP_STATUSES: ReadonlySet<string> = new Set<ChatStepStatus>([
  'pending',
  'running',
  'awaiting-approval',
]);
const NO_APPROVALS: readonly ChatApprovalPart[] = [];

/** 'submitted' | 'streaming'. Unknown statuses behave like 'ready'. */
export const isRunningStatus = (status: ChatStatus | undefined): boolean =>
  status === 'submitted' || status === 'streaming';

/** The step's own status is pending, running or awaiting-approval. */
export const isLiveStepStatus = (status: ChatStepStatus): boolean => LIVE_STEP_STATUSES.has(status);

/** The step or any nested step is live (§7.3). */
export const isLiveStep = (step: ChatStep): boolean =>
  isLiveStepStatus(step.status) || (step.steps?.some(isLiveStep) ?? false);

const approvalsOf = (message: ChatMessage | undefined): ChatApprovalPart[] =>
  message?.role === 'assistant'
    ? message.parts.filter((p): p is ChatApprovalPart => p.type === 'approval')
    : [];

export const hasPendingApproval = (message: ChatMessage | undefined): boolean =>
  approvalsOf(message).some(p => p.status === 'pending');

/** The last row's pending approvals; when none is pending, its last approval (decision 11). */
export const getDockedApprovals = (
  lastRow: ChatMessage | undefined,
): readonly ChatApprovalPart[] => {
  const approvals = approvalsOf(lastRow);
  const pending = approvals.filter(p => p.status === 'pending');
  if (pending.length) return pending;
  const last = approvals[approvals.length - 1];
  return last ? [last] : NO_APPROVALS;
};

/** What Copy copies: `copyText`, or the non-empty text parts joined by a blank line. */
export const copyTextOf = (message: ChatMessage): string =>
  (message.role === 'assistant' && message.copyText) ||
  message.parts.flatMap(p => (p.type === 'text' && p.text ? [p.text] : [])).join('\n\n');

const lastUserIdOf = (messages: readonly ChatMessage[]): ChatId | undefined => {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m?.role === 'user') return m.id;
  }
  return undefined;
};

/** Every derived rule of the chat, in one pure function shared by WallyAssistant and custom layouts (§7.1).
 *  `approvalPlacement` must match the `ChatViewProvider`'s, or a docked approval renders twice or never. */
export function deriveChatState(
  messages: readonly ChatMessage[],
  status: ChatStatus = 'ready',
  approvalPlacement: 'docked' | 'inline' = 'inline',
): ChatViewState {
  const running = isRunningStatus(status);
  const lastUserMessageId = lastUserIdOf(messages);
  const last = messages[messages.length - 1];
  const rows: readonly ChatMessage[] =
    running && last?.role === 'user'
      ? [...messages, { role: 'assistant', id: `${last.id}:reply`, parts: [] }]
      : messages;
  const lastRow = rows[rows.length - 1];
  const awaitingApproval = hasPendingApproval(lastRow);

  return {
    rows,
    empty: messages.length === 0,
    running,
    awaitingApproval,
    busy: running && !awaitingApproval,
    lastUserMessageId,
    dockedApprovals: approvalPlacement === 'docked' ? getDockedApprovals(lastRow) : NO_APPROVALS,
  };
}

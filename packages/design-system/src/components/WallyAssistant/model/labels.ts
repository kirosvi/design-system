/**
 * Every user-visible string WallyAssistant and the data views render. English defaults; pass a
 * `Partial<ChatLabels>` to override, so a key added in a minor release doesn't break the build.
 */
export interface ChatLabels {
  /** Header title text; undefined keeps the built "Ask Wally" mark. */
  title?: string;
  /** Chat aria-label. */
  region: string;
  /** Log aria-label. */
  log: string;
  greeting: string;
  suggestions: string;
  placeholder: string;
  /** Textarea aria-label. */
  input: string;
  send: string;
  stop: string;
  disclaimer: string;
  scrollToBottom: string;
  you: string;
  assistant: string;
  showMore: string;
  showLess: string;
  /** The loader and the synthetic Working row. */
  working: string;
  messageActions: string;
  copy: string;
  feedbackPositive: string;
  feedbackNegative: string;
  retry: string;
  approvalCaption: string;
  approvalAllowAlways: string;
  approvalAllowOnce: string;
  approvalReject: string;
  approvalMoreOptions: string;
  approved: string;
  rejected: string;
  permissions: string;
  permissionsHeading: string;
  removeContext: (label: string) => string;
}

export const DEFAULT_CHAT_LABELS: ChatLabels = {
  region: 'Wally chat',
  log: 'Chat messages',
  greeting: 'How can I help you today?',
  suggestions: 'Suggestions',
  placeholder: 'Ask Wally...',
  input: 'Message Wally',
  send: 'Send',
  stop: 'Stop response',
  disclaimer: 'Wally can make mistakes; always verify.',
  scrollToBottom: 'Scroll to latest message',
  you: 'You',
  assistant: 'Wally',
  showMore: 'Show more',
  showLess: 'Show less',
  working: 'Working...',
  messageActions: 'Message actions',
  copy: 'Copy',
  feedbackPositive: 'Good response',
  feedbackNegative: 'Bad response',
  retry: 'Retry',
  approvalCaption: 'Requires your approval',
  approvalAllowAlways: 'Always allow in this session',
  approvalAllowOnce: 'Allow once',
  approvalReject: 'Reject',
  approvalMoreOptions: 'More approval options',
  approved: 'Approved',
  rejected: 'Rejected',
  permissions: 'Permission settings',
  permissionsHeading: 'Always allowed in this conversation',
  removeContext: label => `Remove ${label}`,
};

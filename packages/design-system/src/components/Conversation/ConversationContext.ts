import { createContext, useContext } from 'react';

interface ConversationContextValue {
  isAtBottom: boolean;
  /** Re-sticks and scrolls: 'smooth' glides (rAF, follows growth), else or under reduced motion jumps. */
  scrollToBottom: (behavior?: ScrollBehavior) => void;
}

/** Internal: the parts also need the scroll element and the callback refs. */
interface ConversationInternalValue extends ConversationContextValue {
  scrollEl: HTMLElement | null;
  setScrollEl: (node: HTMLElement | null) => void;
  setContentEl: (node: HTMLElement | null) => void;
}

export const ConversationContext = createContext<ConversationInternalValue | null>(null);

export const useConversationInternal = (part: string): ConversationInternalValue => {
  const context = useContext(ConversationContext);
  if (!context) throw new Error(`${part} must be rendered inside <Conversation>`);
  return context;
};

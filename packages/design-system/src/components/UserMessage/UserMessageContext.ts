import { createContext, useContext } from 'react';

interface UserMessageBubbleContextValue {
  /** `id` of the text element, for the toggle's `aria-controls`. */
  contentId: string;
  expanded: boolean;
  toggle: () => void;
}

export const UserMessageBubbleContext = createContext<UserMessageBubbleContextValue | null>(null);

export const useUserMessageBubbleContext = () => useContext(UserMessageBubbleContext);

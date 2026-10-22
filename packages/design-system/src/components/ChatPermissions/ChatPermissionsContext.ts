import { createContext, useContext } from 'react';

interface ChatPermissionsContextValue {
  /** Shared by the Popover and the Tooltip so both anchor to the one trigger button. */
  triggerId: string;
}

export const ChatPermissionsContext = createContext<ChatPermissionsContextValue | null>(null);

export const useChatPermissionsContext = (): ChatPermissionsContextValue => {
  const context = useContext(ChatPermissionsContext);
  if (!context) {
    throw new Error('ChatPermissions parts must be rendered inside <ChatPermissions>');
  }
  return context;
};

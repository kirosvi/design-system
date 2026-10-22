import { createContext, useContext } from 'react';

export interface ChatInputContextValue {
  value: string;
  onValueChange: (value: string) => void;
  isRunning: boolean;
  disabled: boolean;
  onStop?: () => void;
  /** Present only while the disclaimer is rendered. */
  disclaimerId?: string;
}

export const ChatInputContext = createContext<ChatInputContextValue | null>(null);

export const useChatInputContext = (): ChatInputContextValue => {
  const context = useContext(ChatInputContext);
  if (!context) throw new Error('ChatInput parts must be rendered inside <ChatInput>');
  return context;
};

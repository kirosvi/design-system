import { createContext, useContext } from 'react';

export type ChatSuggestionSize = 'md' | 'lg';

interface ChatSuggestionsContextValue {
  size: ChatSuggestionSize;
}

const ChatSuggestionsContext = createContext<ChatSuggestionsContextValue>({ size: 'md' });

export const ChatSuggestionsProvider = ChatSuggestionsContext.Provider;

export const useChatSuggestionsContext = (): ChatSuggestionsContextValue =>
  useContext(ChatSuggestionsContext);

import React, { createContext, useContext } from 'react';
import { useChatStore } from './chatStore';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const store = useChatStore();
  return (
    <ChatContext.Provider value={store}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
}

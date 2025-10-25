import { useState, useCallback } from 'react';
import { openRouterApiService, OpenRouterMessage } from '@/services/openRouterApiService';
import { useToast } from '@/hooks/use-toast';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AIChatState {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
}

export function useAIChat() {
  const { toast } = useToast();
  const [state, setState] = useState<AIChatState>({
    messages: [],
    loading: false,
    error: null,
  });

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const addMessage = useCallback((message: ChatMessage) => {
    setState(prev => ({ 
      ...prev, 
      messages: [...prev.messages, message] 
    }));
  }, []);

  const setMessages = useCallback((messages: ChatMessage[]) => {
    setState(prev => ({ ...prev, messages }));
  }, []);

  /**
   * Send a message to the AI and get a response
   */
  const sendMessage = useCallback(async (userMessage: string) => {
    if (!userMessage.trim()) return;

    // Add user message immediately
    const userChatMessage: ChatMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    };
    addMessage(userChatMessage);

    try {
      setLoading(true);
      setError(null);

      // Convert chat messages to OpenRouter format
      const conversationHistory: OpenRouterMessage[] = state.messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));

      // Get AI response
      const aiResponse = await openRouterApiService.getFarmingAdvice(
        userMessage,
        conversationHistory
      );

      // Add AI response
      const aiChatMessage: ChatMessage = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString(),
      };
      addMessage(aiChatMessage);

      toast({
        title: "AI Response",
        description: "Your farming question has been answered!",
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get AI response';
      setError(errorMessage);
      
      // Add error message as assistant response
      const errorChatMessage: ChatMessage = {
        role: 'assistant',
        content: `I apologize, but I encountered an error: ${errorMessage}. Please try again or rephrase your question.`,
        timestamp: new Date().toISOString(),
      };
      addMessage(errorChatMessage);

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [state.messages, addMessage, setLoading, setError, toast]);

  /**
   * Clear all messages
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, [setMessages, setError]);

  /**
   * Load messages from localStorage
   */
  const loadMessages = useCallback((savedMessages: ChatMessage[]) => {
    setMessages(savedMessages);
  }, [setMessages]);

  /**
   * Test API connection
   */
  const testConnection = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const isConnected = await openRouterApiService.testConnection();
      
      if (isConnected) {
        toast({
          title: "Connection Test",
          description: "AI service is working correctly!",
        });
      } else {
        toast({
          title: "Connection Test",
          description: "AI service test failed",
          variant: "destructive",
        });
      }
      
      return isConnected;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection test failed';
      setError(errorMessage);
      
      toast({
        title: "Connection Test",
        description: errorMessage,
        variant: "destructive",
      });
      
      return false;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, toast]);

  return {
    // State
    messages: state.messages,
    loading: state.loading,
    error: state.error,
    
    // Actions
    sendMessage,
    clearMessages,
    loadMessages,
    testConnection,
  };
}

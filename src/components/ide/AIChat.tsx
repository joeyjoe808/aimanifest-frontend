import { useState, useRef, useEffect, useReducer } from 'react';
import { Send, Paperclip, X, Bot, User, Zap, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ChatMessage } from '@shared/types';

interface AIChatProps {
  projectId: number;
  isConnected: boolean;
  onSendMessage?: (message: ChatMessage) => void;
}

interface ChatState {
  messages: ChatMessage[];
  isConnected: boolean;
  isTyping: boolean;
  error: string | null;
}

type ChatAction = 
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'SET_TYPING'; payload: boolean }
  | { type: 'SET_CONNECTION'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_MESSAGES' };

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
        isTyping: false
      };
    case 'SET_TYPING':
      return { ...state, isTyping: action.payload };
    case 'SET_CONNECTION':
      return { ...state, isConnected: action.payload, error: action.payload ? null : state.error };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isTyping: false };
    case 'CLEAR_MESSAGES':
      return { ...state, messages: [] };
    default:
      return state;
  }
}

export default function AIChat({ projectId, isConnected, onSendMessage }: AIChatProps) {
  const [state, dispatch] = useReducer(chatReducer, {
    messages: [
      {
        id: 'initial-welcome',
        content: 'Hello! I\'m your Master AI Agent. I coordinate a team of 6 specialized AI agents to help you build applications. What would you like to create today?',
        role: 'assistant',
        timestamp: new Date().toISOString()
      }
    ],
    isConnected: true,
    isTyping: false,
    error: null
  });

  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages]);

  // Test API connection on mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await fetch('/api/agents/status');
        if (response.ok) {
          dispatch({ type: 'SET_CONNECTION', payload: true });
          dispatch({ type: 'SET_ERROR', payload: null });
        } else {
          dispatch({ type: 'SET_CONNECTION', payload: false });
          dispatch({ type: 'SET_ERROR', payload: 'Master AI Agent is offline' });
        }
      } catch (error) {
        dispatch({ type: 'SET_CONNECTION', payload: false });
        dispatch({ type: 'SET_ERROR', payload: 'Master AI Agent is offline' });
      }
    };

    testConnection();
    const interval = setInterval(testConnection, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  // Initialize SSE connection for streaming responses
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !state.isConnected) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      content: inputValue,
      role: 'user',
      timestamp: new Date().toISOString()
    };

    dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
    dispatch({ type: 'SET_TYPING', payload: true });
    setInputValue('');

    try {
      // Close existing SSE connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      // Send the message directly to the chat API and get streaming response
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputValue,
          projectId,
          conversationHistory: state.messages.slice(-10)
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}-${Math.random()}`,
          content: '',
          role: 'assistant',
          timestamp: new Date().toISOString()
        };

        let messageAdded = false;
        
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  
                  if (data.type === 'ai_response' || data.type === 'ai_update') {
                    if (data.message) {
                      assistantMessage.content += data.message + '\n';
                      if (!messageAdded) {
                        dispatch({ type: 'ADD_MESSAGE', payload: { ...assistantMessage } });
                        messageAdded = true;
                      }
                    }
                  }
                } catch (parseError) {
                  // Ignore parsing errors for malformed SSE data
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
          dispatch({ type: 'SET_TYPING', payload: false });
        }
      }

      if (onSendMessage) {
        onSendMessage(userMessage);
      }

    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to send message. Please try again.' });
      dispatch({ type: 'SET_TYPING', payload: false });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageContent = (content: string) => {
    // Basic syntax highlighting for code blocks
    if (content.includes('```')) {
      return content.split('```').map((part, index) => {
        if (index % 2 === 1) {
          return (
            <pre key={index} className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md mt-2 mb-2 overflow-x-auto">
              <code className="text-sm">{part}</code>
            </pre>
          );
        }
        return <span key={index}>{part}</span>;
      });
    }
    return content;
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Master AI Agent</h3>
          <Badge variant={state.isConnected ? "default" : "destructive"} className="text-xs">
            {state.isConnected ? 'Connected' : 'Offline'}
          </Badge>
        </div>
      </div>
      {/* Error Banner */}
      {state.error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 flex-shrink-0">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{state.error}</span>
          </div>
        </div>
      )}
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {state.messages.map((message, index) => (
          <div
            key={`${message.id}-${index}-${message.timestamp}`}
            className={`flex gap-3 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
            )}
            
            <Card className={`max-w-[80%] ${
              message.role === 'user' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-50 dark:bg-gray-800'
            }`}>
              <CardContent className="p-3">
                <div className="text-sm whitespace-pre-wrap text-[#9ca3af]">
                  {formatMessageContent(message.content)}
                </div>
                <div className={`text-xs mt-2 opacity-70 ${
                  message.role === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </CardContent>
            </Card>

            {message.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </div>
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {state.isTyping && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-pulse" />
            </div>
            <Card className="bg-gray-50 dark:bg-gray-800">
              <CardContent className="p-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={state.isConnected ? "Type your message..." : "Connecting..."}
              disabled={!state.isConnected}
              className="pr-12"
            />
            <Button
              size="sm"
              variant="ghost"
              className="absolute right-1 top-1/2 -translate-y-1/2"
              disabled
            >
              <Paperclip className="w-4 h-4" />
            </Button>
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || !state.isConnected}
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
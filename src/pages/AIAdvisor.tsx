import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send, Loader2, Bot, User, TestTube, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAIChat, ChatMessage } from "@/hooks/useAIChat";


const AIAdvisor = () => {
  const navigate = useNavigate();
  const { messages, loading, error, sendMessage, clearMessages, loadMessages, testConnection } = useAIChat();
  const [input, setInput] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown');
  const scrollRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    "When should I plant maize in Mpumalanga?",
    "How much water does my citrus crop need?",
    "My plants have yellow leaves, what's wrong?",
    "Best fertilizer schedule for tomatoes?",
    "How to improve soil health naturally?",
    "What crops grow best in my climate?",
    "How to prevent common plant diseases?",
    "When is the best time to harvest?",
  ];

  useEffect(() => {
    // Load chat history from localStorage
    const saved = localStorage.getItem("smartfarm_chat");
    if (saved) {
      try {
        const parsedMessages: ChatMessage[] = JSON.parse(saved);
        loadMessages(parsedMessages);
      } catch (error) {
        console.error('Failed to load chat history:', error);
      }
    }
  }, [loadMessages]);

  useEffect(() => {
    // Save to localStorage
    if (messages.length > 0) {
      localStorage.setItem("smartfarm_chat", JSON.stringify(messages));
    }
  }, [messages]);

  // Test connection on component mount
  useEffect(() => {
    const testApiConnection = async () => {
      const isConnected = await testConnection();
      setConnectionStatus(isConnected ? 'connected' : 'disconnected');
    };
    testApiConnection();
  }, [testConnection]);

  useEffect(() => {
    // Auto-scroll to bottom
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (question?: string) => {
    const messageText = question || input;
    if (!messageText.trim()) return;

    setInput("");
    await sendMessage(messageText);
  };

  const handleTestConnection = async () => {
    const isConnected = await testConnection();
    setConnectionStatus(isConnected ? 'connected' : 'disconnected');
  };

  const handleClearChat = () => {
    clearMessages();
    localStorage.removeItem("smartfarm_chat");
  };

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      {/* Header */}
      <header className="bg-card border-b shadow-soft">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">AI Farm Advisor</h1>
              <p className="text-sm text-muted-foreground">Your 24/7 farming assistant</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge 
              variant={connectionStatus === 'connected' ? 'default' : connectionStatus === 'disconnected' ? 'destructive' : 'secondary'}
              className="flex items-center gap-1"
            >
              <Bot className="h-3 w-3" />
              {connectionStatus === 'connected' ? 'Connected' : connectionStatus === 'disconnected' ? 'Disconnected' : 'Testing...'}
            </Badge>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestConnection}
              disabled={loading}
            >
              <TestTube className="h-4 w-4 mr-1" />
              Test
            </Button>
            
            {messages.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearChat}
                disabled={loading}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </header>

      

      {/* Chat Area */}
      <div className="flex-1 container mx-auto px-4 py-4 flex flex-col">
        <Card className="flex-1 flex flex-col shadow-medium">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Chat History</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 px-4" ref={scrollRef}>
              {messages.length === 0 && (
                <div className="py-8 text-center text-muted-foreground">
                  <p className="mb-4">Ask me anything about farming!</p>
                  <div className="space-y-2">
                    {suggestedQuestions.map((q, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        className="w-full max-w-md text-left justify-start"
                        onClick={() => handleSend(q)}
                      >
                        {q}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              <div className="space-y-4 pb-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {msg.role === "assistant" && (
                          <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        )}
                        {msg.role === "user" && (
                          <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-3 flex items-center gap-2">
                      <Bot className="h-4 w-4" />
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">AI is thinking...</span>
                    </div>
                  </div>
                )}
                {error && (
                  <div className="flex justify-start">
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 max-w-[80%]">
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t p-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask your farming question..."
                  disabled={loading}
                />
                <Button type="submit" disabled={loading || !input.trim()} size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIAdvisor;

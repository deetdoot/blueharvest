import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Brain,
  Send,
  User,
  Loader2
} from "lucide-react";
import NavigationHeader from "@/components/navigation-header";
import { parseMarkdownBold } from "@/lib/markdown-utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import puddleImage from "@assets/Puddle the Planter_1759063996813.png";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export default function SmartAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Hi there! I'm **Puddle the Planter**, your friendly farm companion! 🌱💧 I love helping with irrigation, crops, weather, and all things water-related on your Green Valley Farm. What would you like to know today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");

  // Get farmer ID from farmers query (using the prototype farmer)
  const { data: farmers = [] } = useQuery<any[]>({
    queryKey: ["/api/farmers"],
  });
  
  const farmerId = farmers[0]?.id;

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await fetch(`/api/farmers/${farmerId}/chat`, {
        method: "POST",
        body: JSON.stringify({ message }),
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) {
        throw new Error('Chat request failed');
      }
      return response.json();
    },
    onSuccess: (data) => {
      const botMessage: Message = {
        id: Date.now().toString() + "-bot",
        content: data.response || "I'm having trouble processing that right now. Could you try rephrasing your question?",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    },
    onError: () => {
      const errorMessage: Message = {
        id: Date.now().toString() + "-error",
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  });

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !farmerId) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString() + "-user",
      content: inputMessage.trim(),
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Send to API
    chatMutation.mutate(inputMessage.trim());
    
    // Clear input
    setInputMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader farmerName="John Doe" farmerId={farmerId} />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center gap-4">
          <img 
            src={puddleImage} 
            alt="Puddle the Planter" 
            className="w-16 h-16 rounded-full border-2 border-primary/20"
            data-testid="img-puddle-avatar"
          />
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2" data-testid="text-assistant-title">
              Chat with Puddle the Planter
            </h2>
            <p className="text-muted-foreground">
              Your friendly farm companion for irrigation, crops, weather, and water wisdom!
            </p>
          </div>
        </div>

        <Card className="h-[600px] flex flex-col" data-testid="card-chat-interface">
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4" data-testid="scroll-messages">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.isUser ? 'justify-end' : 'justify-start'}`}
                    data-testid={`message-${message.isUser ? 'user' : 'bot'}-${message.id}`}
                  >
                    {!message.isUser && (
                      <div className="w-8 h-8 rounded-full overflow-hidden border border-primary/20">
                        <img 
                          src={puddleImage} 
                          alt="Puddle" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <div
                      className={`max-w-[80%] rounded-lg px-3 py-2 ${
                        message.isUser
                          ? 'bg-primary text-primary-foreground ml-auto'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <div className="text-sm">
                        {message.isUser ? (
                          message.content
                        ) : (
                          <div>
                            {parseMarkdownBold(message.content).map((part, partIndex) => 
                              part.isBold ? (
                                <strong key={partIndex} className="font-semibold">
                                  {part.text}
                                </strong>
                              ) : (
                                part.text
                              )
                            )}
                          </div>
                        )}
                      </div>
                      <div className={`text-xs mt-1 opacity-70`}>
                        {message.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>

                    {message.isUser && (
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-blue-500 text-white">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                
                {/* Loading indicator */}
                {chatMutation.isPending && (
                  <div className="flex gap-3" data-testid="loading-indicator">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-primary/20">
                      <img 
                        src={puddleImage} 
                        alt="Puddle" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="bg-muted text-muted-foreground rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Puddle is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t p-4">
              <div className="flex gap-2" data-testid="input-area">
                <Input
                  placeholder="Ask me about your farm, irrigation, or crops..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={chatMutation.isPending || !farmerId}
                  className="flex-1"
                  data-testid="input-message"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || chatMutation.isPending || !farmerId}
                  data-testid="button-send"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              {!farmerId && (
                <p className="text-xs text-muted-foreground mt-2">
                  Loading farm data...
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Suggestions */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Try asking:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              "Hey Puddle, should I water my corn today?",
              "Puddle, how's my water efficiency looking?",
              "What's the weather forecast, Puddle?",
              "When should I irrigate next, Puddle?"
            ].map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="justify-start text-left h-auto py-2"
                onClick={() => setInputMessage(suggestion)}
                disabled={chatMutation.isPending}
                data-testid={`suggestion-${index}`}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
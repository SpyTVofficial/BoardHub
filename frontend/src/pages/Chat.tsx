
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { useUserGuardContext } from "app/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, Users, Circle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from 'react-i18next';
import brain from "brain";
import { ChatMessage, ChatMessageCreate } from "types";
import { WS_API_URL } from "app";

export default function Chat() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useUserGuardContext();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [isLoadingMessage, setIsLoadingMessage] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Handle input change with typing indicators
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentMessage(e.target.value);
    
    // Handle typing indicator
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      if (!isTyping) {
        setIsTyping(true);
        wsRef.current.send(JSON.stringify({ type: 'typing_start' }));
      }
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'typing_stop' }));
        }
      }, 1000);
    }
  };

  // Load message history
  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await brain.get_chat_messages({ limit: 100 });
      const data = await response.json();
      setMessages(data.messages);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load chat history');
    } finally {
      setLoading(false);
    }
  };

  // Load online users
  const loadOnlineUsers = async () => {
    try {
      const response = await brain.get_online_users();
      const data = await response.json();
      setOnlineUsers(data.online_users);
    } catch (error) {
      console.error('Error loading online users:', error);
    }
  };

  // Connect to WebSocket
  const connectWebSocket = async () => {
    try {
      // Get auth token for WebSocket
      const token = await (await import('app/auth')).auth.getAuthToken();
      
      // Debug the WS_API_URL to understand its structure
      console.log('WS_API_URL:', WS_API_URL);
      
      // Try different URL constructions
      let wsUrl = `${WS_API_URL}/chat/ws`;
      
      // If WS_API_URL doesn't include the full path, try without /routes
      if (!WS_API_URL.includes('routes')) {
        wsUrl = `${WS_API_URL}/routes/chat/ws`;
      }
      
      const protocols = ["databutton.app", `Authorization.Bearer.${token}`];
      
      console.log('Attempting WebSocket connection to:', wsUrl);
      console.log('Using protocols:', protocols);
      
      wsRef.current = new WebSocket(wsUrl, protocols);
      
      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        toast.success('Connected to chat');
      };
      
      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'new_message':
            // Add new message to list
            setMessages(prev => [...prev, data.message]);
            break;
          case 'online_users':
          case 'user_joined':
          case 'user_left':
            setOnlineUsers(data.online_users || data.users || []);
            break;
          case 'typing':
            if (data.user_id !== user.sub) {
              setIsTyping(prev => ({
                ...prev,
                [data.user_id]: data.is_typing
              }));
              
              // Clear typing indicator after 3 seconds
              if (data.is_typing) {
                setTimeout(() => {
                  setIsTyping(prev => ({
                    ...prev,
                    [data.user_id]: false
                  }));
                }, 3000);
              }
            }
            break;
          case 'pong':
            // Handle ping/pong for connection health
            break;
        }
      };
      
      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        toast.error('Disconnected from chat');
        
        // Attempt to reconnect after 3 seconds
        setTimeout(() => {
          if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
            connectWebSocket();
          }
        }, 3000);
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };
      
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      toast.error('Failed to connect to chat');
    }
  };

  // Send message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const content = currentMessage.trim();
    if (!content || isLoadingMessage) return;
    
    setIsLoadingMessage(true);
    try {
      const messageData: ChatMessageCreate = { content };
      await brain.send_chat_message(messageData);
      setCurrentMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsLoadingMessage(false);
    }
  };

  // Format timestamp
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Initialize on mount
  useEffect(() => {
    loadMessages();
    loadOnlineUsers();
    connectWebSocket();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-board-neutral-200 pb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-board-teal-800 mb-2">
              {t('chat.title', 'Board Chat')}
            </h1>
            <p className="text-board-neutral-600 max-w-2xl">
              {t('chat.description', 'Real-time communication for board members during and between meetings.')}
            </p>
          </div>
          
          {/* Connection Status */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-board-neutral-50 to-white border border-board-neutral-200">
            <Circle className={`w-3 h-3 ${isConnected ? 'text-board-emerald-500 fill-board-emerald-500' : 'text-board-coral-500 fill-board-coral-500'}`} />
            <span className={`text-sm font-medium ${isConnected ? 'text-board-emerald-700' : 'text-board-coral-700'}`}>
              {isConnected ? t('chat.connected', 'Connected') : t('chat.disconnected', 'Disconnected')}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Online Users Sidebar */}
        <div className="lg:col-span-1">
          <Card className="border-board-neutral-200 shadow-sm bg-gradient-to-br from-white to-board-teal-50/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-board-teal-800 flex items-center">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-board-teal-100 to-board-teal-200 flex items-center justify-center mr-3">
                  <Users className="w-4 h-4 text-board-teal-600" />
                </div>
                {t('chat.online_users', 'Online Users')} ({onlineUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {onlineUsers.length === 0 ? (
                  <div className="text-center py-4">
                    <div className="w-12 h-12 rounded-full bg-board-neutral-100 flex items-center justify-center mx-auto mb-3">
                      <Users className="w-6 h-6 text-board-neutral-400" />
                    </div>
                    <p className="text-sm text-board-neutral-500">
                      {t('chat.no_users_online', 'No users currently online')}
                    </p>
                  </div>
                ) : (
                  onlineUsers.map((onlineUser, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 rounded-lg hover:bg-board-teal-50/50 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-board-teal-100 to-board-teal-200 flex items-center justify-center text-xs font-medium text-board-teal-700">
                        {onlineUser.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-board-neutral-800 truncate">
                          {onlineUser.name || t('chat.anonymous_user', 'Anonymous User')}
                        </p>
                        <p className="text-xs text-board-neutral-500">
                          {t('chat.online', 'Online')}
                        </p>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-board-emerald-500" />
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Messages */}
        <div className="lg:col-span-3">
          <Card className="border-board-neutral-200 shadow-sm h-[600px] flex flex-col">
            <CardHeader className="bg-gradient-to-r from-board-teal-50/50 to-board-cyan-50/30 border-b border-board-neutral-200">
              <CardTitle className="text-board-teal-800 flex items-center">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-board-teal-100 to-board-teal-200 flex items-center justify-center mr-3">
                  <MessageSquare className="w-4 h-4 text-board-teal-600" />
                </div>
                {t('chat.conversation', 'Board Conversation')}
              </CardTitle>
              {typingUsers.length > 0 && (
                <div className="text-sm text-board-teal-600 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  {typingUsers.join(', ')} {typingUsers.length === 1 ? t('chat.is_typing', 'is typing...') : t('chat.are_typing', 'are typing...')}
                </div>
              )}
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0">
              <ScrollArea className="flex-1 p-4">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-board-teal-200 border-t-board-teal-600 rounded-full animate-spin mr-3" />
                    <div className="text-board-neutral-500">{t('chat.loading', 'Loading messages...')}</div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-board-teal-100 to-board-teal-200 flex items-center justify-center mx-auto mb-6">
                      <MessageSquare className="h-10 w-10 text-board-teal-600" />
                    </div>
                    <h3 className="text-lg font-medium text-board-teal-800 mb-2">
                      {t('chat.no_messages', 'No messages yet')}
                    </h3>
                    <p className="text-board-neutral-500">
                      {t('chat.start_conversation', 'Start the conversation by sending a message below.')}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => {
                      const isOwnMessage = message.user_id === user.id;
                      return (
                        <div key={message.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                            isOwnMessage 
                              ? 'bg-gradient-to-r from-board-teal-500 to-board-cyan-500 text-white' 
                              : 'bg-gradient-to-r from-board-neutral-100 to-board-neutral-50 text-board-neutral-800 border border-board-neutral-200'
                          }`}>
                            {!isOwnMessage && (
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-board-teal-100 to-board-teal-200 flex items-center justify-center text-xs font-medium text-board-teal-700">
                                  {message.user_name?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <span className="text-xs font-medium text-board-neutral-600">
                                  {message.user_name || t('chat.anonymous_user', 'Anonymous User')}
                                </span>
                              </div>
                            )}
                            <p className={`text-sm ${isOwnMessage ? 'text-white' : 'text-board-neutral-800'}`}>
                              {message.content}
                            </p>
                            <p className={`text-xs mt-2 ${
                              isOwnMessage ? 'text-board-teal-100' : 'text-board-neutral-500'
                            }`}>
                              {new Date(message.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>
              
              {/* Message Input */}
              <div className="border-t border-board-neutral-200 p-4 bg-gradient-to-r from-board-neutral-50/50 to-white">
                <form onSubmit={sendMessage} className="flex gap-2">
                  <Input
                    value={currentMessage}
                    onChange={handleInputChange}
                    placeholder={t('chat.type_message', 'Type your message...')}
                    className="flex-1 border-board-neutral-300 focus:border-board-teal-500"
                    disabled={!isConnected || isLoadingMessage}
                  />
                  <Button 
                    type="submit" 
                    disabled={!currentMessage.trim() || !isConnected || isLoadingMessage}
                    className="bg-gradient-to-r from-board-teal-500 to-board-cyan-500 hover:from-board-teal-600 hover:to-board-cyan-600 text-white px-6"
                  >
                    {isLoadingMessage ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

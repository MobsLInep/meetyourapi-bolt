'use client';

import { useState, useRef, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Plus, Send, Image as ImageIcon, X, Code2, Sparkles } from 'lucide-react';
import { uploadImage } from '@/lib/imagekit';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string | null;
}

interface ChatInterfaceProps {
  chatId?: string;
}

export default function ChatInterface({ chatId }: ChatInterfaceProps) {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentChatId, setCurrentChatId] = useState<string | undefined>(chatId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load previous chat if chatId is provided
  useEffect(() => {
    const loadChat = async () => {
      if (chatId) {
        try {
          const response = await fetch(`/api/chats/${chatId}`);
          if (response.ok) {
            const chat = await response.json();
            setMessages(chat.messages);
            setCurrentChatId(chatId);
          }
        } catch (error) {
          console.error('Error loading chat:', error);
        }
      } else {
        // Clear messages and currentChatId when no chatId is provided
        setMessages([]);
        setCurrentChatId(undefined);
      }
    };

    loadChat();
  }, [chatId]);

  // Listen for new chat event
  useEffect(() => {
    const handleNewChat = () => {
      setMessages([]);
      setCurrentChatId(undefined);
      setInput('');
      setSelectedImage(null);
      setPreviewUrl(null);
    };

    window.addEventListener('newChat', handleNewChat);
    return () => window.removeEventListener('newChat', handleNewChat);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !selectedImage) return;

    const userMessage = input.trim();
    setInput('');
    setSelectedImage(null);
    setPreviewUrl(null);
    setIsLoading(true);

    // Create unique IDs for messages
    const userMessageId = `user-${Date.now()}`;
    const assistantMessageId = `assistant-${Date.now()}`;

    // Add user message to chat
    const newUserMessage: Message = {
      id: userMessageId,
      content: userMessage || '', // Empty string for image-only messages
      role: 'user',
      imageUrl: previewUrl,
    };

    // Add loading message
    const loadingMessage: Message = {
      id: assistantMessageId,
      content: '',
      role: 'assistant',
    };

    // Update messages with both new messages
    setMessages(prev => [...prev, newUserMessage, loadingMessage]);

    try {
      let imageUrl: string | undefined;
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
        newUserMessage.imageUrl = imageUrl;
        setMessages(prev => prev.map(msg => 
          msg === newUserMessage ? { ...msg, imageUrl } : msg
        ));
      }

      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: userMessage || 'Image query',
          imageUrl,
          messages: messages,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      if (reader) {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          assistantMessage += chunk;
          
          // Update only the assistant's message
          setMessages(prev => prev.map(msg => 
            msg.id === assistantMessageId 
              ? { ...msg, content: assistantMessage }
              : msg
          ));
        }
      }

      // Save the chat with the final messages
      const updatedMessages = [
        ...messages,
        newUserMessage,
        {
          id: assistantMessageId,
          content: assistantMessage,
          role: 'assistant',
        }
      ];

      // Only create a new chat if this is the first message
      if (!currentChatId) {
        const response = await fetch('/api/chats', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: userMessage ? userMessage.slice(0, 30) + '...' : 'Image query',
            messages: updatedMessages,
          }),
        });

        if (response.ok) {
          const savedChat = await response.json();
          setCurrentChatId(savedChat._id);
          window.history.pushState({}, '', `/dashboard?chat=${savedChat._id}`);
        }
      } else {
        // Update existing chat
        await fetch(`/api/chats/${currentChatId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: updatedMessages,
          }),
        });
      }

      // Dispatch chat update event
      window.dispatchEvent(new Event('chatUpdated'));

    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
          ? { ...msg, content: 'Sorry, I encountered an error. Please try again.' }
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      textareaRef.current?.form?.requestSubmit();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      // Create preview URL for the selected image
      const previewUrl = URL.createObjectURL(file);
      setPreviewUrl(previewUrl);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg flex items-center justify-center">
            <Code2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-mono font-bold text-white">API Assistant</h1>
            <p className="text-xs text-slate-400 font-mono">Specialized in API support</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-slate-400 font-mono">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center mb-6 animate-pulse">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-mono font-bold text-white mb-2">
              Welcome to MeetYourAPI
            </h2>
            <p className="text-slate-400 font-mono max-w-md">
              I'm your AI assistant specialized in API documentation, endpoints, authentication, and troubleshooting. 
              How can I help you today?
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-2xl p-4 ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                  : 'bg-slate-800/50 border border-slate-700/50 text-slate-100 backdrop-blur-sm'
              }`}
            >
              {message.imageUrl && (
                <div className="mb-3">
                  <img
                    src={message.imageUrl}
                    alt="Uploaded"
                    className="max-w-full h-auto rounded-lg border border-slate-600/50"
                  />
                </div>
              )}
              {message.role === 'assistant' ? (
                <div className="prose prose-invert prose-cyan max-w-none">
                  <ReactMarkdown
                    components={{
                      code: ({ children, className }) => (
                        <code className={`${className} bg-slate-900/50 px-2 py-1 rounded text-cyan-400 font-mono text-sm`}>
                          {children}
                        </code>
                      ),
                      pre: ({ children }) => (
                        <pre className="bg-slate-900/50 border border-slate-700/50 p-4 rounded-lg overflow-x-auto">
                          {children}
                        </pre>
                      )
                    }}
                  >
                    {message.content || (isLoading && message.id.includes('assistant') ? 'Thinking...' : '')}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="font-medium">{message.content}</p>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-6 border-t border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me about APIs, endpoints, authentication..."
              className="w-full p-4 pr-12 bg-slate-800/50 border border-slate-700/50 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white placeholder-slate-400 font-mono backdrop-blur-sm"
              rows={1}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute right-3 bottom-3 p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-700/50 rounded-lg transition-colors"
              disabled={isLoading}
            >
              <ImageIcon size={20} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          <button
            type="submit"
            disabled={(!input.trim() && !selectedImage) || isLoading}
            className="p-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 transition-all duration-300"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
        {previewUrl && (
          <div className="mt-3 relative inline-block">
            <img
              src={previewUrl}
              alt="Preview"
              className="max-h-32 rounded-lg border border-slate-600/50"
            />
            <button
              onClick={() => {
                setSelectedImage(null);
                setPreviewUrl(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
'use client';

import { useState, useRef, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Plus, Send, Image as ImageIcon, X } from 'lucide-react';
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

    // Create unique IDs for messages
    const userMessageId = `user-${Date.now()}`;
    const assistantMessageId = `assistant-${Date.now()}`;

    // Add user message to chat
    const newUserMessage: Message = {
      id: userMessageId,
      content: userMessage,
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
          prompt: userMessage,
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
            title: userMessage.slice(0, 30) + '...',
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
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {message.imageUrl && (
                <div className="mb-2">
                  <img
                    src={message.imageUrl}
                    alt="Uploaded"
                    className="max-w-full h-auto rounded"
                  />
                </div>
              )}
              {message.role === 'assistant' ? (
                <div className="prose prose-neutral dark:prose-invert max-w-none">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              ) : (
                <p>{message.content}</p>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="w-full p-3 pr-12 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={1}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute right-2 bottom-2 p-1 text-gray-500 hover:text-gray-700"
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
            disabled={!input.trim() && !selectedImage}
            className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
        {previewUrl && (
          <div className="mt-2 relative inline-block">
            <img
              src={previewUrl}
              alt="Preview"
              className="max-h-32 rounded"
            />
            <button
              onClick={() => {
                setSelectedImage(null);
                setPreviewUrl(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </form>
    </div>
  );
} 
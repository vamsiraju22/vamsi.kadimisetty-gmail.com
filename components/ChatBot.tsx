
import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Chat } from '@google/genai';
import { getChatInstance } from '../services/geminiService';
import { ChatMessage } from '../types';
import Card from './common/Card';
import { BotIcon } from './common/icons/BotIcon';
import { UserIcon } from './common/icons/UserIcon';
import { SearchIcon } from './common/icons/SearchIcon';

const ChatBot: React.FC = () => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initChat = () => {
      const chatInstance = getChatInstance();
      setChat(chatInstance);
      setMessages([{ role: 'model', content: "Hello! I am Market Mentor AI. Ask me any question about the market, and I will provide a deep, multi-layered analysis connecting macroeconomic trends, sector dynamics, and company fundamentals to give you a comprehensive research perspective." }]);
    };
    initChat();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading || !chat) return;

    const newUserMessage: ChatMessage = { role: 'user', content: userInput };
    setMessages(prev => [...prev, newUserMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const stream = await chat.sendMessageStream({ message: userInput });
      
      let currentModelMessage = '';
      const sourcesMap = new Map<string, { uri: string; title: string }>();
      setMessages(prev => [...prev, { role: 'model', content: '', sources: [] }]);

      for await (const chunk of stream) {
        currentModelMessage += chunk.text;
        
        const groundingChunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (groundingChunks) {
          for (const chunk of groundingChunks) {
            if (chunk.web) {
              sourcesMap.set(chunk.web.uri, { uri: chunk.web.uri, title: chunk.web.title || chunk.web.uri });
            }
          }
        }

        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          lastMessage.content = currentModelMessage;
          lastMessage.sources = Array.from(sourcesMap.values());
          return newMessages;
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { role: 'model', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="h-[85vh] flex flex-col">
      <h2 className="text-xl font-bold mb-4 text-cyan-400 border-b border-gray-700 pb-2">Market Chat</h2>
      <div className="flex-grow overflow-y-auto custom-scrollbar pr-4 mb-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 my-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'model' && <div className="w-8 h-8 flex-shrink-0 bg-cyan-500 rounded-full flex items-center justify-center"><BotIcon /></div>}
            <div className={`max-w-md lg:max-w-2xl px-4 py-2 rounded-lg ${msg.role === 'user' ? 'bg-gray-700' : 'bg-gray-700/50'}`}>
              {msg.role === 'model' ? (
                <div className="prose-chat">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              )}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-600">
                  <h4 className="text-xs font-semibold text-gray-400 mb-2 flex items-center gap-1.5">
                    <SearchIcon className="h-3 w-3" />
                    Sources
                  </h4>
                  <ul className="list-decimal list-inside text-xs space-y-1">
                    {msg.sources.map((source, idx) => (
                      <li key={idx}>
                        <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline truncate block" title={source.title}>
                          {source.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            {msg.role === 'user' && <div className="w-8 h-8 flex-shrink-0 bg-gray-600 rounded-full flex items-center justify-center"><UserIcon /></div>}
          </div>
        ))}
        {isLoading && (
            <div className="flex items-start gap-3 my-4">
                <div className="w-8 h-8 flex-shrink-0 bg-cyan-500 rounded-full flex items-center justify-center"><BotIcon /></div>
                <div className="max-w-md lg:max-w-2xl px-4 py-2 rounded-lg bg-gray-700/50 flex items-center">
                    <span className="animate-pulse">...</span>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="flex gap-4">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Ask about market trends..."
          className="flex-grow bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:ring-cyan-500 focus:border-cyan-500"
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !userInput.trim()} className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition-colors">
          Send
        </button>
      </form>
    </Card>
  );
};

export default ChatBot;
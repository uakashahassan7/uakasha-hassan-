/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Sparkles, X, Send, Bot } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const KhayrAdvisorModal: React.FC = () => {
  const { isAdvisorOpen, setIsAdvisorOpen, products } = useStore();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Assalam-o-Alaikum! Welcome to BARVAKA. I am your Khayr Shopping Advisor. How can I help you today? Inquire about fabric sizing, pure attar notes, gadget details, or gift recommendations.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isAdvisorOpen) return null;

  const quickPrompts = [
    'What size should I order for a 40" chest Kurta?',
    'Recommend a luxury gift under Rs. 6,000',
    'How does Cash on Delivery work with Free Delivery?',
    'Which Lawn suit is best for hot Pakistani summer?',
  ];

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend.trim(),
          productCatalog: products.map((p) => ({
            name: p.name,
            price: p.base_price,
            category: p.category_id,
            variants: p.variants.map((v) => `${v.size || ''} ${v.color || ''}`.trim()),
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      const assistantMsg: ChatMessage = {
        id: `ast-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || 'I am delighted to help with your BARVAKA order.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const fallbackMsg: ChatMessage = {
        id: `ast-${Date.now()}`,
        sender: 'assistant',
        text: 'For Pakistani attire sizing: S fits 38" chest, M fits 40", L fits 42", XL fits 44". Every order includes 100% Free Nationwide Delivery and Cash on Delivery (COD). You can inspect your package upon delivery with our 7-day easy exchange guarantee! For live help, WhatsApp us anytime at 0300-8278252.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="advisor-modal-title"
    >
      <div className="bg-white rounded-[12px] shadow-[0_10px_30px_rgba(15,59,46,0.2)] border border-[#E4DFD1] w-full max-w-xl flex flex-col h-[580px] max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-[#0F3B2E] text-[#F8F4EA] flex items-center justify-between border-b border-[#0A2A21]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#0A2A21] border border-[#B8963E]/40 flex items-center justify-center text-[#B8963E]">
              <Sparkles className="w-4 h-4" strokeWidth={1.5} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="advisor-modal-title" className="font-serif font-bold text-base text-[#F8F4EA]">
                  BARVAKA Khayr Advisor
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#B8963E]/20 text-[#B8963E] border border-[#B8963E]/30">
                  AI Guidance
                </span>
              </div>
              <p className="text-[11px] text-[#E6EFEA]/80">
                Sizing advice, gift recommendations &amp; Pakistani occasion styling
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAdvisorOpen(false)}
            aria-label="Close Advisor"
            className="p-1.5 rounded-[8px] text-[#E6EFEA] hover:text-white hover:bg-[#0A2A21] transition-colors"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#F8F4EA]/40">
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <div
                key={m.id}
                className={`flex gap-2.5 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-full bg-[#0F3B2E] text-[#F8F4EA] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-4 h-4 text-[#B8963E]" strokeWidth={1.5} />
                  </div>
                )}
                <div
                  className={`p-3.5 rounded-[12px] text-xs leading-relaxed shadow-xs ${
                    isUser
                      ? 'bg-[#0F3B2E] text-[#F8F4EA]'
                      : 'bg-white text-[#1C1C1C] border border-[#E4DFD1]'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  <span
                    className={`block text-[10px] mt-1.5 ${
                      isUser ? 'text-[#F3EAD2]/80 text-right' : 'text-[#6B6B66]'
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-2.5 max-w-[85%] mr-auto">
              <div className="w-7 h-7 rounded-full bg-[#0F3B2E] text-[#F8F4EA] flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4 text-[#B8963E]" strokeWidth={1.5} />
              </div>
              <div className="p-3.5 rounded-[12px] bg-white text-[#6B6B66] border border-[#E4DFD1] text-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B8963E] animate-ping" />
                Consulting sizing &amp; store catalog...
              </div>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-2.5 bg-[#F8F4EA] border-t border-[#E4DFD1] overflow-x-auto flex gap-2">
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-xs bg-white text-[#0F3B2E] hover:bg-[#E6EFEA] border border-[#E4DFD1] rounded-full px-3 py-1.5 shrink-0 transition-colors text-left"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-[#E4DFD1] flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            placeholder="Ask about sizes, fabrics, gifts, or delivery..."
            className="flex-1 px-4 py-2.5 min-h-[44px] bg-white border border-[#E4DFD1] rounded-[10px] text-xs text-[#1C1C1C] focus:outline-hidden focus:ring-2 focus:ring-[#0F3B2E]"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            aria-label="Send query"
            className="p-2.5 min-h-[44px] min-w-[44px] bg-[#0F3B2E] hover:bg-[#0A2A21] disabled:opacity-50 text-[#F8F4EA] rounded-[10px] transition-colors shadow-xs flex items-center justify-center"
          >
            <Send className="w-4 h-4 text-[#B8963E]" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
};

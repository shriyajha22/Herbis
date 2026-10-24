'use client';

import React, { useState } from 'react';
import { X, Send, ArrowUp, Bot, Sparkles, RefreshCw } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useStore } from '@/lib/storeContext';

export default function FloatingChat() {
  const pathname = usePathname();
  const { currentUser, showToast } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'bot', text: '👋 Namaste! I am Herbie, your AI Tea Concierge. How can I help you discover your perfect herbal tea blend today?' }
  ]);

  const isWindowAdmin = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
  const isAdminPath = pathname?.startsWith('/admin');
  const isAdminUser = currentUser?.role === 'admin';

  if (isAdminPath || isWindowAdmin || isAdminUser) {
    return null;
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userText = message;
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setMessage('');

    setTimeout(() => {
      let botReply = "Thank you for reaching out! For pure antioxidants and natural relaxation, try our signature 'Blue Tea' (₹249) or our adaptogenic 'Ayur Tea' (₹380)!";
      const q = userText.toLowerCase();

      if (q.includes('sugar') || q.includes('diabetic') || q.includes('glucose') || q.includes('guava') || q.includes('jamun') || q.includes('neem')) {
        botReply = "For traditional digestive wellness and natural gut comfort, we strongly recommend our 'Guava + Jamun + Neem Herbal Blend' (₹425)!";
      } else if (q.includes('digest') || q.includes('elaichi') || q.includes('bloat')) {
        botReply = "For digestive ease and post-meal comfort, check out our 'Blue Tea with Elaichi' (₹299) or 'Blue Tea with Ginger + Cinnamon' (₹349)!";
      } else if (q.includes('ayurved') || q.includes('stress') || q.includes('immunity')) {
        botReply = "For stress relief and core immunity, try our tridosha balancing 'Authentic Ayurvedic Kashayam' (₹380) with traditional Ayurvedic spices & herbs!";
      } else if (q.includes('shipping') || q.includes('delivery')) {
        botReply = "We provide Free Express Shipping across India on orders above ₹799! Metro delivery takes 2–3 business days.";
      }
      setMessages((prev) => [...prev, { sender: 'bot', text: botReply }]);
    }, 800);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className="p-2.5 bg-brand-cardWhite text-brand-darkGreen rounded-full shadow-card border border-brand-mint/40 hover:bg-brand-bgSoft transition-all duration-300 hover:scale-105"
        title="Scroll to Top"
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-4 h-4" />
      </button>

      {/* Floating Robot Chat Window */}
      {isOpen && (
        <div className="bg-brand-cardWhite rounded-modal shadow-premium border border-brand-mint/40 w-80 sm:w-96 overflow-hidden flex flex-col h-[400px] animate-in fade-in slide-in-from-bottom-5">
          {/* Robot Header */}
          <div className="bg-brand-darkGreen text-white p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Friendly Robot Avatar */}
              <div className="w-9 h-9 rounded-full bg-brand-bgBeige border border-brand-gold/60 flex items-center justify-center relative shadow-soft">
                <Bot className="w-5 h-5 text-brand-green" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-sky-400 border-2 border-brand-darkGreen animate-pulse" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-xs text-white flex items-center gap-1.5">
                  Herbie <span className="text-[10px] font-normal bg-brand-green/40 px-1.5 py-0.2 rounded text-brand-mint">AI Robot Assistant</span>
                </h4>
                <span className="text-[10px] text-brand-mint flex items-center gap-1">
                  Online • PrimeBrew Herbal Concierge
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10"
              aria-label="Close Chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-brand-bgSoft/60 text-xs">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start items-start'}`}
              >
                {m.sender === 'bot' && (
                  <div className="w-6 h-6 rounded-full bg-brand-bgBeige border border-brand-mint flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-brand-green" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] p-3 rounded-card text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'btn-primary-gradient text-white rounded-tr-none shadow-soft'
                      : 'bg-white border border-brand-mint/30 text-brand-darkGrey shadow-soft rounded-tl-none font-light'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 bg-brand-cardWhite border-t border-brand-mint/20 flex gap-2">
            <input
              type="text"
              placeholder="Ask Herbie about teas, benefits, ingredients..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 px-3 py-2 text-xs bg-white border border-brand-mint/40 rounded-input focus:outline-none focus:border-brand-green text-brand-darkGrey placeholder-gray-400"
            />
            <button
              type="submit"
              className="btn-primary-gradient p-2 rounded-button shadow-soft flex items-center justify-center"
              aria-label="Send message"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </form>
        </div>
      )}

      {/* Modern Friendly Robot Avatar Launcher Button */}
      {/* <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-brand-cardWhite border-2 border-brand-green hover:border-brand-darkGreen text-brand-darkGreen p-3.5 rounded-full shadow-premium flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group relative"
        title="Chat with Herbie (AI Herbal Concierge)"
        aria-label="Chat with Herbie"
      >
        <div className="relative">
          <Bot className="w-7 h-7 text-brand-green group-hover:rotate-12 transition-transform duration-300" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-brand-gold rounded-full animate-soft-pulse border border-white" />
        </div>
        <span className="sr-only">Live AI Robot Concierge</span>
      </button> */}
    </div>
  );
}

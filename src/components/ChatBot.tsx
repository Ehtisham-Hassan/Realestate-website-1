import React, { useState, useRef, useEffect } from "react";
import { Listing } from "../types";
import PropertyCard from "./PropertyCard";
import { MessageSquare, X, Send, Bot, User, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ChatBotProps {
  listings: Listing[];
  onViewDetails: (property: Listing) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  listingIds?: string[];
}

export default function ChatBot({ listings, onViewDetails }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: "welcome",
    sender: "bot",
    text: "Hello! I am the Vantage Real Estate Assistant. How can I help you find your dream home today?",
  }]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: inputValue.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.text }),
      });

      if (!res.ok) {
        throw new Error("Chat request failed");
      }

      const data = await res.json();
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: data.reply,
        listingIds: data.listingIds || [],
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: "I'm sorry, I'm having trouble connecting to my servers right now. Please try again later.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessageListings = (listingIds: string[]) => {
    if (!listingIds || listingIds.length === 0) return null;
    
    const matchedListings = listingIds.map(id => listings.find(l => l.id === id)).filter(Boolean) as Listing[];
    if (matchedListings.length === 0) return null;

    return (
      <div className="flex flex-col gap-3 mt-3">
        {matchedListings.map(property => (
          <div key={property.id} className="scale-95 origin-left">
            <PropertyCard property={property} onViewDetails={onViewDetails} />
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      {/* Floating Chat Bubble */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: isOpen ? 0 : 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-brand-black hover:bg-brand-grey text-brand-white p-4 rounded-full shadow-lg shadow-brand-black/20 transition-colors cursor-pointer border border-brand-black"
      >
        <MessageSquare className="w-6 h-6" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-full max-w-[380px] h-[600px] max-h-[80vh] bg-brand-cream-alt border border-brand-border rounded-2xl shadow-2xl flex flex-col overflow-hidden text-brand-black"
          >
            {/* Header */}
            <div className="bg-brand-white border-b border-brand-border p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg overflow-hidden border border-brand-border bg-brand-cream flex-shrink-0">
                  <img 
                    src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=150&q=80" 
                    alt="Chatbot Avatar" 
                    className="w-full h-full object-cover grayscale opacity-90" 
                  />
                </div>
                <div>
                  <h3 className="font-serif text-brand-black text-sm font-bold">Vantage Assistant</h3>
                  <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 block"></span> Online
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-brand-grey hover:text-brand-black transition-colors cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Message History */}
            <div className="flex-grow p-4 overflow-y-auto flex flex-col gap-4 bg-brand-cream-alt">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[85%] ${
                    msg.sender === "user" ? "self-end items-end" : "self-start items-start"
                  }`}
                >
                  <div
                    className={`p-3 rounded-2xl text-sm ${
                      msg.sender === "user"
                        ? "bg-brand-black text-brand-white rounded-br-sm"
                        : "bg-brand-white text-brand-black border border-brand-border rounded-bl-sm shadow-sm"
                    }`}
                  >
                    <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                  </div>
                  {msg.sender === "bot" && msg.listingIds && renderMessageListings(msg.listingIds)}
                </div>
              ))}
              
              {isLoading && (
                <div className="self-start max-w-[80%] flex items-center gap-2 text-brand-grey text-xs">
                  <Loader2 className="w-4 h-4 animate-spin text-brand-black" />
                  <span>Assistant is typing...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form
              onSubmit={handleSendMessage}
              className="bg-brand-white border-t border-brand-border p-3 flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask about properties..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-grow bg-brand-cream-alt text-sm text-brand-black placeholder-brand-grey border border-brand-border rounded-full px-4 py-2.5 focus:outline-none focus:border-brand-black transition-colors"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="bg-brand-black hover:bg-brand-grey disabled:bg-brand-border disabled:text-brand-grey text-brand-white p-2.5 rounded-full transition-colors cursor-pointer flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

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
        className="fixed bottom-6 right-6 z-40 bg-[#D4AF37] hover:bg-[#C5A267] text-black p-4 rounded-full shadow-lg shadow-[#D4AF37]/20 transition-colors cursor-pointer border border-[#D4AF37]"
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
            className="fixed bottom-6 right-6 z-50 w-full max-w-[380px] h-[600px] max-h-[80vh] bg-[#0F0F0F] border border-[#1F1F1F] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#111111] border-b border-[#1F1F1F] p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-[#D4AF37]/20 p-2 rounded-lg">
                  <Bot className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div>
                  <h3 className="font-serif italic text-white text-sm font-bold">Vantage Assistant</h3>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 block"></span> Online
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[#888] hover:text-white transition-colors cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Message History */}
            <div className="flex-grow p-4 overflow-y-auto flex flex-col gap-4 bg-[#0A0A0A]">
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
                        ? "bg-[#D4AF37] text-black rounded-br-sm"
                        : "bg-[#1F1F1F] text-[#E0E0E0] border border-[#333] rounded-bl-sm"
                    }`}
                  >
                    <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                  </div>
                  {msg.sender === "bot" && msg.listingIds && renderMessageListings(msg.listingIds)}
                </div>
              ))}
              
              {isLoading && (
                <div className="self-start max-w-[80%] flex items-center gap-2 text-[#888] text-xs">
                  <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                  <span>Assistant is typing...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form
              onSubmit={handleSendMessage}
              className="bg-[#111111] border-t border-[#1F1F1F] p-3 flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask about properties..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-grow bg-[#0A0A0A] text-sm text-white placeholder-[#555] border border-[#1F1F1F] rounded-full px-4 py-2.5 focus:outline-hidden focus:border-[#D4AF37] transition-colors"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="bg-[#D4AF37] hover:bg-[#C5A267] disabled:bg-[#333] disabled:text-[#555] text-black p-2.5 rounded-full transition-colors cursor-pointer flex-shrink-0"
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

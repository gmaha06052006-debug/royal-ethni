import React, { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles, MessageCircle, HelpCircle, ArrowRight, ShoppingCart } from "lucide-react";
import { Product, StylistMessage } from "../types";

interface AIStylistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onAddToCart: (product: Product, size: string, color: string) => void;
  onViewProductDetails: (productId: string) => void;
  currentCurrency: string;
}

export default function AIStylistDrawer({
  isOpen,
  onClose,
  products,
  onAddToCart,
  onViewProductDetails,
  currentCurrency
}: AIStylistDrawerProps) {
  const [messages, setMessages] = useState<StylistMessage[]>([
    {
      sender: "assistant",
      text: "Namaste, royal client. I am Maharani, your personal wedding Haute Couture stylist. From picking the perfect zardozi raw silk lehenga for your vows, to selecting a modern Nehru jacket for a sangeet soirée, I am delighted to consult with you. Tell me, what celebratory event are we styling for?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || loading) return;

    const userMsg: StylistMessage = {
      sender: "user",
      text: inputVal,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai/stylist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg] })
      });

      if (!response.ok) {
        throw new Error("API Route failure");
      }

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        {
          sender: "assistant",
          text: data.reply,
          suggestedProducts: data.suggestedProductIds,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "assistant",
          text: "Forgive me, noble guest. The royal communications network is experiencing a small delay. Our tailored pieces are fully customizable. May I guide you further on any specific item?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestClick = (sampleQuery: string) => {
    setInputVal(sampleQuery);
  };

  const formatPrice = (price: number) => {
    if (currentCurrency === "INR") {
      return `₹${price.toLocaleString("en-IN")}`;
    } else {
      // Basic 1 USD = 83 INR conversion
      return `$${Math.round(price / 83).toLocaleString()}`;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop overlay */}
      <div 
        className="absolute inset-0 bg-amber-950/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Styled Right-side Drawer Panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-stone-50 border-l border-amber-100 flex flex-col shadow-2xl relative">
          
          {/* Header */}
          <div className="bg-amber-950 text-amber-50 px-6 py-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-amber-500 to-amber-300 p-1.5 rounded-full text-amber-950 animate-pulse">
                <Sparkles size={16} />
              </div>
              <div>
                <h3 className="text-sm font-serif tracking-widest uppercase font-bold text-amber-100">
                  Maharani Hermitage AI
                </h3>
                <p className="text-[9px] uppercase tracking-wider text-amber-300 font-sans">
                  Royal Fashion Intelligence
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="text-amber-200 hover:text-white p-1 rounded-full hover:bg-white/10"
            >
              <X size={18} />
            </button>
          </div>

          {/* Active Consultation Body (Chat Area) */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-4 font-sans text-xs scroll-smooth"
          >
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start animate-fade-in"}`}
              >
                {/* Bubble message wrapper */}
                <div 
                  className={`max-w-[85%] rounded-lg px-4 py-2.5 shadow-xs leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-amber-800 text-white rounded-br-none"
                      : "bg-white text-stone-950 border border-amber-100 rounded-bl-none"
                  }`}
                >
                  <p className="whitespace-pre-line prose max-w-none">{msg.text}</p>
                  
                  <span className={`block text-[9px] mt-1 text-right ${
                    msg.sender === "user" ? "text-amber-200/80" : "text-stone-400"
                  }`}>
                    {msg.timestamp}
                  </span>
                </div>

                {/* Suggested Real catalog Products directly linked in chat */}
                {msg.suggestedProducts && msg.suggestedProducts.length > 0 && (
                  <div className="w-full mt-3 pl-2 border-l-2 border-amber-600 space-y-2">
                    <p className="text-[10px] text-amber-800 font-serif font-bold uppercase tracking-wider">
                      Maharani's Curated Selection:
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {msg.suggestedProducts.map((pId) => {
                        const prod = products.find((p) => p.id === pId);
                        if (!prod) return null;
                        return (
                          <div 
                            key={prod.id} 
                            className="bg-white border border-amber-100 p-2.5 rounded flex gap-3 shadow-xs hover:border-amber-700 transition"
                          >
                            <img 
                              src={prod.images[0]} 
                              alt={prod.name} 
                              className="w-12 h-16 object-cover rounded-sm border cursor-pointer border-amber-50"
                              onClick={() => {
                                onViewProductDetails(prod.id);
                                onClose();
                              }}
                              referrerPolicy="no-referrer"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 
                                className="font-serif font-bold text-xs text-amber-950 hover:text-amber-700 cursor-pointer truncate"
                                onClick={() => {
                                  onViewProductDetails(prod.id);
                                  onClose();
                                }}
                              >
                                {prod.name}
                              </h4>
                              <p className="text-[10px] text-stone-500 font-sans capitalize">{prod.subCategory}</p>
                              <p className="text-xs font-bold font-serif text-amber-800 mt-0.5">
                                {formatPrice(prod.price)}
                              </p>
                            </div>
                            <button
                              onClick={() => onAddToCart(prod, prod.sizes[0], prod.colors[0])}
                              className="self-end bg-amber-700 hover:bg-amber-800 text-stone-50 p-1.5 rounded active:scale-95 transition"
                              title="Bespoke Quick-add"
                            >
                              <ShoppingCart size={12} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-stone-400 italic">
                <div className="flex space-x-1.5">
                  <div className="w-1.5 h-1.5 bg-amber-700 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-amber-700 rounded-full animate-bounce delay-150"></div>
                  <div className="w-1.5 h-1.5 bg-amber-700 rounded-full animate-bounce delay-300"></div>
                </div>
                <span className="text-[10px] uppercase tracking-widest text-amber-600 font-serif">Consulting our archives...</span>
              </div>
            )}
          </div>

          {/* Quick suggestions helpers */}
          <div className="p-3 bg-amber-50 border-t border-amber-100/60 overflow-x-auto whitespace-nowrap flex gap-2">
            <button 
              onClick={() => handleSuggestClick("I want to style a Bridal Lehenga under 200,000 INR")}
              className="text-[10px] px-3 py-1 bg-white hover:bg-amber-100 border border-amber-200 rounded-full text-amber-950 font-sans flex-shrink-0 transition"
            >
              Bridal Lehenga Outfit
            </button>
            <button 
              onClick={() => handleSuggestClick("Suggest a groom Sherwani for an Ivory palace wedding")}
              className="text-[10px] px-3 py-1 bg-white hover:bg-amber-100 border border-amber-200 rounded-full text-amber-950 font-sans flex-shrink-0 transition"
            >
              Groom Ivory Sherwani
            </button>
            <button 
              onClick={() => handleSuggestClick("Help me find a saree for my daughter's reception")}
              className="text-[10px] px-3 py-1 bg-white hover:bg-amber-100 border border-amber-200 rounded-full text-amber-950 font-sans flex-shrink-0 transition"
            >
              Wedding Saree
            </button>
          </div>

          {/* Input Panel */}
          <form 
            onSubmit={handleSend} 
            className="p-4 bg-white border-t border-amber-100 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Inquire with Maharani..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              disabled={loading}
              className="flex-1 bg-amber-50/50 border border-amber-200 rounded-md px-3 py-2 text-xs text-amber-950 focus:outline-none focus:border-amber-700"
            />
            <button
              type="submit"
              disabled={loading || !inputVal.trim()}
              className="bg-amber-900 hover:bg-amber-950 text-white p-2 rounded-md transition disabled:opacity-50"
            >
              <Send size={14} />
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}

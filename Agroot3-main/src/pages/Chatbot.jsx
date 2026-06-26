import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "../context/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getChatResponse } from "../services/gemini";

/* ── Sidebar icons helper ── */
const renderSidebarIcon = (label) => {
  switch (label) {
    case "Dashboard": return (
      <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
        <rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>
      </svg>);
    case "Fields": return (
      <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2.5"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/>
      </svg>);
    case "Crops": return (
      <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C6.5 2 2 6.5 2 12c0 3.5 1.8 6.6 4.5 8.5.3.2.7.2 1-.1L19.7 8.2c.3-.3.3-.7.1-1C17.6 3.8 14.5 2 12 2z"/>
        <path d="M12 2v20M2 12h20" strokeDasharray="1.5 1.5"/>
      </svg>);
    case "Crop Tracker": return (
      <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
      </svg>);
    case "Rentals": return (
      <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
      </svg>);
    case "Alerts": return (
      <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>);
    case "Reports": return (
      <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      </svg>);
    case "Profile": return (
      <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>);
    default: return null;
  }
};

const Chatbot = () => {
  const navigate = useNavigate();
  const { language } = useApp();
  const { t } = useTranslation();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef(null);

  // Load configuration from local storage
  const region = localStorage.getItem("region") || "tamilnadu";
  const soilType = localStorage.getItem("soil") || "loamy";
  const isRaining = localStorage.getItem("rain") === "yes";

  const month = new Date().getMonth() + 1;
  const season = month >= 6 && month <= 10 ? "kharif" : "rabi";

  // Build smart chips dynamically
  const quickChips = [];
  if (region === "tamilnadu") {
    quickChips.push(season === "kharif" ? "Paddy crop advice" : "Millet crop advice");
  } else if (region === "kerala") {
    quickChips.push(season === "kharif" ? "Rice crop guidance" : "Spices cultivation tips");
  } else {
    quickChips.push(season === "kharif" ? "Cotton crop tips" : "Wheat crop advice");
  }

  if (soilType === "black") {
    quickChips.push("Crops suitable for black soil");
  } else if (soilType === "red") {
    quickChips.push("Best crops for red soil");
  } else {
    quickChips.push("Loamy soil crop suggestions");
  }

  if (!isRaining) {
    quickChips.push("Is irrigation needed today?");
  }
  quickChips.push("Organic farming methods", "Pest control solutions");

  // Initial welcome message
  useEffect(() => {
    setMessages([
      {
        role: "model",
        text: t("chatbot.greeting") || "Hello! I am Agroot AI. How can I help you regarding farming, crops, and irrigation today?"
      }
    ]);
  }, [language, t]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (textToSend = input) => {
    const trimmed = textToSend.trim();
    if (!trimmed) return;

    const newMessages = [...messages, { role: "user", text: trimmed }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await getChatResponse(trimmed, language);
      setMessages([...newMessages, { role: "model", text: response }]);
    } catch (e) {
      setMessages([...newMessages, { role: "model", text: "I'm having trouble connecting to Agroot AI right now. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Voice recognition is not supported in this browser.");
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = language === "ta" ? "ta-IN" : language === "hi" ? "hi-IN" : "en-IN";
    
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
    };
    recognition.start();
  };

  const sidebarItems = [
    { label: "Dashboard",    path: "/home" },
    { label: "Fields",       path: "/satellite" },
    { label: "Crops",        path: "/seeds" },
    { label: "Crop Tracker", path: "/costs" },
    { label: "Rentals",      path: "/rental" },
    { label: "Alerts",       path: "/alerts" },
    { label: "Reports",      path: "/profile" },
    { label: "Profile",      path: "/profile" },
  ];

  return (
    <div className="min-h-screen w-full font-sans flex bg-[#F8F9FA] text-[#1A2E1A] overflow-hidden">
      {/* ── LEFT SIDEBAR ── */}
      <aside className="hidden lg:flex flex-col w-[220px] h-screen bg-white border-r border-[#EFEBE3] p-4 shrink-0 z-20 select-none">
        <div className="flex flex-col h-full justify-between">
          <div>
            {/* Logo */}
            <div className="flex flex-col items-center justify-center pt-2 pb-6 border-b border-[#EFEBE3]/60 w-full gap-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50/50 border border-emerald-500/10 flex items-center justify-center shadow-sm">
                <svg className="w-8 h-8 text-emerald-600" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3c-4.5 4.5-5 8.5-5 11 0 2.8 2.2 5 5 5s5-2.2 5-5c0-2.5-.5-6.5-5-11z" fill="#10B981" fillOpacity="0.25" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 21V10" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round"/>
                  <path d="M12 14c1.5-1 2.5-2.5 2.5-4" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round"/>
                  <path d="M12 17c-1.5-1-2.5-2.5-2.5-4" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="font-extrabold text-[12px] tracking-[0.18em] text-emerald-955 uppercase mt-1">AGROOT</span>
            </div>
            {/* Nav */}
            <nav className="space-y-1.5 mt-5">
              {sidebarItems.map(item => (
                <button key={item.label} onClick={() => item.path && navigate(item.path)}
                  className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-[12px] font-extrabold tracking-wide text-gray-400 hover:text-emerald-950 hover:bg-gray-50/50">
                  <span className="shrink-0 text-gray-400">{renderSidebarIcon(item.label)}</span>
                  <span>{t(`sidebar.${item.label.toLowerCase().replace(/\s+/g, "")}`, item.label)}</span>
                </button>
              ))}
            </nav>
          </div>
          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider text-center py-2">v1.2.0</div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 h-screen flex flex-col z-10 relative overflow-hidden bg-[#F8F9FA]">
        
        {/* Chat Header */}
        <header className="flex-none p-5 lg:px-8 border-b border-[#EFEBE3]/60 bg-white flex items-center justify-between z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-500/10 flex items-center justify-center relative shadow-sm">
              <span className="text-xl">🤖</span>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-base font-black text-emerald-950 tracking-tight">{t("chatbot.title", "Agroot Smart Assistant")}</h1>
              <p className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-widest mt-0.5">Agroot AI Active</p>
            </div>
          </div>

          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={() => navigate("/home")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-black text-emerald-800 border border-emerald-200 bg-[#FCFBF8] hover:bg-emerald-50 transition-all cursor-pointer">
            ← Dashboard
          </motion.button>
        </header>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-5 lg:p-8 space-y-5 scroll-smooth bg-[#F8F9FA]">
          <div className="max-w-4xl mx-auto space-y-5">
            <AnimatePresence initial={false}>
              {messages.map((m, index) => {
                const isUser = m.role === "user";
                return (
                  <motion.div key={index}
                    initial={{ opacity: 0, y: 16, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.25 }}
                    className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
                    
                    <div className={`max-w-[85%] md:max-w-2xl p-5 rounded-3xl text-sm font-semibold shadow-sm leading-relaxed ${
                      isUser
                        ? "bg-[#1B4332] text-white rounded-br-none"
                        : "bg-white/70 backdrop-blur-xl border border-emerald-500/5 text-[#1B3A2D] rounded-bl-none"
                    }`}
                    style={!isUser ? { boxShadow: "0 2px 14px rgba(27,67,50,0.05)" } : {}}>
                      {!isUser && (
                        <p className="text-[9px] uppercase tracking-widest text-emerald-600 font-extrabold mb-1.5">
                          AGROOT AI
                        </p>
                      )}
                      <span className="whitespace-pre-wrap">{m.text}</span>
                    </div>

                  </motion.div>
                );
              })}
            </AnimatePresence>

            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start w-full">
                <div className="bg-white/70 backdrop-blur-xl border border-emerald-500/5 p-4 rounded-3xl rounded-bl-none shadow-sm flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Bar & Suggestions Dock */}
        <footer className="flex-none p-5 bg-white border-t border-[#EFEBE3]/60 shadow-[0_-4px_20px_rgba(27,67,50,0.03)] z-10">
          <div className="max-w-4xl mx-auto space-y-4">
            
            {/* Quick Chips suggestions */}
            {messages.length < 3 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide select-none">
                {quickChips.map((q, i) => (
                  <motion.button key={i} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => handleSend(q)}
                    className="px-4 py-2 bg-[#F0F4F1] hover:bg-emerald-50 border border-transparent hover:border-emerald-500/10 text-[#4A7A5A] text-xs font-black rounded-full transition-all whitespace-nowrap cursor-pointer shadow-sm">
                    💡 {q}
                  </motion.button>
                ))}
              </div>
            )}

            {/* Input fields */}
            <div className="relative flex items-center gap-3">
              <input
                type="text"
                className="flex-1 bg-[#F8F9FA] text-emerald-950 font-semibold rounded-2xl px-5 py-4 pr-14 outline-none border border-emerald-500/10 focus:border-emerald-500/30 focus:bg-white transition-all shadow-inner placeholder:text-gray-300 text-sm"
                placeholder={t("chatbot.placeholder") || "Ask Agroot AI about farming, soil, pest control..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />

              <button
                onClick={startListening}
                className={`absolute right-5 p-2 rounded-full transition-all cursor-pointer ${
                  isListening ? "text-red-500 scale-110 animate-pulse bg-red-50" : "text-gray-400 hover:text-emerald-700 hover:bg-gray-50"
                }`}
                title="Voice input"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                  <path d="M19 10v1a7 7 0 0 1-14 0v-1M12 19v4M8 23h8"/>
                </svg>
              </button>

              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={() => handleSend()}
                disabled={!input.trim()}
                className="p-4 bg-[#1B4332] hover:bg-[#145C38] text-white rounded-2xl disabled:opacity-40 disabled:hover:bg-[#1B4332] disabled:cursor-not-allowed transition-all shadow-md shadow-emerald-900/10 cursor-pointer w-12 h-12 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 rotate-45 transform -translate-x-[1px] translate-y-[1px]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/>
                </svg>
              </motion.button>
            </div>

          </div>
        </footer>

      </div>
    </div>
  );
};

export default Chatbot;
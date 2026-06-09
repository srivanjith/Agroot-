import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "../context/AppContext";
import { motion, AnimatePresence } from "framer-motion";

const speak = (text, lang) => {
  if (!window.speechSynthesis) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang === "ta" ? "ta-IN" : "en-IN";
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
};

const startListening = (onResult, lang) => {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Voice not supported in this browser");
    return;
  }
  const recog = new SpeechRecognition();
  recog.lang = lang === "ta" ? "ta-IN" : "en-IN";
  recog.start();
  recog.onresult = (e) => {
    onResult(e.results[0][0].transcript);
  };
};

import { getChatResponse } from "../services/gemini";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // CONTEXT STATE: REGION, SOIL, WEATHER (OFFLINE)
  const region = localStorage.getItem("region") || "tamilnadu";
  const soilType = localStorage.getItem("soil") || "loamy";
  const isRaining = localStorage.getItem("rain") === "yes";

  const messagesEndRef = useRef(null);

  // REGION + WEATHER + SOIL V2 QUICK CHIPS (OFFLINE)
  const month = new Date().getMonth() + 1;
  const season = month >= 6 && month <= 10 ? "kharif" : "rabi";

  let quickChips = [];

  // REGION-BASED CROPS
  if (region === "tamilnadu") {
    quickChips.push(
      season === "kharif" ? "Paddy crop advice" : "Millet crop advice"
    );
  }
  if (region === "kerala") {
    quickChips.push(
      season === "kharif" ? "Rice crop guidance" : "Spices cultivation tips"
    );
  }
  if (region === "north") {
    quickChips.push(
      season === "kharif" ? "Cotton crop tips" : "Wheat crop advice"
    );
  }

  // SOIL-BASED SUGGESTIONS
  if (soilType === "black") {
    quickChips.push("Crops suitable for black soil");
  }
  if (soilType === "red") {
    quickChips.push("Best crops for red soil");
  }
  if (soilType === "loamy") {
    quickChips.push("Loamy soil crop suggestions");
  }

  // WEATHER-AWARE IRRIGATION
  if (!isRaining) {
    quickChips.push("Is irrigation needed today?");
  }

  // COMMON INTENTS
  quickChips.push(
    "Government schemes for farmers",
    "Organic farming methods",
    "Pest control solutions"
  );

  const { language } = useApp();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    setMessages([{ from: "bot", text: t("chatbot.greeting") || "Hello! I am Agroot AI. How can I help you regarding farming?" }]);
  }, [language, t]);

  const [isListening, setIsListening] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "user", text: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const response = await getChatResponse(input);
    setMessages([...newMessages, { role: "model", text: response }]);
    setLoading(false);
  };

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Voice recognition not supported in this browser.");
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (e) => {
      setInput(e.results[0][0].transcript);
    };
    recognition.start();
  };

  return (
    <div className="fixed inset-0 w-full h-[100dvh] bg-green-50 text-gray-800 flex flex-col font-sans">

      {/* Header - Green (Balanced) */}
      <header className="flex-none px-6 py-4 bg-green-700 text-white flex items-center justify-between shadow-md z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => window.history.back()} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
            ←
          </button>
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <span className="text-xl">🤖</span>
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">{t("chatbot.title")}</h1>
            <div className="flex items-center gap-1.5 opacity-80">
              <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
              <span className="text-xs">{t.online}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Messages Area - Light Green Background */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24 scroll-smooth">
        <AnimatePresence initial={false}>
          {messages.map((m, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`flex w-full ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] md:max-w-3xl p-4 rounded-2xl text-sm md:text-base shadow-sm ${m.role === "user"
                  ? "bg-green-600 text-white rounded-br-none"
                  : "bg-white text-gray-800 border border-green-100 rounded-bl-none"
                  }`}
              >
                {m.role === "model" && (
                  <p className="text-[10px] uppercase tracking-widest text-green-600/60 mb-1 font-bold">
                    Agroot AI
                  </p>
                )}
                <span className="leading-relaxed whitespace-pre-wrap">{m.text}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start w-full"
          >
            <div className="bg-white border border-green-100 p-4 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - White with Green Accents */}
      <div className="flex-none bg-white p-4 border-t border-green-100 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)]">

        {/* Quick Chips */}
        {messages.length < 3 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide mb-2"
          >
            {["Weather in my area?", "Best crop for clay soil?", "Rice disease formatting"].map((q, i) => (
              <button
                key={i}
                onClick={() => setInput(q)}
                className="px-4 py-2 bg-green-50 border border-green-200 text-green-700 text-xs rounded-full hover:bg-green-100 transition-colors whitespace-nowrap"
              >
                {q}
              </button>
            ))}
          </motion.div>
        )}

        <div className="relative flex items-center gap-2 max-w-4xl mx-auto">
          <input
            type="text"
            className="flex-1 bg-gray-50 text-gray-800 rounded-full px-6 py-4 pr-12 focus:outline-none focus:ring-2 focus:ring-green-400 border border-transparent focus:bg-white transition-all shadow-inner"
            placeholder={t("chatbot.placeholder")}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />

          <button
            onClick={startListening}
            className={`absolute right-16 p-2 rounded-full transition-colors ${isListening ? "text-red-500 animate-pulse" : "text-gray-400 hover:text-green-600"
              }`}
          >
            🎤
          </button>

          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-4 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:opacity-50 disabled:hover:bg-green-600 transition-all shadow-md hover:shadow-lg transform active:scale-95"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
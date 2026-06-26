import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

// Only show the dock on the main dashboard
const SHOW_ON = ["/home"];

const FloatingDock = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (!SHOW_ON.includes(pathname)) return null;

  return (
    <div className="fixed bottom-6 left-1/2 lg:left-[calc(50%+110px)] -translate-x-1/2 flex flex-col items-center gap-3.5 z-[9990] select-none pointer-events-none">

      {/* Capsule Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.3 }}
        onClick={() => navigate("/chat")}
        className="pointer-events-auto flex items-center gap-1.5 px-5 py-2 rounded-full text-white font-extrabold text-[10px] tracking-[0.16em] shadow-[0_8px_20px_rgba(45,74,62,0.22)] cursor-pointer hover:scale-105 active:scale-95 transition-all border border-emerald-400/20 bg-emerald-800"
      >
        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-4.5 4.5-5 8.5-5 11 0 2.8 2.2 5 5 5s5-2.2 5-5c0-2.5-.5-6.5-5-11z" />
        </svg>
        <span>AGROOT AI +</span>
      </motion.div>

      {/* Floating Dock Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.15 }}
        className="pointer-events-auto h-16 w-[300px] bg-white/95 backdrop-blur-md rounded-[2rem] shadow-[0_12px_40px_-5px_rgba(45,74,62,0.14)] border border-[#EFEBE3] grid grid-cols-3 items-center px-4 relative"
      >
        {/* Calendar */}
        <div className="flex justify-start pl-2">
          <button
            onClick={() => navigate("/calendar")}
            className="flex items-center gap-1.5 text-gray-400 hover:text-emerald-800 active:scale-95 transition-all cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span className="text-xs font-bold">Calendar</span>
          </button>
        </div>

        {/* Center Microphone Button */}
        <div className="flex justify-center relative">
          <div className="relative -mt-6">
            <motion.div
              animate={{ scale: [1, 1.4], opacity: [0.45, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "easeOut" }}
              className="absolute -inset-2 rounded-full border border-emerald-500 pointer-events-none"
            />
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.93 }}
              onClick={() => navigate("/chat")}
              className="relative flex items-center justify-center w-14 h-14 rounded-full shadow-[0_8px_25px_rgba(45,74,62,0.3)] border border-emerald-500/20 bg-emerald-800 cursor-pointer"
            >
              {/* Animated soundwave */}
              <div className="flex items-center gap-[3px] h-5 justify-center">
                <motion.div className="w-[3px] bg-white rounded-full" style={{ height: "6px" }} animate={{ height: [6, 18, 6] }} transition={{ repeat: Infinity, duration: 1.1, ease: "easeInOut" }} />
                <motion.div className="w-[3px] bg-white rounded-full" style={{ height: "16px" }} animate={{ height: [16, 8, 16] }} transition={{ repeat: Infinity, duration: 0.9, ease: "easeInOut" }} />
                <motion.div className="w-[3px] bg-white rounded-full" style={{ height: "12px" }} animate={{ height: [12, 22, 12] }} transition={{ repeat: Infinity, duration: 1.3, ease: "easeInOut" }} />
                <motion.div className="w-[3px] bg-white rounded-full" style={{ height: "8px" }} animate={{ height: [8, 14, 8] }} transition={{ repeat: Infinity, duration: 1.0, ease: "easeInOut" }} />
              </div>
            </motion.button>
          </div>
        </div>

        {/* Profile */}
        <div className="flex justify-end pr-2">
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-1.5 text-gray-400 hover:text-emerald-800 active:scale-95 transition-all cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span className="text-xs font-bold">Profile</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default FloatingDock;

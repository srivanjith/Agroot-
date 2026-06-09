import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";

// Soil DB keyed by state name
const SOIL_DB = {
  "Tamil Nadu": { type: "Red Laterite", ph: 6.4, organic: "Medium", best: "Rice", emoji: "🟥", healthScore: 72 },
  "Kerala": { type: "Laterite", ph: 5.2, organic: "High", best: "Coconut", emoji: "🟫", healthScore: 78 },
  "Karnataka": { type: "Red & Black", ph: 7.0, organic: "Medium", best: "Cotton", emoji: "🟣", healthScore: 74 },
  "Andhra Pradesh": { type: "Black Cotton", ph: 8.0, organic: "Low", best: "Cotton", emoji: "⬛", healthScore: 60 },
  "Telangana": { type: "Red Sandy", ph: 6.5, organic: "Low", best: "Groundnut", emoji: "🟧", healthScore: 55 },
  "Maharashtra": { type: "Regur (Black)", ph: 7.5, organic: "Medium", best: "Soybean", emoji: "⬛", healthScore: 70 },
  "Gujarat": { type: "Alluvial", ph: 7.8, organic: "Medium", best: "Wheat", emoji: "🟨", healthScore: 76 },
  "Rajasthan": { type: "Desert Sandy", ph: 8.2, organic: "Low", best: "Bajra", emoji: "🏜️", healthScore: 48 },
  "Uttar Pradesh": { type: "Alluvial", ph: 7.0, organic: "High", best: "Wheat", emoji: "🟦", healthScore: 88 },
  "Punjab": { type: "Alluvial", ph: 7.5, organic: "High", best: "Wheat", emoji: "🟦", healthScore: 90 },
  "Haryana": { type: "Alluvial", ph: 7.8, organic: "Medium", best: "Sugarcane", emoji: "🟦", healthScore: 80 },
  "West Bengal": { type: "Alluvial", ph: 6.0, organic: "High", best: "Rice", emoji: "🟩", healthScore: 86 },
  "Bihar": { type: "Alluvial", ph: 7.0, organic: "Medium", best: "Maize", emoji: "🟩", healthScore: 78 },
};
const DEFAULT_SOIL = { type: "Alluvial", ph: 7.0, organic: "High", best: "Wheat", emoji: "🟩", healthScore: 82 };

const Home = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [commandOpen, setCommandOpen] = useState(false);

  const addUser = async () => {
    const response = await fetch("http://localhost:5000/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: "Sri",
        email: "sri@example.com"
      })
    });

    const data = await response.json();
    console.log(data);
    alert(data.message);
  };
  const [soilData, setSoilData] = useState(null);
  const [cityName, setCityName] = useState("");
  const [stateName, setStateName] = useState("");
  const [soilLoading, setSoilLoading] = useState(true);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setCommandOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) { setSoilData(DEFAULT_SOIL); setSoilLoading(false); return; }
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await res.json();
          const state = data.address?.state || "";
          const city = data.address?.city || data.address?.town || data.address?.village || "";
          setCityName(city);
          setStateName(state);
          const key = Object.keys(SOIL_DB).find(k =>
            state.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(state.toLowerCase())
          );
          setSoilData(key ? SOIL_DB[key] : DEFAULT_SOIL);
        } catch { setSoilData(DEFAULT_SOIL); }
        finally { setSoilLoading(false); }
      },
      () => { setSoilData(DEFAULT_SOIL); setSoilLoading(false); }
    );
  }, []);

  const healthColor = (score) =>
    score >= 80 ? "#4A7A5A" : score >= 60 ? "#C8972A" : "#C0392B";

  return (
    <div className="min-h-[100dvh] w-full font-sans flex flex-col" style={{ background: "var(--agroot-cream)" }}>

      {/* ── HEADER ── */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-none px-5 pt-10 pb-6 relative overflow-hidden"
        style={{ background: "var(--agroot-forest)" }}
      >
        {/* decorative blobs */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-10" style={{ background: "#fff" }} />
        <div className="absolute bottom-0 left-16 w-32 h-32 rounded-full opacity-5" style={{ background: "#fff" }} />

        {/* top row */}
        <div className="relative z-10 flex items-center justify-between mb-4">
          <button
            onClick={() => setCommandOpen(true)}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
            style={{ background: "rgba(255,255,255,0.12)" }}
          >
            <span className="text-white text-xl">☰</span>
          </button>

          <div className="text-center">
            <h1 className="text-white font-bold text-xl tracking-wide">AGROOT AI</h1>
          </div>

          <button
            onClick={() => window.location.href = "/my-rentals"}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
            style={{ background: "rgba(255,255,255,0.12)" }}
          >
            <span className="text-white text-xl">✕</span>
          </button>
        </div>

        {/* Region + agro zone */}
        <div className="relative z-10 flex items-center justify-center gap-2 mb-5">
          <span className="text-green-300 text-sm">📍</span>
          <span className="text-white text-sm font-medium">
            {stateName || t("home.regionName")}
            {cityName ? ` • ${cityName}` : " • Delta Agro Zone"}
          </span>
          <span className="text-green-300 text-xs">▼</span>
        </div>

        {/* Weather card in header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => navigate("/weather")}
          className="relative z-10 flex items-center justify-between px-5 py-4 rounded-2xl cursor-pointer"
          style={{
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.15)"
          }}
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">🌤</span>
            <div>
              <p className="text-white font-semibold text-base">{t("home.weatherTitle")}</p>
              <p className="text-green-200 text-xs">{t("home.weatherSub")}</p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.2)" }}>
            <span className="text-white text-sm">›</span>
          </div>
        </motion.div>

        {/* carousel dots */}
        <div className="relative z-10 flex justify-center gap-1.5 mt-3">
          {[0, 1, 2].map(i => (
            <div key={i} className={`rounded-full transition-all ${i === 0 ? "w-4 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/30"}`} />
          ))}
        </div>
      </motion.header>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 px-5 py-5 space-y-4 pb-28">

        {/* Test Add User Button */}
        <button 
          onClick={addUser} 
          className="w-full py-3 rounded-2xl font-bold text-white shadow-sm" 
          style={{ background: "var(--agroot-forest)" }}
        >
          Add Test User
        </button>

        {/* Soil Health Card */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => navigate("/soil")}
          className="bg-white rounded-3xl p-5 shadow-sm cursor-pointer group"
          style={{ border: "1px solid var(--agroot-tan-light)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-base" style={{ color: "var(--agroot-forest)" }}>
              🌿 Soil Health
            </h2>
            <button className="text-gray-400 text-lg">•••</button>
          </div>

          {soilLoading ? (
            <div className="h-20 flex items-center justify-center">
              <div className="w-6 h-6 border-2 rounded-full animate-spin"
                style={{ borderColor: "var(--agroot-tan-light)", borderTopColor: "var(--agroot-forest)" }} />
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{soilData?.emoji}</span>
                  <p className="font-bold text-gray-800">{soilData?.type} Soil</p>
                </div>
                <p className="text-xs text-gray-400 mb-3">Detected for your region</p>
                <div className="flex gap-3">
                  <div className="px-3 py-1.5 rounded-xl text-center"
                    style={{ background: "var(--agroot-cream)" }}>
                    <p className="text-[10px] text-gray-400">pH</p>
                    <p className="font-bold text-sm" style={{ color: "var(--agroot-forest)" }}>{soilData?.ph}</p>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl text-center"
                    style={{ background: "var(--agroot-cream)" }}>
                    <p className="text-[10px] text-gray-400">Organic</p>
                    <p className="font-bold text-sm" style={{ color: "#C8972A" }}>{soilData?.organic}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-xs text-gray-400">Best Crop:</span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold text-white"
                    style={{ background: "var(--agroot-forest-mid)" }}>
                    🌱 {soilData?.best}
                  </span>
                </div>
              </div>

              {/* Circular health score */}
              <div className="flex flex-col items-center">
                <div className="relative w-20 h-20">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#E0D9CC" strokeWidth="3" />
                    <circle
                      cx="18" cy="18" r="15.9" fill="none"
                      stroke={healthColor(soilData?.healthScore)}
                      strokeWidth="3"
                      strokeDasharray={`${soilData?.healthScore} 100`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="font-bold text-base" style={{ color: healthColor(soilData?.healthScore) }}>
                      {soilData?.healthScore}%
                    </p>
                    <p className="text-[9px] text-gray-400">Health</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center w-8 h-8 rounded-full group-hover:translate-x-1 transition-transform"
                style={{ background: "var(--agroot-cream)" }}>
                <span style={{ color: "var(--agroot-forest)" }}>›</span>
              </div>
            </div>
          )}
        </motion.section>

        {/* Equipment + Crop Inputs grid */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={() => navigate("/rental")}
            className="bg-white rounded-3xl p-5 shadow-sm cursor-pointer flex flex-col items-center justify-center gap-2"
            style={{ border: "1px solid var(--agroot-tan-light)" }}
          >
            <span className="text-5xl">🚜</span>
            <p className="font-semibold text-sm text-center" style={{ color: "var(--agroot-forest)" }}>
              {t("home.equipment")}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            onClick={() => navigate("/seeds")}
            className="bg-white rounded-3xl p-5 shadow-sm cursor-pointer flex flex-col items-center justify-center gap-2"
            style={{ border: "1px solid var(--agroot-tan-light)" }}
          >
            <span className="text-5xl">🌱</span>
            <p className="font-semibold text-sm text-center" style={{ color: "var(--agroot-forest)" }}>
              {t("home.seeds")}
            </p>
          </motion.div>
        </div>

        {/* More Tools */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-xs uppercase tracking-widest font-semibold mb-3" style={{ color: "var(--agroot-olive)" }}>
            ⚡ More Tools
          </p>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
            {[
              { label: "Satellite View", emoji: "🛰️", sub: "View your field from space", path: "/satellite" },
              { label: "Crop Calendar", emoji: "📅", sub: "Sow & harvest planner", path: "/calendar" },
              { label: "Cost Tracker", emoji: "💰", sub: "Track farming expenses", path: "/costs" },
              { label: "Weather", emoji: "🌤", sub: "Real-time advisory", path: "/weather" },
            ].map((tool, i) => (
              <motion.div
                key={tool.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.55 + i * 0.06 }}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(tool.path)}
                className="flex-none w-40 bg-white rounded-2xl p-4 cursor-pointer shadow-sm"
                style={{ border: "1px solid var(--agroot-tan-light)" }}
              >
                <p className="text-3xl mb-2">{tool.emoji}</p>
                <p className="font-bold text-sm" style={{ color: "var(--agroot-forest)" }}>{tool.label}</p>
                <p className="text-xs mt-0.5 text-gray-400">{tool.sub}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── ASK AGROOT BUTTON ── */}
      <div className="fixed bottom-20 left-0 right-0 flex justify-center z-20 px-5">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          onClick={() => navigate("/chat")}
          className="flex items-center gap-3 px-8 py-4 rounded-full text-white font-bold text-base shadow-xl"
          style={{ background: "var(--agroot-forest)" }}
        >
          <span className="text-2xl">🤖</span>
          {t("home.aiTitle")}
        </motion.button>
      </div>

      {/* ── BOTTOM NAV ── */}
      <div
        className="fixed bottom-0 left-0 right-0 h-16 flex items-center justify-around px-6 z-30"
        style={{
          background: "rgba(255,250,240,0.95)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid var(--agroot-tan-light)"
        }}
      >
        <button onClick={() => navigate("/calendar")} className="flex flex-col items-center gap-1">
          <span className="text-xl">📅</span>
          <span className="text-[10px] text-gray-500">Calendar</span>
        </button>
        <button
          onClick={() => navigate("/chat")}
          className="flex flex-col items-center justify-center w-14 h-14 rounded-full shadow-lg -mt-5"
          style={{ background: "var(--agroot-forest)" }}
        >
          <span className="text-2xl">🎙️</span>
        </button>
        <button onClick={() => navigate("/language")} className="flex flex-col items-center gap-1">
          <span className="text-xl">👤</span>
          <span className="text-[10px] text-gray-500">Profile</span>
        </button>
      </div>

      {/* Command Palette */}
      {commandOpen && (
        <div className="fixed inset-0 flex items-start justify-center pt-28 z-50 px-4"
          style={{ background: "rgba(45,74,62,0.3)", backdropFilter: "blur(8px)" }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6"
            style={{ border: "1px solid var(--agroot-tan-light)" }}
          >
            <div className="flex justify-between items-center mb-4">
              <p className="text-xs font-bold tracking-wider" style={{ color: "var(--agroot-forest)" }}>
                {t("home.commandTitle")}
              </p>
              <button onClick={() => setCommandOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <input autoFocus placeholder={t("home.commandPlaceholder")}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none mb-4"
              style={{
                background: "var(--agroot-cream)",
                border: "1px solid var(--agroot-tan-light)",
                color: "#1A2E1A"
              }} />

            <div className="space-y-1 text-sm text-gray-700">
              {[
                { icon: "🤖", label: t("home.aiTitle"), path: "/chat" },
                { icon: "🌤", label: "View Weather Advisory", path: "/weather" },
                { icon: "🌾", label: t("home.soilTitle"), path: "/soil" },
                { icon: "🚜", label: t("home.equipment"), path: "/rental" },
                { icon: "🧺", label: t("home.seeds"), path: "/seeds" },
              ].map(item => (
                <div
                  key={item.path}
                  onClick={() => { navigate(item.path); setCommandOpen(false); }}
                  className="cursor-pointer p-3 rounded-xl flex items-center gap-3 transition-colors hover:bg-green-50"
                >
                  <span className="text-xl">{item.icon}</span> {item.label}
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 flex justify-between text-[10px] text-gray-400"
              style={{ borderTop: "1px solid var(--agroot-tan-light)" }}>
              <span>Navigate using arrows</span>
              <span>ESC to close</span>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Home;
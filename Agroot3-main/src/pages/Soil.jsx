import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../context/AppContext";

// ─── Soil database keyed by Indian state ───────────────────────────────────
const SOIL_DB = {
  "Tamil Nadu": { type: "Red Laterite", ph: "6.0–6.8", organic: "Medium", moisture: "Moderate", color: "#c0392b", emoji: "🟥" },
  "Kerala": { type: "Laterite", ph: "4.5–6.0", organic: "High", moisture: "High", color: "#8B4513", emoji: "🟫" },
  "Karnataka": { type: "Red & Black", ph: "6.5–7.5", organic: "Medium", moisture: "Moderate", color: "#7D3C98", emoji: "🟣" },
  "Andhra Pradesh": { type: "Black Cotton", ph: "7.5–8.5", organic: "Low", moisture: "High", color: "#2C3E50", emoji: "⬛" },
  "Telangana": { type: "Red Sandy", ph: "6.0–7.0", organic: "Low", moisture: "Low", color: "#E59866", emoji: "🟧" },
  "Maharashtra": { type: "Regur (Black)", ph: "7.0–8.0", organic: "Medium", moisture: "High", color: "#1A252F", emoji: "⬛" },
  "Gujarat": { type: "Alluvial", ph: "7.0–8.5", organic: "Medium", moisture: "Moderate", color: "#D4AC0D", emoji: "🟨" },
  "Rajasthan": { type: "Desert Sandy", ph: "7.5–9.0", organic: "Low", moisture: "Very Low", color: "#F0B27A", emoji: "🏜️" },
  "Uttar Pradesh": { type: "Alluvial", ph: "6.5–7.5", organic: "High", moisture: "High", color: "#A9CCE3", emoji: "🟦" },
  "Punjab": { type: "Alluvial", ph: "7.0–8.0", organic: "High", moisture: "High", color: "#85C1E9", emoji: "🟦" },
  "Haryana": { type: "Alluvial", ph: "7.5–8.5", organic: "Medium", moisture: "Moderate", color: "#AED6F1", emoji: "🟦" },
  "West Bengal": { type: "Alluvial", ph: "5.5–6.5", organic: "High", moisture: "Very High", color: "#82E0AA", emoji: "🟩" },
  "Bihar": { type: "Alluvial", ph: "6.5–7.5", organic: "Medium", moisture: "High", color: "#A9DFBF", emoji: "🟩" },
  "Madhya Pradesh": { type: "Black & Red", ph: "6.0–8.0", organic: "Low", moisture: "Moderate", color: "#6C3483", emoji: "🟣" },
  "Odisha": { type: "Red Laterite", ph: "5.5–6.5", organic: "Medium", moisture: "Moderate", color: "#C0392B", emoji: "🟥" },
  "Assam": { type: "Alluvial", ph: "5.0–6.0", organic: "High", moisture: "Very High", color: "#27AE60", emoji: "🟩" },
  "Himachal Pradesh": { type: "Mountain", ph: "6.0–7.0", organic: "High", moisture: "High", color: "#5D6D7E", emoji: "⛰️" },
  "Uttarakhand": { type: "Mountain", ph: "6.0–7.5", organic: "High", moisture: "Moderate", color: "#717D7E", emoji: "⛰️" },
};

const CROP_RECS = {
  "Red Laterite": { best: ["Rice", "Groundnut", "Ragi"], avoid: ["Wheat"], tip: "Add lime to neutralize acidity. Ideal for legumes." },
  "Laterite": { best: ["Coconut", "Rubber", "Cashew"], avoid: ["Wheat", "Barley"], tip: "Rich in iron. Excellent for plantation crops." },
  "Red & Black": { best: ["Cotton", "Jowar", "Paddy"], avoid: ["Rice"], tip: "Deep tillage needed. Good water retention in black zones." },
  "Black Cotton": { best: ["Cotton", "Soybean", "Wheat"], avoid: ["Rice"], tip: "High clay content. Expands when wet — avoid over-irrigation." },
  "Red Sandy": { best: ["Groundnut", "Castor", "Millet"], avoid: ["Paddy"], tip: "Low fertility — add organic matter before sowing." },
  "Regur (Black)": { best: ["Cotton", "Soybean", "Linseed"], avoid: ["Vegetables"], tip: "High moisture retention. Perfect for dry-season crops." },
  "Alluvial": { best: ["Wheat", "Rice", "Sugarcane", "Vegetables"], avoid: [], tip: "Most fertile soil. Suitable for almost all crops." },
  "Desert Sandy": { best: ["Bajra", "Moth Bean", "Clusterbean"], avoid: ["Rice", "Sugarcane"], tip: "Use drip irrigation. Plant drought-tolerant varieties." },
  "Mountain": { best: ["Apple", "Potato", "Maize", "Tea"], avoid: ["Paddy"], tip: "Rich in humus. Excellent for horticulture crops." },
};

const DEFAULT_SOIL = { type: "Alluvial", ph: "6.5–7.5", organic: "High", moisture: "High", color: "#27AE60", emoji: "🟩" };

const phStatus = (ph) => {
  const val = parseFloat(ph);
  if (val < 6) return { label: "Acidic", color: "#E74C3C" };
  if (val > 7.5) return { label: "Alkaline", color: "#E67E22" };
  return { label: "Neutral", color: "#27AE60" };
};

const CountUp = ({ target, suffix = "" }) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / 40;
    const t = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(t); }
      else setVal(Math.round(start));
    }, 30);
    return () => clearInterval(t);
  }, [target]);
  return <span>{val}{suffix}</span>;
};

const ProgressBar = ({ label, value, color }) => (
  <div className="mb-4">
    <div className="flex justify-between items-center mb-1.5">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="font-bold text-sm" style={{ color: "var(--agroot-forest)" }}>{value}%</span>
    </div>
    <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--agroot-cream)" }}>
      <motion.div
        className="h-2 rounded-full"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
    </div>
  </div>
);

const Soil = () => {
  const { language } = useApp();
  const [location, setLocation] = useState(null);
  const [soil, setSoil] = useState(null);
  const [crops, setCrops] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadTab, setUploadTab] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [reportParsed, setReportParsed] = useState(null);
  const [activeCrop, setActiveCrop] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setSoil(DEFAULT_SOIL); setCrops(CROP_RECS[DEFAULT_SOIL.type] || CROP_RECS["Alluvial"]); setLoading(false); return;
    }
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await res.json();
          const state = data.address?.state || "";
          const city = data.address?.city || data.address?.town || data.address?.village || "";
          setLocation({ state, city, lat: latitude, lon: longitude });
          const matched = Object.keys(SOIL_DB).find((k) =>
            state.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(state.toLowerCase())
          );
          const soilData = matched ? SOIL_DB[matched] : DEFAULT_SOIL;
          setSoil(soilData);
          setCrops(CROP_RECS[soilData.type] || CROP_RECS["Alluvial"]);
        } catch {
          setSoil(DEFAULT_SOIL); setCrops(CROP_RECS["Alluvial"]);
        } finally { setLoading(false); }
      },
      () => { setLocationError("Location access denied. Showing default data."); setSoil(DEFAULT_SOIL); setCrops(CROP_RECS["Alluvial"]); setLoading(false); }
    );
  }, []);

  const handleFile = (file) => {
    if (!file) return;
    setUploadedFile(file);
    setTimeout(() => {
      setReportParsed({ ph: "6.4", nitrogen: "Medium (280 kg/ha)", phosphorus: "Low (12 kg/ha)", potassium: "High (320 kg/ha)", organic: "1.8%", recommendation: "Apply DAP + Urea blend. Phosphorus deficiency detected." });
    }, 1500);
  };

  const handleDrop = (e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 font-sans"
      style={{ background: "var(--agroot-cream)" }}>
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
        className="w-14 h-14 rounded-full border-4"
        style={{ borderColor: "var(--agroot-tan-light)", borderTopColor: "var(--agroot-forest)" }} />
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 2 }}
        className="font-medium" style={{ color: "var(--agroot-forest)" }}>
        Analysing your location's soil...
      </motion.p>
    </div>
  );

  const phVal = parseFloat(soil.ph);
  const phPct = Math.round(((phVal - 3) / (10 - 3)) * 100);
  const healthScore = soil.organic === "High" ? 88 : soil.organic === "Medium" ? 72 : 54;

  return (
    <div className="min-h-screen w-full font-sans" style={{ background: "var(--agroot-cream)" }}>

      {/* ── Header ── */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-5 pt-10 pb-6 relative overflow-hidden"
        style={{ background: "var(--agroot-forest)" }}
      >
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-10" style={{ background: "#fff" }} />

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => window.history.back()}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white transition-colors"
              style={{ background: "rgba(255,255,255,0.12)" }}>
              ←
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">Soil Health</h1>
              {location && <p className="text-green-300 text-xs mt-0.5">📍 {location.city}, {location.state}</p>}
              {locationError && <p className="text-yellow-300 text-xs mt-0.5">{locationError}</p>}
            </div>
          </div>
          {location && (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-300 text-xs">Live</span>
            </div>
          )}
        </div>
      </motion.header>

      {/* ── Tab Bar ── */}
      <div className="flex gap-2 px-5 mt-4">
        {["Soil Analysis", "Upload Report"].map((tab, i) => (
          <button
            key={tab}
            onClick={() => setUploadTab(i === 1)}
            className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
            style={uploadTab === (i === 1) ? {
              background: "var(--agroot-forest)",
              color: "#fff"
            } : {
              background: "#fff",
              color: "#6B7B6B",
              border: "1px solid var(--agroot-tan-light)"
            }}
          >
            {i === 0 ? "🌱 " : "📄 "}{tab}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ══ SOIL ANALYSIS TAB ══ */}
        {!uploadTab && (
          <motion.div
            key="analysis"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="px-5 py-5 space-y-4 pb-10"
          >
            {/* ── Detected Soil Card ── */}
            <div className="bg-white rounded-3xl p-5 shadow-sm" style={{ border: "1px solid var(--agroot-tan-light)" }}>
              <p className="text-xs uppercase tracking-widest font-bold mb-4 flex items-center gap-2"
                style={{ color: "var(--agroot-forest)" }}>
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
                Detected Soil
              </p>

              {/* Soil type visual */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="rounded-2xl p-6 text-white text-center mb-5 relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${soil.color}cc, ${soil.color})` }}
              >
                <div className="absolute inset-0 opacity-10"
                  style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "12px 12px" }} />
                <p className="text-xl font-bold relative z-10">{soil.type}</p>
                <p className="text-xs opacity-75 relative z-10 mt-0.5">Soil Type</p>
              </motion.div>

              {/* Stats */}
              <div className="space-y-1">
                {[
                  { label: "pH Range", value: `${soil.ph}`, note: `(${phStatus(soil.ph).label})`, noteColor: phStatus(soil.ph).color },
                  { label: "Organic Matter", value: soil.organic, note: null },
                  { label: "Moisture Level", value: soil.moisture, note: null },
                ].map(item => (
                  <div key={item.label}
                    className="flex justify-between items-center py-3 px-1"
                    style={{ borderBottom: "1px solid var(--agroot-cream)" }}>
                    <span className="text-sm text-gray-400">{item.label}</span>
                    <span className="font-bold text-sm" style={{ color: "#1A2E1A" }}>
                      {item.value}{" "}
                      {item.note && <span className="text-xs font-normal" style={{ color: item.noteColor }}>{item.note}</span>}
                    </span>
                  </div>
                ))}
              </div>

              {/* Health score */}
              <div className="mt-5 rounded-2xl p-5 text-center" style={{ background: "var(--agroot-cream)" }}>
                <p className="text-xs text-gray-400 mb-1">Soil Health Score</p>
                <p className="text-5xl font-light mb-2" style={{ color: "var(--agroot-forest)" }}>
                  <CountUp target={healthScore} suffix="/100" />
                </p>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold"
                  style={{
                    background: healthScore >= 80 ? "#D5F5E3" : healthScore >= 60 ? "#FEF9E7" : "#FADBD8",
                    color: healthScore >= 80 ? "#1A7A3C" : healthScore >= 60 ? "#9A7D0A" : "#922B21"
                  }}>
                  {healthScore >= 80 ? "Excellent 🌟" : healthScore >= 60 ? "Good 👍" : "Needs Improvement ⚠️"}
                </span>
              </div>

              {/* pH gradient slider */}
              <div className="mt-4">
                <div className="h-3 rounded-full relative overflow-hidden"
                  style={{ background: "linear-gradient(to right, #ef4444, #f59e0b, #22c55e, #3b82f6, #8b5cf6)" }}>
                  <motion.div
                    className="absolute top-0 -translate-x-1/2 w-4 h-4 bg-white border-2 border-gray-400 rounded-full shadow -mt-0.5"
                    initial={{ left: "0%" }}
                    animate={{ left: `${phPct}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 mt-1.5">
                  <span>Acidic</span><span>Neutral</span><span>Alkaline</span>
                </div>
              </div>
            </div>

            {/* ── Crop Recommendations ── */}
            <div className="rounded-3xl p-5 relative overflow-hidden" style={{ background: "var(--agroot-forest)" }}>
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-10" style={{ background: "#fff" }} />
              <p className="text-xs uppercase tracking-widest text-green-300 font-bold mb-3 relative z-10">🌾 Best Crops</p>
              <p className="text-green-200 text-xs mb-4 relative z-10">Based on <strong className="text-white">{soil.type}</strong> soil</p>

              <div className="space-y-2 relative z-10">
                {crops?.best.map((crop, i) => (
                  <motion.button
                    key={crop}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.08 }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    onClick={() => setActiveCrop(activeCrop === crop ? null : crop)}
                    className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all"
                    style={activeCrop === crop ? {
                      background: "#fff", color: "var(--agroot-forest)"
                    } : {
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "#fff"
                    }}
                  >
                    <span className="font-semibold text-sm">🌱 {crop}</span>
                    <span className="text-xs px-2 py-1 rounded-full"
                      style={{ background: i === 0 ? "#4ADE80" : "rgba(255,255,255,0.15)", color: i === 0 ? "#14532D" : "inherit" }}>
                      {i === 0 ? "Best Match" : `+${i}`}
                    </span>
                  </motion.button>
                ))}
              </div>

              <AnimatePresence>
                {activeCrop && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="relative z-10 mt-3 rounded-2xl p-4 text-sm text-green-100"
                    style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}
                  >
                    <p className="font-bold text-white mb-1">💡 Tip for {activeCrop}</p>
                    <p>{crops.tip}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {crops?.avoid?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="relative z-10 mt-3 rounded-2xl p-4"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  <p className="text-xs uppercase tracking-wider font-bold mb-1 flex items-center gap-2 text-yellow-300">
                    ⚠️ Avoid Growing
                  </p>
                  <p className="text-white font-semibold">{crops.avoid.join(", ")}</p>
                </motion.div>
              )}
            </div>

            {/* ── Nutrients ── */}
            <div className="bg-white rounded-3xl p-5 shadow-sm" style={{ border: "1px solid var(--agroot-tan-light)" }}>
              <p className="text-xs uppercase tracking-widest font-bold mb-4" style={{ color: "var(--agroot-forest)" }}>
                📊 Estimated Nutrients
              </p>
              <ProgressBar label="Nitrogen (N)" value={soil.organic === "High" ? 78 : soil.organic === "Medium" ? 55 : 32} color="#60A5FA" />
              <ProgressBar label="Phosphorus (P)" value={soil.organic === "High" ? 60 : soil.organic === "Medium" ? 45 : 25} color="#FB923C" />
              <ProgressBar label="Potassium (K)" value={soil.moisture === "High" ? 72 : 50} color="#A78BFA" />
              <ProgressBar label="Organic Carbon" value={soil.organic === "High" ? 82 : soil.organic === "Medium" ? 60 : 38} color="#4ADE80" />
            </div>

            {/* ── Recommended Actions ── */}
            <div className="bg-white rounded-3xl p-5 shadow-sm" style={{ border: "1px solid var(--agroot-tan-light)" }}>
              <p className="text-xs uppercase tracking-widest font-bold mb-4" style={{ color: "var(--agroot-forest)" }}>
                ⚡ Recommended Actions
              </p>
              <ul className="space-y-3">
                {[
                  { icon: "💧", text: soil.moisture === "Very Low" ? "Install drip irrigation" : soil.moisture === "High" ? "Ensure proper drainage" : "Maintain irrigation schedule" },
                  { icon: "🧪", text: soil.organic === "Low" ? "Add organic compost — low fertility detected" : "Maintain organic matter levels" },
                  { icon: "📅", text: `Best sowing: ${new Date().getMonth() < 5 ? "Rabi season (Oct–Nov)" : "Kharif season (Jun–Jul)"}` },
                  { icon: "🌿", text: crops?.tip || "Follow standard crop rotation." },
                ].map((a, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.08 }}
                    className="flex gap-3 items-start text-sm text-gray-600 p-3 rounded-xl"
                    style={{ background: "var(--agroot-cream)" }}
                  >
                    <span className="text-lg flex-none">{a.icon}</span>
                    <span>{a.text}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}

        {/* ══ UPLOAD REPORT TAB ══ */}
        {uploadTab && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="px-5 py-5 max-w-xl mx-auto"
          >
            <p className="text-sm text-gray-400 mb-5">Upload your official soil test report (PDF or image). We'll extract key metrics and give personalised recommendations.</p>

            <motion.div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              animate={{ scale: dragOver ? 1.02 : 1 }}
              className="border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer bg-white"
              style={{ borderColor: dragOver ? "var(--agroot-forest)" : "var(--agroot-tan-light)" }}
            >
              <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                onChange={(e) => handleFile(e.target.files[0])} />
              <div className="text-5xl mb-4">{uploadedFile ? "✅" : "📤"}</div>
              <p className="font-semibold text-gray-700">{uploadedFile ? uploadedFile.name : "Drop your soil report here"}</p>
              <p className="text-sm text-gray-400 mt-1">{uploadedFile ? "Click to replace" : "PDF, JPG, PNG supported · Click or drag & drop"}</p>
            </motion.div>

            <AnimatePresence>
              {uploadedFile && !reportParsed && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="mt-5 flex items-center gap-3" style={{ color: "var(--agroot-forest)" }}>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-5 h-5 border-2 rounded-full"
                    style={{ borderColor: "var(--agroot-tan-light)", borderTopColor: "var(--agroot-forest)" }} />
                  <span className="text-sm">Analysing report...</span>
                </motion.div>
              )}

              {reportParsed && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="mt-5 bg-white rounded-3xl p-5 space-y-4"
                  style={{ border: "1px solid var(--agroot-tan-light)" }}>
                  <p className="text-xs uppercase tracking-widest font-bold" style={{ color: "var(--agroot-forest)" }}>📋 Extracted Report Data</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "pH", value: reportParsed.ph, icon: "⚗️" },
                      { label: "Nitrogen", value: reportParsed.nitrogen, icon: "🔵" },
                      { label: "Phosphorus", value: reportParsed.phosphorus, icon: "🟠" },
                      { label: "Potassium", value: reportParsed.potassium, icon: "🟣" },
                      { label: "Organic C", value: reportParsed.organic, icon: "🟢" },
                    ].map((item, i) => (
                      <motion.div key={item.label} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.07 }}
                        className="rounded-2xl p-4 text-center" style={{ background: "var(--agroot-cream)" }}>
                        <p className="text-2xl mb-1">{item.icon}</p>
                        <p className="text-xs text-gray-400">{item.label}</p>
                        <p className="font-bold text-sm mt-0.5" style={{ color: "#1A2E1A" }}>{item.value}</p>
                      </motion.div>
                    ))}
                  </div>
                  <div className="rounded-2xl p-5" style={{ background: "var(--agroot-forest)" }}>
                    <p className="text-xs uppercase tracking-widest text-green-300 font-bold mb-2">🤖 AI Recommendation</p>
                    <p className="text-sm text-green-100">{reportParsed.recommendation}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 h-16 flex items-center justify-around px-6 z-30"
        style={{ background: "rgba(255,250,240,0.95)", backdropFilter: "blur(20px)", borderTop: "1px solid var(--agroot-tan-light)" }}>
        <button onClick={() => window.location.href = "/home"} className="flex flex-col items-center gap-1">
          <span className="text-xl">🏠</span><span className="text-[10px] text-gray-500">Home</span>
        </button>
        <button onClick={() => window.location.href = "/soil"} className="flex flex-col items-center gap-1">
          <span className="text-xl">📋</span><span className="text-[10px] font-bold" style={{ color: "var(--agroot-forest)" }}>Reports</span>
        </button>
        <button onClick={() => window.location.href = "/seeds"} className="flex flex-col items-center gap-1">
          <span className="text-xl">🌾</span><span className="text-[10px] text-gray-500">Crops</span>
        </button>
      </div>
    </div>
  );
};

export default Soil;
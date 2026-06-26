import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import fieldMap from "../assets/field_map.png";
import weatherBg from "../assets/weather_bg.png";

// Soil DB keyed by state name
const SOIL_DB = {
  "Tamil Nadu": { type: "Red Laterite", ph: 6.4, organic: "Medium", organicPct: 2.1, best: "Rice", emoji: "🟥", healthScore: 72 },
  "Kerala": { type: "Laterite", ph: 5.2, organic: "High", organicPct: 3.4, best: "Coconut", emoji: "🟫", healthScore: 78 },
  "Karnataka": { type: "Red & Black", ph: 7.0, organic: "Medium", organicPct: 2.5, best: "Cotton", emoji: "🟣", healthScore: 74 },
  "Andhra Pradesh": { type: "Black Cotton", ph: 8.0, organic: "Low", organicPct: 1.2, best: "Cotton", emoji: "⬛", healthScore: 60 },
  "Telangana": { type: "Red Sandy", ph: 6.5, organic: "Low", organicPct: 1.5, best: "Groundnut", emoji: "🟧", healthScore: 55 },
  "Maharashtra": { type: "Regur (Black)", ph: 7.5, organic: "Medium", organicPct: 2.2, best: "Soybean", emoji: "⬛", healthScore: 70 },
  "Gujarat": { type: "Alluvial", ph: 7.8, organic: "Medium", organicPct: 2.4, best: "Wheat", emoji: "🟨", healthScore: 76 },
  "Rajasthan": { type: "Desert Sandy", ph: 8.2, organic: "Low", organicPct: 0.9, best: "Bajra", emoji: "🏜️", healthScore: 48 },
  "Uttar Pradesh": { type: "Alluvial", ph: 7.0, organic: "High", organicPct: 2.9, best: "Wheat", emoji: "🟦", healthScore: 88 },
  "Punjab": { type: "Alluvial", ph: 7.5, organic: "High", organicPct: 3.1, best: "Wheat", emoji: "🟦", healthScore: 90 },
  "Haryana": { type: "Alluvial", ph: 7.8, organic: "Medium", organicPct: 2.6, best: "Sugarcane", emoji: "🟦", healthScore: 80 },
  "West Bengal": { type: "Alluvial", ph: 6.0, organic: "High", organicPct: 3.0, best: "Rice", emoji: "🟩", healthScore: 86 },
  "Bihar": { type: "Alluvial", ph: 7.0, organic: "Medium", organicPct: 2.3, best: "Maize", emoji: "🟩", healthScore: 78 },
};
const DEFAULT_SOIL = { type: "Alluvial", ph: 7.0, organic: "High", organicPct: 2.8, best: "Wheat", emoji: "🟩", healthScore: 82 };

const DEFAULT_FIELDS = [
  {
    id: 1,
    cropName: "Rice Paddy",
    cropIcon: "🌾",
    yieldProgress: "78.2%",
    moisture: "82%",
    countLabel: "Hectares",
    countVal: "12",
    temp: "28°C",
    nextIrrigation: "Today • 18:00",
    filterClass: "hue-rotate-[45deg] saturate-[1.2]"
  },
  {
    id: 2,
    cropName: "Apple Orchard",
    cropIcon: "🍏",
    yieldProgress: "51.4%",
    moisture: "64%",
    countLabel: "Trees",
    countVal: "8,900",
    temp: "30°C",
    nextIrrigation: "Today • 01:30",
    filterClass: ""
  },
  {
    id: 3,
    cropName: "Vineyard",
    cropIcon: "🍇",
    yieldProgress: "65.8%",
    moisture: "45%",
    countLabel: "Vines",
    countVal: "4,500",
    temp: "32°C",
    nextIrrigation: "Tomorrow • 08:00",
    filterClass: "hue-rotate-[120deg] brightness-[0.9]"
  },
  {
    id: 4,
    cropName: "Maize Crop",
    cropIcon: "🌽",
    yieldProgress: "42.1%",
    moisture: "58%",
    countLabel: "Rows",
    countVal: "320",
    temp: "31°C",
    nextIrrigation: "Today • 21:00",
    filterClass: "hue-rotate-[-30deg] brightness-[1.05]"
  },
  {
    id: 5,
    cropName: "Citrus Grove",
    cropIcon: "🍊",
    yieldProgress: "89.5%",
    moisture: "70%",
    countLabel: "Trees",
    countVal: "6,200",
    temp: "29°C",
    nextIrrigation: "Tomorrow • 06:30",
    filterClass: "hue-rotate-[180deg] saturate-[1.5]"
  }
];

const renderSidebarIcon = (label, isActive) => {
  switch (label) {
    case "Dashboard":
      return (
        <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
        </svg>
      );
    case "Fields":
      return (
        <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2.5" />
          <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
        </svg>
      );
    case "Crops":
      return (
        <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2C6.5 2 2 6.5 2 12c0 3.5 1.8 6.6 4.5 8.5.3.2.7.2 1-.1L19.7 8.2c.3-.3.3-.7.1-1C17.6 3.8 14.5 2 12 2z" />
          <path d="M12 2v20M2 12h20" strokeDasharray="1.5 1.5" />
        </svg>
      );
    case "Crop Tracker":
      return (
        <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      );
    case "Rentals":
      return (
        <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="7" cy="17" r="2" />
          <circle cx="17" cy="17" r="2" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      );
    case "Alerts":
      return (
        <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      );
    case "Reports":
      return (
        <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      );
    case "Profile":
      return (
        <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    default:
      return null;
  }
};

const Home = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [commandOpen, setCommandOpen] = useState(false);

  const [soilData, setSoilData] = useState(null);
  const [cityName, setCityName] = useState("");
  const [stateName, setStateName] = useState("");
  const [soilLoading, setSoilLoading] = useState(true);
  
  // Real-time weather states in header
  const [currentTemp, setCurrentTemp] = useState(32);
  const [weatherSub, setWeatherSub] = useState("Weather systems nominal");

  // Fields dropdown and selected field
  const [fieldsList, setFieldsList] = useState(() => {
    const saved = localStorage.getItem("agroot_fields_list");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return DEFAULT_FIELDS;
  });

  const [selectedFieldId, setSelectedFieldId] = useState(() => {
    const saved = localStorage.getItem("agroot_fields_list");
    let currentFields = DEFAULT_FIELDS;
    if (saved) {
      try { currentFields = JSON.parse(saved); } catch (e) {}
    }
    const hasField2 = currentFields.some(f => f.id === 2);
    return hasField2 ? 2 : (currentFields[0]?.id || 1);
  });
  const [fieldsDropdownOpen, setFieldsDropdownOpen] = useState(false);

  const [fieldNames, setFieldNames] = useState(() => {
    const saved = localStorage.getItem("agroot_field_names");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return {
      1: "Rice Paddy",
      2: "Apple Orchard",
      3: "Vineyard",
      4: "Maize Crop",
      5: "Citrus Grove"
    };
  });

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");

  const handleSaveFieldName = () => {
    if (!tempName.trim()) return;
    const updated = {
      ...fieldNames,
      [selectedFieldId]: tempName.trim()
    };
    setFieldNames(updated);
    localStorage.setItem("agroot_field_names", JSON.stringify(updated));
    setIsEditingName(false);
  };

  const currentField = fieldsList.find(f => f.id === selectedFieldId) || fieldsList[0] || DEFAULT_FIELDS[0];

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
    if (!navigator.geolocation) {
      setSoilData(DEFAULT_SOIL);
      setSoilLoading(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      if (soilLoading) {
        setSoilData(DEFAULT_SOIL);
        setSoilLoading(false);
      }
    }, 3500);

    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          // Geocode coordinates
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`, {
            signal: AbortSignal.timeout(3000)
          });
          const data = await res.json();
          const state = data.address?.state || "";
          const city = data.address?.city || data.address?.town || data.address?.village || "";
          setCityName(city);
          setStateName(state);
          const key = Object.keys(SOIL_DB).find(k =>
            state.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(state.toLowerCase())
          );
          setSoilData(key ? SOIL_DB[key] : DEFAULT_SOIL);

          // Fetch local live weather temp
          const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code`, {
            signal: AbortSignal.timeout(2000)
          });
          const weatherData = await weatherRes.json();
          if (weatherData && weatherData.current) {
            setCurrentTemp(Math.round(weatherData.current.temperature_2m));
            const code = weatherData.current.weather_code;
            if (code >= 51) setWeatherSub("Rainfall systems active");
            else if (code >= 1 && code <= 3) setWeatherSub("Partial cloud systems");
            else setWeatherSub("Weather systems nominal");
          }
        } catch {
          setSoilData(DEFAULT_SOIL);
        } finally {
          clearTimeout(timeoutId);
          setSoilLoading(false);
        }
      },
      () => {
        clearTimeout(timeoutId);
        setSoilData(DEFAULT_SOIL);
        setSoilLoading(false);
      },
      { enableHighAccuracy: false, timeout: 3000 }
    );

    return () => clearTimeout(timeoutId);
  }, []);

  const healthColor = (score) =>
    score >= 80 ? "#2D4A3E" : score >= 60 ? "#C8972A" : "#C0392B";

  // Sidebar navigation items
  const sidebarItems = [
    { label: "Dashboard", active: true },
    { label: "Fields", path: "/satellite" },
    { label: "Crops", path: "/seeds" },
    { label: "Crop Tracker", path: "/costs" },
    { label: "Rentals", path: "/rental" },
    { label: "Alerts", path: "/alerts" },
    { label: "Reports", path: "/profile" },
    { label: "Profile", path: "/profile" }
  ];

  return (
    <div className="min-h-screen w-full font-sans flex bg-[#F8F9FA] text-[#1A2E1A] overflow-hidden">
      
      {/* ── LEFT SIDEBAR (WIDESCREEN ONLY) ── */}
      <aside className="hidden lg:flex flex-col w-[220px] h-screen bg-white border-r border-[#EFEBE3] p-4 shrink-0 z-20 select-none">
        <div className="flex flex-col h-full justify-between">
          <div>
            {/* Logo */}
            <div className="flex flex-col items-center justify-center pt-2 pb-6 border-b border-[#EFEBE3]/60 w-full gap-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50/50 border border-emerald-500/10 flex items-center justify-center shadow-sm">
                <svg className="w-8 h-8 text-emerald-600" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3c-4.5 4.5-5 8.5-5 11 0 2.8 2.2 5 5 5s5-2.2 5-5c0-2.5-.5-6.5-5-11z" fill="#10B981" fillOpacity="0.25" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 21V10" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M12 14c1.5-1 2.5-2.5 2.5-4" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M12 17c-1.5-1-2.5-2.5-2.5-4" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
              <span className="font-extrabold text-[12px] tracking-[0.18em] text-emerald-950 uppercase mt-1">AGROOT AI</span>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-1.5 mt-5">
              {sidebarItems.map(item => {
                const isActive = item.active;
                return (
                  <button
                    key={item.label}
                    onClick={() => item.path && navigate(item.path)}
                    className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-[12px] font-extrabold tracking-wide transition-all duration-300 ${
                      isActive 
                        ? "bg-emerald-50 text-emerald-900 border border-emerald-500/10 shadow-sm shadow-emerald-500/5" 
                        : "text-gray-400 hover:text-emerald-950 hover:bg-gray-50/50"
                    }`}
                  >
                    <span className={`shrink-0 transition-colors ${isActive ? "text-emerald-600" : "text-gray-400"}`}>
                      {renderSidebarIcon(item.label, isActive)}
                    </span>
                    <span>{t(`sidebar.${item.label.toLowerCase().replace(/\s+/g, "")}`, item.label)}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* AGROOT AI Dock — embedded in sidebar bottom */}
          <div className="mt-auto border-t border-[#EFEBE3]/60 pt-4 pb-2 flex flex-col items-center gap-3">
            {/* Capsule */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate("/chat")}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-full bg-emerald-800 text-white text-[10px] font-extrabold tracking-[0.14em] shadow-md shadow-emerald-900/20 cursor-pointer border border-emerald-700/40"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-4.5 4.5-5 8.5-5 11 0 2.8 2.2 5 5 5s5-2.2 5-5c0-2.5-.5-6.5-5-11z" />
              </svg>
              AGROOT AI +
            </motion.button>

            {/* Mic button */}
            <div className="relative flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.5], opacity: [0.4, 0] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: "easeOut" }}
                className="absolute inset-0 rounded-full border border-emerald-500 pointer-events-none"
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => navigate("/chat")}
                className="w-12 h-12 rounded-full bg-emerald-800 flex items-center justify-center shadow-lg shadow-emerald-900/25 border border-emerald-600/30 cursor-pointer"
              >
                <div className="flex items-center gap-[2.5px] h-4">
                  <motion.div className="w-[2.5px] bg-white rounded-full" style={{ height: 5 }} animate={{ height: [5, 14, 5] }} transition={{ repeat: Infinity, duration: 1.1, ease: "easeInOut" }} />
                  <motion.div className="w-[2.5px] bg-white rounded-full" style={{ height: 12 }} animate={{ height: [12, 6, 12] }} transition={{ repeat: Infinity, duration: 0.9, ease: "easeInOut" }} />
                  <motion.div className="w-[2.5px] bg-white rounded-full" style={{ height: 9 }} animate={{ height: [9, 18, 9] }} transition={{ repeat: Infinity, duration: 1.3, ease: "easeInOut" }} />
                  <motion.div className="w-[2.5px] bg-white rounded-full" style={{ height: 6 }} animate={{ height: [6, 11, 6] }} transition={{ repeat: Infinity, duration: 1.0, ease: "easeInOut" }} />
                </div>
              </motion.button>
            </div>

            <span className="text-[9px] text-gray-400 font-bold tracking-wider uppercase">v1.2.0</span>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT WORKSPACE ── */}
      <div className="flex-1 h-screen overflow-y-auto flex flex-col z-10 relative">
        
        {/* Main Content Area */}
        <main className="p-5 lg:p-8 space-y-6 pb-48 max-w-7xl mx-auto w-full">

          {/* ── HEADER BANNER ── */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full rounded-[2.2rem] p-6 lg:px-8 lg:py-7 text-[#0a2315] flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-sm border border-[#EFEBE3]/30"
            style={{ 
              backgroundImage: `url(${weatherBg})`,
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}
          >
            {/* White-wash glass overlay for text legibility */}
            <div className="absolute inset-0 bg-white/15 backdrop-blur-[2px] pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-transparent pointer-events-none" />
            
            {/* Left side: Weather widget */}
            <div className="flex flex-col gap-4 cursor-pointer z-10" onClick={() => navigate("/weather")}>
              <div className="flex items-center gap-4">
                <div className="relative w-14 h-14 shrink-0 overflow-hidden bg-white/50 rounded-2xl flex items-center justify-center border border-white/60 shadow-inner backdrop-blur-sm">
                  {/* Sun */}
                  <motion.svg 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute w-8 h-8 text-amber-500 -top-1.5 -left-1.5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0-5a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1zm0 15a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1zM4.22 4.22a1 1 0 0 1 1.42 0l1.41 1.41a1 1 0 1 1-1.41 1.42L4.22 5.64a1 1 0 0 1 0-1.42zm12.73 12.73a1 1 0 0 1 1.41 0l1.42 1.41a1 1 0 1 1-1.42 1.42l-1.41-1.42a1 1 0 0 1 0-1.41zM2 12a1 1 0 0 1 1-1h2a1 1 0 1 1 0 2H3a1 1 0 0 1-1-1zm15 0a1 1 0 0 1 1-1h2a1 1 0 1 1 0 2h-2a1 1 0 0 1-1-1zM5.64 19.78a1 1 0 0 1 0-1.42l1.41-1.41a1 1 0 1 1 1.42 1.41l-1.42 1.42a1 1 0 0 1-1.41 0zm12.73-12.73a1 1 0 0 1 0-1.41l1.41-1.42a1 1 0 1 1 1.42 1.42l-1.42 1.41a1 1 0 0 1-1.41 0z" />
                  </motion.svg>
                  {/* Cloud */}
                  <motion.svg 
                    animate={{ x: [-1.5, 1.5, -1.5], y: [-0.5, 0.5, -0.5] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute w-10 h-10 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)] bottom-1 right-1"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M19.36 10.04a6 6 0 0 0-11.36-1.58 5 5 0 0 0-3.75 4.88c0 2.76 2.24 5 5 5h10a4 4 0 0 0 4-4 4 4 0 0 0-3.89-4.3z" />
                  </motion.svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-2xl lg:text-3.5xl text-emerald-950 tracking-tight">{currentTemp}°C</span>
                    <span className="text-emerald-950/20 select-none">|</span>
                    <span className="font-extrabold text-sm lg:text-base text-emerald-900">{t("home.stableClimate", "Stable Climate")}</span>
                  </div>
                  <p className="text-[11px] text-emerald-900/60 font-bold mt-0.5">{weatherSub}</p>
                </div>
              </div>
              
              {/* Weather parameters matching mockup */}
              <div className="flex flex-wrap gap-2 text-[10px] font-extrabold text-emerald-950">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/40 border border-white/50 backdrop-blur-md shadow-sm">
                  <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 22a7 7 0 0 0 7-7c0-4.3-7-13-7-13S5 10.7 5 15a7 7 0 0 0 7 7z" />
                  </svg>
                  <span>Humidity 64%</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/40 border border-white/50 backdrop-blur-md shadow-sm">
                  <svg className="w-3.5 h-3.5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
                  </svg>
                  <span>Wind 12 km/h</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/40 border border-white/50 backdrop-blur-md shadow-sm">
                  <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 20v2m4-2v2m4-2v2" />
                  </svg>
                  <span>Rain Chance 10%</span>
                </div>
              </div>
            </div>

            {/* Center: Slide indicator dots inside a mockup-styled bottom tab */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#F8F9FA] px-5 py-1.5 rounded-t-2xl flex gap-1.5 shadow-[0_-2px_6px_rgba(0,0,0,0.02)] border-t border-x border-[#EFEBE3] z-10">
              <span className="w-5 h-1.5 rounded-full bg-emerald-700" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-700/30" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-700/30" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-700/30" />
            </div>

            {/* Right side: Location & Notifications */}
            <div className="flex items-center gap-3.5 z-10">
              {/* Location pill */}
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/50 border border-white/60 shadow-sm backdrop-blur-sm">
                <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <div className="text-left">
                  <p className="font-extrabold text-[11px] text-emerald-950 leading-none">{cityName || "Coimbatore"}, {stateName || "Tamil Nadu"}</p>
                  <p className="text-[8px] text-emerald-900/60 font-bold mt-1 leading-none">{t("home.updatedTime", "Updated 10 min ago")}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  className="w-11 h-11 rounded-full bg-white border border-gray-100 flex items-center justify-center relative shadow-sm hover:bg-gray-50 active:scale-95 transition-all"
                >
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  <span className="absolute top-3 right-3.5 w-2 h-2 rounded-full bg-emerald-600 ring-2 ring-white" />
                </motion.button>
              </div>
            </div>
          </motion.header>

          {/* ── ROW 1: Soil Health & Field Map ── */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            
            {/* 1.1 Soil Health Card */}
            <motion.section 
              whileHover={{ y: -2 }}
              className="xl:col-span-5 bg-white rounded-[2.2rem] p-6 shadow-sm border border-[#EFEBE3] flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-4.5 4.5-5 8.5-5 11 0 2.8 2.2 5 5 5s5-2.2 5-5c0-2.5-.5-6.5-5-11z" />
                    </svg>
                    <h3 className="font-extrabold text-[15px] tracking-tight text-emerald-950">{t("home.soilHealth", "Soil Health")}</h3>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="5" r="1.5" />
                      <circle cx="12" cy="12" r="1.5" />
                      <circle cx="12" cy="19" r="1.5" />
                    </svg>
                  </button>
                </div>

                {soilLoading ? (
                  <div className="h-44 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-600 rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Top block: soil details + circular percentage */}
                    <div className="flex justify-between items-center gap-4">
                      <div className="flex items-center gap-4">
                        {/* Wavy soil layers graphic badge using inline SVG */}
                        <div className="w-14 h-14 shrink-0 rounded-2xl bg-[#E8F5E9]/50 border border-emerald-500/10 flex items-center justify-center shadow-inner overflow-hidden relative">
                          <svg className="w-full h-full" viewBox="0 0 56 56" fill="none">
                            <path d="M0 24C10 21 18 27 28 24C38 21 46 27 56 24V56H0V24Z" fill="#81C784" />
                            <path d="M0 34C10 31 18 37 28 34C38 31 46 37 56 34V56H0V34Z" fill="#4CAF50" />
                            <path d="M0 44C10 41 18 47 28 44C38 41 46 47 56 44V56H0V44Z" fill="#2E7D32" />
                          </svg>
                        </div>
                        <div className="flex flex-col gap-1">
                          <h4 className="font-black text-[16px] text-emerald-950 tracking-tight leading-tight">{soilData?.type || "Alluvial"} Soil</h4>
                          <p className="text-[11px] text-gray-400 font-bold">Detected for your region</p>
                        </div>
                      </div>

                      {/* Circular Gauge */}
                      <div className="relative w-16 h-16 shrink-0">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#F4F6F4" strokeWidth="2.8" />
                          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#2E7D32" strokeWidth="3" strokeDasharray={`${soilData?.healthScore || 82} 100`} strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-1 text-center">
                          <span className="font-black text-sm text-emerald-950 leading-none">{soilData?.healthScore || 82}%</span>
                          <span className="text-[6.5px] text-gray-400 font-extrabold uppercase tracking-wide mt-1 leading-tight max-w-[48px] break-words">
                            {t("soil.healthScore", "Health")}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* pH & Organic details */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* pH level */}
                      <div className="bg-white/45 backdrop-blur-md border border-[#EFEBE3]/60 rounded-[2rem] p-5 relative flex flex-col justify-between min-h-[140px] shadow-sm">
                        <div>
                          <p className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest">{t("soil.ph", "pH Level")}</p>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <span className="font-black text-lg text-emerald-950">{soilData?.ph || "7.0"}</span>
                            <span className="text-[9px] font-extrabold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-500/10">Neutral</span>
                          </div>
                        </div>
                        {/* pH gradient scale bar matching mockup */}
                        <div className="relative h-1.5 w-full rounded-full mt-2.5" style={{ background: "linear-gradient(to right, #FFA726 0%, #FFEE58 40%, #66BB6A 70%, #29B6F6 100%)" }}>
                          {/* Cursor handle centered around current pH value */}
                          <div 
                            className="absolute w-3.5 h-3.5 top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full bg-white border-2 border-emerald-950 shadow flex items-center justify-center" 
                            style={{ left: `${Math.max(8, Math.min(92, (((soilData?.ph || 7.0) - 4) / 6) * 100))}%` }}
                          >
                            <div className="w-1 h-1 rounded-full bg-emerald-950" />
                          </div>
                        </div>
                        <p className="text-[9px] text-gray-400 font-bold mt-2.5">Range: 6.0 – 7.5</p>
                      </div>

                      {/* Organic Matter */}
                      <div className="bg-white/45 backdrop-blur-md border border-[#EFEBE3]/60 rounded-[2rem] p-5 flex flex-col justify-between min-h-[140px] shadow-sm">
                        <div>
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest">{t("soil.organic", "Organic Matter")}</p>
                              <div className="flex items-baseline gap-1 mt-1.5">
                                <span className="font-black text-lg text-emerald-950">{soilData?.organic || "High"}</span>
                                <span className="text-[10px] text-gray-400 font-extrabold">{soilData?.organicPct || "2.8"}%</span>
                              </div>
                            </div>
                            <div className="w-8 h-8 rounded-xl bg-emerald-50/50 border border-emerald-500/10 flex items-center justify-center shadow-sm">
                              <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-4.5 4.5-5 8.5-5 11 0 2.8 2.2 5 5 5s5-2.2 5-5c0-2.5-.5-6.5-5-11z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                        {/* Sparkline curve via mini inline SVG */}
                        <div className="w-full h-8 mt-2.5">
                          <svg className="w-full h-full" viewBox="0 0 100 24">
                            <defs>
                              <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#4CAF50" stopOpacity="0.25" />
                                <stop offset="100%" stopColor="#4CAF50" stopOpacity="0" />
                              </linearGradient>
                            </defs>
                            <path d="M 0 18 Q 20 10 40 20 T 80 6 T 100 12 L 100 24 L 0 24 Z" fill="url(#sparklineGrad)" />
                            <path d="M 0 18 Q 20 10 40 20 T 80 6 T 100 12" fill="none" stroke="#4CAF50" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Best crop badge at bottom */}
              <div className="flex items-center justify-between border-t border-[#EFEBE3]/60 pt-4 mt-6">
                <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">{t("home.bestCrop", "Best Crop for Soil")}</span>
                <span className="px-4 py-2 rounded-xl text-xs font-black text-emerald-800 bg-emerald-50/50 border border-emerald-500/10 flex items-center gap-1.5 shadow-sm">
                  <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-4.5 4.5-5 8.5-5 11 0 2.8 2.2 5 5 5s5-2.2 5-5c0-2.5-.5-6.5-5-11z" />
                  </svg>
                  <span>{soilData?.best || "Wheat"}</span>
                </span>
              </div>
            </motion.section>

            {/* 1.2 Drone Map Widescreen Card */}
            <motion.section 
              whileHover={{ y: -2 }}
              className="xl:col-span-7 bg-white rounded-[2.2rem] shadow-sm border border-[#EFEBE3] relative overflow-hidden h-[360px] lg:h-auto"
            >
              {/* Filtered Map Image */}
              <div 
                className={`absolute inset-0 transition-all duration-700 ${currentField.filterClass}`}
                style={{
                  backgroundImage: `url(${fieldMap})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center"
                }}
              />

              {/* Sensor Pathway SVG Overlay matching mockup line structure */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 400 300" preserveAspectRatio="none">
                {/* Connection Line */}
                <motion.path 
                  d="M 60 210 L 220 135 L 340 100" 
                  fill="none" 
                  stroke="rgba(255,255,255,0.65)" 
                  strokeWidth="3.5" 
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.8, delay: 0.2 }}
                />
                {/* Glowing Nodes */}
                {[
                  { cx: 60, cy: 210 },
                  { cx: 220, cy: 135 },
                  { cx: 340, cy: 100 }
                ].map((node, index) => (
                  <g key={index}>
                    {/* Ring pulse */}
                    <circle cx={node.cx} cy={node.cy} r="9" fill="rgba(255,255,255,0.25)" className="animate-pulse" />
                    {/* Circle sensor center */}
                    <circle cx={node.cx} cy={node.cy} r="6" fill="#ffffff" stroke="#2D4A3E" strokeWidth="2.5" />
                  </g>
                ))}
              </svg>

              {/* Map tools absolute overlay top-row */}
              <div className="absolute top-5 left-5 right-5 flex justify-between items-center pointer-events-none z-10">
                <div className="relative pointer-events-auto">
                  <button 
                    onClick={() => setFieldsDropdownOpen(prev => !prev)}
                    className="bg-[#2D4A3E]/40 border border-white/20 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm flex items-center gap-2 hover:bg-[#2D4A3E]/50 active:scale-95 transition-all text-white"
                  >
                    <span className="font-extrabold text-[11px] tracking-wide">Field {selectedFieldId}</span>
                    <svg className="w-3.5 h-3.5 text-white/80" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <AnimatePresence>
                    {fieldsDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        className="absolute left-0 mt-2 w-48 bg-[#2D4A3E]/90 border border-white/10 backdrop-blur-md rounded-2xl shadow-lg py-2 z-50 flex flex-col"
                      >
                        {fieldsList.map((field) => {
                          const id = field.id;
                          return (
                            <button
                              key={id}
                              onClick={() => {
                                setSelectedFieldId(id);
                                setFieldsDropdownOpen(false);
                                setIsEditingName(false); // Reset edit view on field change
                              }}
                              className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors ${
                                selectedFieldId === id 
                                  ? "bg-white/10 text-white" 
                                  : "text-white/60 hover:text-white"
                              }`}
                            >
                              Field {id} ({fieldNames[id] || field.cropName})
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>


              </div>

              {/* Floating map stats card overlay (Right side) */}
              <div className="absolute right-5 bottom-5 top-18 xl:top-auto flex items-end pointer-events-none z-10">
                <motion.div 
                  key={selectedFieldId}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="pointer-events-auto w-[270px] bg-emerald-950/40 backdrop-blur-md text-white p-5 rounded-[2rem] shadow-[0_15px_30px_rgba(0,0,0,0.15)] border border-white/15 flex flex-col justify-between gap-4"
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        {isEditingName ? (
                          <div className="flex items-center gap-1.5 pointer-events-auto">
                            <input
                              type="text"
                              value={tempName}
                              onChange={(e) => setTempName(e.target.value)}
                              onKeyDown={(e) => {
                                  if (e.key === "Enter") handleSaveFieldName();
                                  else if (e.key === "Escape") setIsEditingName(false);
                              }}
                              className="bg-white/10 text-white font-black text-xs px-2 py-0.5 rounded outline-none border border-white/20 w-32"
                              autoFocus
                            />
                            <button 
                              onClick={handleSaveFieldName}
                              className="w-5 h-5 rounded bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center text-[9px] text-white shadow-sm font-bold"
                            >
                              ✓
                            </button>
                            <button 
                              onClick={() => setIsEditingName(false)}
                              className="w-5 h-5 rounded bg-white/15 hover:bg-white/25 flex items-center justify-center text-[9px] text-white"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <h4 className="font-black text-sm flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                              <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-4.5 4.5-5 8.5-5 11 0 2.8 2.2 5 5 5s5-2.2 5-5c0-2.5-.5-6.5-5-11z" />
                              </svg>
                            </div>
                            <span className="truncate">{fieldNames[selectedFieldId]}</span>
                            <button 
                              onClick={() => {
                                setTempName(fieldNames[selectedFieldId]);
                                setIsEditingName(true);
                              }}
                              className="pointer-events-auto p-1 rounded hover:bg-white/10 flex items-center justify-center transition-all shrink-0"
                              title="Edit field name"
                            >
                              <svg className="w-3.5 h-3.5 text-white/60 hover:text-white transition-colors" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                          </h4>
                        )}
                        <p className="text-[10px] text-emerald-200/50 font-bold mt-1">Last updated 1h ago</p>
                      </div>
                      <button className="w-7 h-7 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                        <svg className="w-3.5 h-3.5 text-white/80" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                        </svg>
                      </button>
                    </div>

                    <div className="mt-4">
                      <div className="flex justify-between text-[9px] text-emerald-100 font-extrabold uppercase tracking-widest mb-1.5">
                        <span>{t("home.yieldProgress", "Yield Progress")}</span>
                        <span>{currentField.yieldProgress}</span>
                      </div>
                      {/* progress bar */}
                      <div className="w-full h-1.5 bg-white/25 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-400 rounded-full" style={{ width: currentField.yieldProgress }} />
                      </div>
                    </div>
                  </div>

                  {/* Weather/Irrigation parameters */}
                  <div className="grid grid-cols-3 gap-1 border-t border-white/10 pt-3 text-center">
                    <div>
                      <p className="text-[9px] text-emerald-200/50 font-extrabold uppercase tracking-wider">{t("home.moisture", "Moisture")}</p>
                      <p className="font-black text-xs text-white mt-0.5">{currentField.moisture}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-emerald-200/50 font-extrabold uppercase tracking-wider">{t(`home.${currentField.countLabel.toLowerCase().replace(/\s+/g, "")}`, currentField.countLabel)}</p>
                      <p className="font-black text-xs text-white mt-0.5">{currentField.countVal}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-emerald-200/50 font-extrabold uppercase tracking-wider">{t("home.temp", "Temp")}</p>
                      <p className="font-black text-xs text-white mt-0.5">{currentField.temp}</p>
                    </div>
                  </div>

                  {/* Irrigation timer & button */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[10px] bg-white/5 rounded-xl px-3 py-2 border border-white/5">
                      <span className="text-emerald-200/60 font-bold">{t("home.nextIrrigationLabel", "Next Irrigation:")}</span>
                      <span className="font-black text-emerald-300">{currentField.nextIrrigation}</span>
                    </div>
                    <button 
                      onClick={() => navigate("/costs")}
                      className="w-full py-2.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-950 font-black text-xs shadow-sm flex items-center justify-center gap-1 transition-all group"
                    >
                      <span>{t("home.viewAnalytics", "View Analytics")}</span>
                      <span className="group-hover:translate-x-0.5 transition-transform">›</span>
                    </button>
                  </div>
                </motion.div>
              </div>
            </motion.section>

          </div>

          {/* ── ROW 2: Crop Production, Irrigation & Yield Forecast ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            
            {/* 2.1 Crop Production Card (Semi-circular gauge) */}
            <motion.section 
              whileHover={{ y: -2 }}
              className="bg-white rounded-[2.2rem] p-6 shadow-sm border border-[#EFEBE3] flex flex-col justify-between"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-4.5 4.5-5 8.5-5 11 0 2.8 2.2 5 5 5s5-2.2 5-5c0-2.5-.5-6.5-5-11z" />
                  </svg>
                  <h3 className="font-extrabold text-[15px] tracking-tight text-emerald-950">{t("home.cropProduction", "Crop Production")}</h3>
                </div>
                <button className="w-7 h-7 rounded-lg hover:bg-gray-50 flex items-center justify-center text-gray-400 transition-colors">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                  </svg>
                </button>
              </div>

              {/* Gauge + info columns */}
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* SVG Semi-circle progress gauge */}
                <div className="relative w-36 h-20 shrink-0 overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 100 50">
                    <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#F4F6F4" strokeWidth="8" strokeLinecap="round" />
                    <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="url(#cropProdGrad)" strokeWidth="8" strokeDasharray="125" strokeDashoffset="45" strokeLinecap="round" />
                    <defs>
                      <linearGradient id="cropProdGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#FFA726" />
                        <stop offset="50%" stopColor="#66BB6A" />
                        <stop offset="100%" stopColor="#2E7D32" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute bottom-0 left-0 right-0 text-center">
                    <span className="font-black text-2xl text-emerald-950 leading-none">40</span>
                    <p className="text-[8px] text-gray-400 font-extrabold uppercase tracking-widest leading-none mt-1.5">{t("home.hectaresArea", "Hectares Area")}</p>
                  </div>
                </div>

                {/* Crop Stats List */}
                <div className="flex-1 w-full space-y-2.5">
                  {[
                    { label: "Apple", val: "51.4%", ha: "18 Ha", color: "bg-emerald-600" },
                    { label: "Grapes", val: "22.5%", ha: "10 Ha", color: "bg-amber-500" },
                    { label: "Cherry", val: "30.6%", ha: "12 Ha", color: "bg-red-500" }
                  ].map(crop => (
                    <div key={crop.label} className="flex items-center justify-between text-[11px] font-bold">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${crop.color}`} />
                        <span className="text-gray-700">{crop.label}</span>
                      </div>
                      <div className="flex gap-4">
                        <span className="text-gray-400">{crop.val}</span>
                        <span className="font-black text-emerald-950">{crop.ha}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.section>

            {/* 2.2 Irrigation Status Card (Weekly Line chart) */}
            <motion.section 
              whileHover={{ y: -2 }}
              className="bg-white rounded-[2.2rem] p-6 shadow-sm border border-[#EFEBE3] flex flex-col justify-between"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 22a7 7 0 0 0 7-7c0-4.3-7-13-7-13S5 10.7 5 15a7 7 0 0 0 7 7z" />
                  </svg>
                  <h3 className="font-extrabold text-[15px] tracking-tight text-emerald-950">{t("home.irrigationStatus", "Irrigation Status")}</h3>
                </div>
                <button className="w-7 h-7 rounded-lg hover:bg-gray-50 flex items-center justify-center text-gray-400 transition-colors">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                  </svg>
                </button>
              </div>

              {/* SVG Line chart */}
              <div className="w-full h-28 mt-4">
                <svg className="w-full h-full" viewBox="0 0 320 100" fill="none">
                  {/* Grid Lines */}
                  <line x1="0" y1="20" x2="320" y2="20" stroke="#F4F6F4" strokeWidth="1" strokeDasharray="3" />
                  <line x1="0" y1="50" x2="320" y2="50" stroke="#F4F6F4" strokeWidth="1" strokeDasharray="3" />
                  <line x1="0" y1="80" x2="320" y2="80" stroke="#F4F6F4" strokeWidth="1" strokeDasharray="3" />

                  {/* Gradient fill */}
                  <defs>
                    <linearGradient id="irrigGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4CAF50" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#4CAF50" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Curve Path */}
                  <path d="M 10 70 Q 55 85 100 55 T 190 60 T 270 75 T 310 50 L 310 100 L 10 100 Z" fill="url(#irrigGrad)" />
                  <path d="M 10 70 Q 55 85 100 55 T 190 60 T 270 75 T 310 50" fill="none" stroke="#4CAF50" strokeWidth="2.5" strokeLinecap="round" />

                  {/* Node Circles */}
                  <circle cx="10" cy="70" r="4.5" fill="#FFA726" stroke="#fff" strokeWidth="2" />
                  <circle cx="100" cy="55" r="4.5" fill="#66BB6A" stroke="#fff" strokeWidth="2" />
                  <circle cx="190" cy="60" r="4.5" fill="#66BB6A" stroke="#fff" strokeWidth="2" />
                  <circle cx="270" cy="75" r="4.5" fill="#EF5350" stroke="#fff" strokeWidth="2" />
                  <circle cx="310" cy="50" r="4.5" fill="#66BB6A" stroke="#fff" strokeWidth="2" />
                </svg>
              </div>

              {/* Chart X axis */}
              <div className="flex justify-between text-[9px] text-gray-400 font-extrabold uppercase mt-2 px-1">
                <span>W1</span>
                <span>W2</span>
                <span>W3</span>
                <span>W4</span>
                <span className="text-emerald-800 font-black">W5</span>
                <span>W6</span>
                <span>W7</span>
              </div>
            </motion.section>

            {/* 2.3 Yield Forecast Card (Weekly Bar chart) */}
            <motion.section 
              whileHover={{ y: -2 }}
              className="bg-white rounded-[2.2rem] p-6 shadow-sm border border-[#EFEBE3] flex flex-col justify-between"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                  </svg>
                  <h3 className="font-extrabold text-[15px] tracking-tight text-emerald-950">{t("home.yieldForecast", "Yield Forecast")}</h3>
                </div>
                <button className="w-7 h-7 rounded-lg hover:bg-gray-50 flex items-center justify-center text-gray-400 transition-colors">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                  </svg>
                </button>
              </div>

              {/* SVG Column Chart */}
              <div className="w-full h-28 mt-4 flex items-end justify-between px-1">
                {[
                  { max: 50, mid: 30, min: 10 },
                  { max: 70, mid: 50, min: 25 },
                  { max: 65, mid: 40, min: 20 },
                  { max: 80, mid: 60, min: 35 },
                  { max: 92, mid: 70, min: 45, highlight: true },
                  { max: 60, mid: 35, min: 15 },
                  { max: 55, mid: 30, min: 10 }
                ].map((bar, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5 w-6">
                    {/* Columns Stack */}
                    <div className="relative w-3.5 h-20 bg-gray-50 rounded-full overflow-hidden border border-gray-100 flex flex-col justify-end">
                      <div className="absolute inset-0 bg-[#EFEBE3]/20" />
                      <div className="w-full bg-emerald-600" style={{ height: `${bar.max}%` }} />
                      <div className="w-full bg-[#C8972A] opacity-90" style={{ height: `${bar.mid}%` }} />
                      <div className="w-full bg-[#C0392B] opacity-80" style={{ height: `${bar.min}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Chart X axis */}
              <div className="flex justify-between text-[9px] text-gray-400 font-extrabold uppercase mt-2 px-1">
                <span>W1</span>
                <span>W2</span>
                <span>W3</span>
                <span>W4</span>
                <span className="text-emerald-800 font-black">W5</span>
                <span>W6</span>
                <span>W7</span>
              </div>
            </motion.section>

          </div>


        </main>
      </div>


      {/* Command Palette */}

      <AnimatePresence>
        {commandOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-start justify-center pt-28 z-50 px-4"
            style={{ background: "rgba(10,25,18,0.45)", backdropFilter: "blur(14px)" }}
            onClick={(e) => { if (e.target === e.currentTarget) setCommandOpen(false); }}
          >
            <motion.div
              initial={{ opacity: 0, y: -25, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.97 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="w-full max-w-lg bg-white/95 backdrop-blur-md rounded-3xl shadow-[0_30px_70px_-15px_rgba(10,25,18,0.35)] p-6 border border-[#EFEBE3]"
            >
              <div className="flex justify-between items-center mb-4">
                <p className="text-[10px] font-black tracking-widest uppercase text-emerald-800">
                  {t("home.commandTitle")}
                </p>
                <button 
                  onClick={() => setCommandOpen(false)} 
                  className="w-6 h-6 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="relative mb-5">
                <input 
                  autoFocus 
                  placeholder={t("home.commandPlaceholder")}
                  className="w-full rounded-2xl px-5 py-3.5 text-sm outline-none border border-emerald-500/10 focus:border-emerald-500/30 shadow-inner transition-all pl-11 animate-pulse"
                  style={{
                    background: "rgba(245,240,228,0.5)",
                    color: "#1A2E1A"
                  }} 
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              </div>

              <div className="space-y-1">
                {[
                  { icon: "🤖", label: t("home.aiTitle"), path: "/chat" },
                  { icon: "🌤", label: "View Weather Advisory", path: "/weather" },
                  { icon: "🌾", label: t("home.soilTitle"), path: "/soil" },
                  { icon: "🚜", label: t("home.equipment"), path: "/rental" },
                  { icon: "🧺", label: t("home.seeds"), path: "/seeds" },
                ].map(item => (
                  <motion.div
                    key={item.path}
                    whileHover={{ x: 4, backgroundColor: "rgba(224,217,204,0.35)" }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => { navigate(item.path); setCommandOpen(false); }}
                    className="cursor-pointer p-3 rounded-2xl flex items-center gap-3 transition-colors text-sm font-bold text-gray-700 hover:text-emerald-950"
                  >
                    <span className="text-xl flex items-center justify-center w-8 h-8 rounded-xl bg-white shadow-sm border border-gray-100">{item.icon}</span> 
                    <span>{item.label}</span>
                  </motion.div>
                ))}
              </div>

              <div className="mt-5 pt-3.5 flex justify-between text-[10px] text-gray-400 font-bold uppercase tracking-wider border-t border-gray-100">
                <span>Navigate using arrows</span>
                <span>ESC to close</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
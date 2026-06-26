import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../context/AppContext";
import { updateUserLanguage } from "../firebase/user";
import { useTranslation } from "react-i18next";

const languages = [
  { code: "en", label: "English",    flag: "🇬🇧" },
  { code: "hi", label: "हिन्दी",      flag: "🇮🇳" },
  { code: "ta", label: "தமிழ்",      flag: "🇮🇳" },
  { code: "ml", label: "മലയാളം",    flag: "🇮🇳" },
  { code: "kn", label: "ಕನ್ನಡ",      flag: "🇮🇳" },
  { code: "te", label: "తెలుగు",    flag: "🇮🇳" },
  { code: "mr", label: "मराठी",      flag: "🇮🇳" },
];

const STATES_LIST = [
  "Tamil Nadu","Kerala","Karnataka","Andhra Pradesh","Telangana",
  "Maharashtra","Gujarat","Rajasthan","Uttar Pradesh","Punjab",
  "Haryana","West Bengal","Bihar",
];

/* ── Sidebar icon helper ── */
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

const inputCls = "w-full px-4 py-3 rounded-2xl text-sm outline-none border border-emerald-500/10 focus:border-emerald-500/30 transition-all bg-[#FCFBF8] text-[#1B3A2D] font-semibold placeholder:text-gray-300";

/* ═══════════════════════════════════════════ */
const Profile = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { language, setLanguage } = useApp();

  const [name,  setName]  = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState("");
  const [city,  setCity]  = useState("");

  const [loading,     setLoading]     = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg,    setErrorMsg]    = useState("");

  /* Load from cache / backend */
  useEffect(() => {
    const cachedUser = localStorage.getItem("agroot_user");
    if (!cachedUser) { navigate("/"); return; }
    try {
      const parsed = JSON.parse(cachedUser);
      if (parsed.email) setEmail(parsed.email);
      if (parsed.phone) setPhone(parsed.phone);
      fetchProfile(parsed.email);
    } catch { /* ignore */ }
  }, []);

  const fetchProfile = async (userEmail) => {
    if (!userEmail) return;
    try {
      const res  = await fetch(`http://localhost:5000/getProfile?email=${encodeURIComponent(userEmail)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.name)     setName(data.name);
        if (data.phone)    setPhone(data.phone);
        if (data.state)    setState(data.state);
        if (data.city)     setCity(data.city);
        if (data.language) setLanguage(data.language);
      }
    } catch { /* backend offline — use cache */ }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!email) { setErrorMsg("Email is required."); return; }
    setLoading(true); setErrorMsg(""); setSaveSuccess(false);
    try {
      const res = await fetch("http://localhost:5000/updateProfile", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, name, phone, state, city, language }),
      });
      if (res.ok) {
        setSaveSuccess(true);
        if (phone) updateUserLanguage(`${phone}@agroot.local`, language).catch(() => {});
        localStorage.setItem("agroot_user", JSON.stringify({ email, phone }));
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setErrorMsg("Failed to save profile. Server error.");
      }
    } catch {
      setErrorMsg("Connection failed. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("agroot_user");
    navigate("/");
  };

  const initials = name ? name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0,2) : "?";

  const sidebarItems = [
    { label: "Dashboard",    path: "/home" },
    { label: "Fields",       path: "/satellite" },
    { label: "Crops",        path: "/seeds" },
    { label: "Crop Tracker", path: "/costs" },
    { label: "Rentals",      path: "/rental" },
    { label: "Alerts",       path: "/alerts" },
    { label: "Reports",      path: "/profile" },
    { label: "Profile",      active: true },
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
              <span className="font-extrabold text-[12px] tracking-[0.18em] text-emerald-950 uppercase mt-1">AGROOT</span>
            </div>
            {/* Nav */}
            <nav className="space-y-1.5 mt-5">
              {sidebarItems.map(item => {
                const isActive = !!item.active;
                return (
                  <button key={item.label} onClick={() => item.path && navigate(item.path)}
                    className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-[12px] font-extrabold tracking-wide transition-all duration-300 ${
                      isActive ? "bg-emerald-50 text-emerald-900 border border-emerald-500/10 shadow-sm" : "text-gray-400 hover:text-emerald-950 hover:bg-gray-50/50"
                    }`}>
                    <span className={`shrink-0 ${isActive ? "text-emerald-600" : "text-gray-400"}`}>{renderSidebarIcon(item.label)}</span>
                    <span>{t(`sidebar.${item.label.toLowerCase().replace(/\s+/g, "")}`, item.label)}</span>
                  </button>
                );
              })}
            </nav>
          </div>
          {/* AGROOT AI dock */}
          <div className="mt-auto border-t border-[#EFEBE3]/60 pt-4 pb-2 flex flex-col items-center gap-3">
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => navigate("/chat")}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-full bg-emerald-800 text-white text-[10px] font-extrabold tracking-[0.14em] shadow-md shadow-emerald-900/20 cursor-pointer border border-emerald-700/40">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-4.5 4.5-5 8.5-5 11 0 2.8 2.2 5 5 5s5-2.2 5-5c0-2.5-.5-6.5-5-11z"/>
              </svg>
              AGROOT AI +
            </motion.button>
            <div className="relative flex items-center justify-center">
              <motion.div animate={{ scale: [1, 1.5], opacity: [0.4, 0] }} transition={{ repeat: Infinity, duration: 1.8, ease: "easeOut" }}
                className="absolute inset-0 rounded-full border border-emerald-500 pointer-events-none"/>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }} onClick={() => navigate("/chat")}
                className="w-12 h-12 rounded-full bg-emerald-800 flex items-center justify-center shadow-lg shadow-emerald-900/25 border border-emerald-600/30 cursor-pointer">
                <div className="flex items-center gap-[2.5px] h-4">
                  <motion.div className="w-[2.5px] bg-white rounded-full" style={{ height: 5 }} animate={{ height: [5,14,5] }} transition={{ repeat: Infinity, duration: 1.1, ease: "easeInOut" }}/>
                  <motion.div className="w-[2.5px] bg-white rounded-full" style={{ height: 12 }} animate={{ height: [12,6,12] }} transition={{ repeat: Infinity, duration: 0.9, ease: "easeInOut" }}/>
                  <motion.div className="w-[2.5px] bg-white rounded-full" style={{ height: 9 }} animate={{ height: [9,18,9] }} transition={{ repeat: Infinity, duration: 1.3, ease: "easeInOut" }}/>
                  <motion.div className="w-[2.5px] bg-white rounded-full" style={{ height: 6 }} animate={{ height: [6,11,6] }} transition={{ repeat: Infinity, duration: 1.0, ease: "easeInOut" }}/>
                </div>
              </motion.button>
            </div>
            <span className="text-[9px] text-gray-400 font-bold tracking-wider uppercase">v1.2.0</span>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 h-screen overflow-y-auto z-10 relative">
        <main className="p-5 lg:p-8 max-w-3xl mx-auto w-full space-y-6 pb-16">

          {/* Page Header */}
          <div className="flex items-center justify-between border-b border-[#EFEBE3]/60 pb-5">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-emerald-955">👤 {t("sidebar.profile", "Profile")}</h1>
              <p className="text-xs text-gray-400 font-bold mt-1">Manage your account and preferences</p>
            </div>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-black text-red-500 border border-red-200 hover:bg-red-50 transition-all cursor-pointer">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1"/>
              </svg>
              Logout
            </motion.button>
          </div>

          {/* Avatar + identity card */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 ring-1 ring-black/[0.06] flex items-center gap-5"
            style={{ boxShadow: "0 2px 16px rgba(27,67,50,0.07)" }}>
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-700 to-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-900/20 border-4 border-white">
                <span className="text-white font-black text-2xl tracking-tight">{initials}</span>
              </div>
              <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-400 border-2 border-white"/>
            </div>
            <div>
              <p className="font-black text-lg text-[#1B3A2D] leading-tight">{name || "Your Name"}</p>
              <p className="text-xs text-gray-400 font-semibold mt-0.5">{email || "No email set"}</p>
              {state && <p className="text-[10px] text-emerald-600 font-bold mt-1">📍 {city ? `${city}, ` : ""}{state}</p>}
            </div>
          </motion.div>

          {/* Form Card */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 ring-1 ring-black/[0.06] space-y-5"
            style={{ boxShadow: "0 2px 16px rgba(27,67,50,0.07)" }}>

            <p className="text-[10px] uppercase tracking-widest font-black text-gray-400">Personal Details</p>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mb-1.5">Full Name</label>
                <input type="text" placeholder="e.g. Ravi Kumar" className={inputCls}
                  value={name} onChange={e => setName(e.target.value)}/>
              </div>

              {/* Email (readonly) */}
              <div>
                <label className="block text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mb-1.5">Email Address</label>
                <input type="email" disabled className={`${inputCls} opacity-50 cursor-not-allowed`} value={email}/>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mb-1.5">Phone Number</label>
                <input type="tel" placeholder="+91 98765 43210" className={inputCls}
                  value={phone} onChange={e => setPhone(e.target.value)}/>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* State */}
                <div>
                  <label className="block text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mb-1.5">State</label>
                  <select className={inputCls} value={state} onChange={e => setState(e.target.value)}>
                    <option value="">Select State</option>
                    {STATES_LIST.map(st => <option key={st} value={st}>{st}</option>)}
                  </select>
                </div>
                {/* City */}
                <div>
                  <label className="block text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mb-1.5">City / Town</label>
                  <input type="text" placeholder="e.g. Coimbatore" className={inputCls}
                    value={city} onChange={e => setCity(e.target.value)}/>
                </div>
              </div>

              {/* Success / Error banners */}
              <AnimatePresence>
                {saveSuccess && (
                  <motion.div key="success" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-black">
                    <span>✓</span> Profile saved successfully!
                  </motion.div>
                )}
                {errorMsg && (
                  <motion.div key="error" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-2 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs font-black">
                    <span>⚠</span> {errorMsg}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Save Button */}
              <motion.button whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.97 }}
                type="submit" disabled={loading}
                className="w-full py-3.5 rounded-2xl text-white font-black text-sm bg-[#1B4332] hover:bg-[#145C38] shadow-md shadow-emerald-900/20 transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> Saving...</>
                ) : "Save Profile"}
              </motion.button>
            </form>
          </motion.div>

          {/* App Language Card */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 ring-1 ring-black/[0.06] space-y-4"
            style={{ boxShadow: "0 2px 16px rgba(27,67,50,0.07)" }}>
            <p className="text-[10px] uppercase tracking-widest font-black text-gray-400">App Language</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {languages.map(lang => (
                <button key={lang.code} onClick={() => setLanguage(lang.code)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-black transition-all cursor-pointer border ${
                    language === lang.code
                      ? "bg-[#1B4332] text-white border-emerald-700/30 shadow-md"
                      : "bg-[#F0F4F1] text-[#4A7A5A] border-transparent hover:bg-white"
                  }`}>
                  <span className="text-base">{lang.flag}</span>
                  <span>{lang.label}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Quick Links Card */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 ring-1 ring-black/[0.06] space-y-2"
            style={{ boxShadow: "0 2px 16px rgba(27,67,50,0.07)" }}>
            <p className="text-[10px] uppercase tracking-widest font-black text-gray-400 mb-3">Quick Links</p>
            {[
              { icon: "📅", label: "Crop Calendar",  path: "/calendar" },
              { icon: "💰", label: "Cost Tracker",   path: "/costs" },
              { icon: "🌦️", label: "Weather",        path: "/weather" },
              { icon: "🤖", label: "AGROOT AI Chat", path: "/chat" },
            ].map(link => (
              <button key={link.path} onClick={() => navigate(link.path)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black text-[#4A7A5A] hover:bg-[#F0F4F1] transition-all cursor-pointer text-left">
                <span className="text-base w-6 text-center">{link.icon}</span>
                <span>{link.label}</span>
                <svg className="w-3.5 h-3.5 ml-auto text-gray-300" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6"/>
                </svg>
              </button>
            ))}
          </motion.div>

        </main>
      </div>
    </div>
  );
};

export default Profile;

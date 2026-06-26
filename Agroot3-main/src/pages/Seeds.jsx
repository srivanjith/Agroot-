import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { db } from "../firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import PayPalCheckout from "./PayPalCheckout";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";

const DEFAULT_SEEDS = [
  {
    id: "s1",
    name: "Certified Basmati Rice Seeds",
    cropIcon: "🌾",
    category: "seeds",
    season: "kharif",
    description: "Premium grade Basmati seeds with high disease resistance and superior germination rate (92%+). Optimized for clayey alluvial soils.",
    price: 180,
    stock: "500 kg",
    rating: "4.8"
  },
  {
    id: "s2",
    name: "High Yield Wheat Seeds (Kundan)",
    cropIcon: "🌾",
    category: "seeds",
    season: "rabi",
    description: "Sow in winter seasons. Highly rust-resistant, short-stature cultivar that responds exceptionally well to timely irrigation.",
    price: 140,
    stock: "800 kg",
    rating: "4.7"
  },
  {
    id: "s3",
    name: "Premium Apple Saplings (Red Delicious)",
    cropIcon: "🍏",
    category: "plants",
    season: "zaid",
    description: "Healthy grafted apple saplings ready for transplanting. Ideal for hilly loams and cold temperate zones.",
    price: 320,
    stock: "150 units",
    rating: "4.9"
  },
  {
    id: "s4",
    name: "Seedless Grapevines (Thompson Seedless)",
    cropIcon: "🍇",
    category: "plants",
    season: "rabi",
    description: "Vigorous rootstock cuttings with high yield potential. Perfect for warm-temperate regions with black regur soils.",
    price: 250,
    stock: "200 units",
    rating: "4.6"
  },
  {
    id: "s5",
    name: "Hybrid Sweet Corn Seeds (Sugar 75)",
    cropIcon: "🌽",
    category: "seeds",
    season: "kharif",
    description: "Extra sweet variety with golden yellow kernels. Reaches maturity in 75 days. Exceptional shelf-life.",
    price: 110,
    stock: "400 kg",
    rating: "4.5"
  },
  {
    id: "s6",
    name: "Valencia Orange Saplings",
    cropIcon: "🍊",
    category: "plants",
    season: "zaid",
    description: "Grafted orange rootstocks with early-fruiting capabilities. Disease resistant and tolerant to heat.",
    price: 290,
    stock: "120 units",
    rating: "4.7"
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

const Seeds = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  
  const [seedsList, setSeedsList] = useState(() => {
    const saved = localStorage.getItem("agroot_seeds_list");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return DEFAULT_SEEDS;
  });

  const [cart, setCart] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [seasonFilter, setSeasonFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [mode, setMode] = useState("buy"); // "buy" or "sell"
  
  // Sell Form States
  const [newSeedName, setNewSeedName] = useState("");
  const [newSeedCategory, setNewSeedCategory] = useState("seeds");
  const [newSeedSeason, setNewSeedSeason] = useState("kharif");
  const [newSeedPrice, setNewSeedPrice] = useState("");
  const [newSeedDescription, setNewSeedDescription] = useState("");
  const [newSeedIcon, setNewSeedIcon] = useState("🌱");
  const [newSeedStock, setNewSeedStock] = useState("");
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Weather Context Alert
  const [weatherContext, setWeatherContext] = useState(null);

  // Get user info
  const user = JSON.parse(localStorage.getItem("agroot_user"));
  const userId = user?.phone ? `${user.phone}@agroot.local` : "demo";

  useEffect(() => {
    // Check for weather data (rain)
    const isRaining = localStorage.getItem("agroot_rain") === "true";
    if (isRaining) {
      setWeatherContext("It's raining! Consider waiting to sow or plant.");
    }
  }, []);

  const handleSellMySeeds = (e) => {
    e.preventDefault();
    if (!newSeedName.trim() || !newSeedPrice.trim() || !newSeedDescription.trim()) {
      alert("Please fill in all required fields.");
      return;
    }

    const newId = `s-${Date.now()}`;
    const priceNum = parseFloat(newSeedPrice);
    const unitLabel = newSeedCategory === "seeds" ? "kg" : "units";
    
    const newCropObj = {
      id: newId,
      name: newSeedName.trim(),
      cropIcon: newSeedIcon,
      category: newSeedCategory,
      season: newSeedSeason,
      description: newSeedDescription.trim(),
      price: priceNum,
      stock: newSeedStock.trim() ? `${newSeedStock.trim()} ${unitLabel}` : `100 ${unitLabel}`,
      rating: "5.0",
      ownerId: userId
    };

    const updatedList = [...seedsList, newCropObj];
    setSeedsList(updatedList);
    localStorage.setItem("agroot_seeds_list", JSON.stringify(updatedList));

    // Display success notification
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 4000);

    // Reset Form
    setNewSeedName("");
    setNewSeedCategory("seeds");
    setNewSeedSeason("kharif");
    setNewSeedPrice("");
    setNewSeedDescription("");
    setNewSeedIcon("🌱");
    setNewSeedStock("");
  };

  const addToCart = (seed) => {
    if (!cart.find(s => s.id === seed.id)) {
      setCart([...cart, seed]);
    }
  };

  const removeFromCart = (seedId) => {
    setCart(cart.filter(item => item.id !== seedId));
  };

  const saveOrder = async () => {
    try {
      await addDoc(collection(db, "seedOrders"), {
        items: cart.map(s => ({
          seedId: s.id,
          name: s.name,
          price: s.price
        })),
        totalItems: cart.length,
        userId,
        createdAt: serverTimestamp(),
        status: "ordered"
      });
    } catch (e) {
      console.warn("Firestore not initialized, saving order locally:", e);
      const savedOrders = JSON.parse(localStorage.getItem("agroot_orders") || "[]");
      savedOrders.push({
        items: cart.map(s => ({ seedId: s.id, name: s.name, price: s.price })),
        totalItems: cart.length,
        userId,
        createdAt: new Date().toISOString(),
        status: "ordered"
      });
      localStorage.setItem("agroot_orders", JSON.stringify(savedOrders));
    }
  };

  // Filter dynamic seeds list
  const filteredSeeds = seedsList.filter(s => {
    const matchesCategory = categoryFilter === "all" || s.category === categoryFilter;
    const matchesSeason = seasonFilter === "all" || s.season === seasonFilter || s.season === "all";
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSeason && matchesSearch;
  });

  const sidebarItems = [
    { label: "Dashboard", path: "/home" },
    { label: "Fields", path: "/satellite" },
    { label: "Crops", active: true },
    { label: "Crop Tracker", path: "/costs" },
    { label: "Rentals", path: "/rental" },
    { label: "Alerts", path: "/alerts" },
    { label: "Reports", path: "/profile" },
    { label: "Profile", path: "/profile" }
  ];

  const emojiOptions = ["🌱", "🌾", "🍏", "🍇", "🌽", "🍊", "🍅", "🥔", "🍓", "🍉", "🍒", "🌿"];

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
              <span className="font-extrabold text-[12px] tracking-[0.18em] text-emerald-955 uppercase mt-1">AGROOT</span>
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
                        : "text-gray-400 hover:text-emerald-955 hover:bg-gray-50/50"
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

          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider text-center py-2">
            v1.2.0
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT WORKSPACE ── */}
      <div className="flex-1 h-screen overflow-y-auto flex flex-col z-10 relative">
        
        {/* Toast Notification */}
        <AnimatePresence>
          {showSuccessToast && (
            <motion.div
              initial={{ opacity: 0, y: -50, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: -20, x: "-50%" }}
              className="fixed top-5 left-1/2 z-[10000] px-5 py-3 rounded-2xl bg-emerald-800 border border-emerald-600 text-white font-extrabold text-xs shadow-lg flex items-center gap-2"
            >
              <span>🎉</span> Seed listing published successfully! It is now live in the catalog.
            </motion.div>
          )}
        </AnimatePresence>

        <main className="p-5 lg:p-8 space-y-6 pb-36 max-w-7xl mx-auto w-full">
          
          {/* Header Block */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#EFEBE3]/60 pb-5">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-emerald-955">{t("seeds.title", "Crops & Seeds Marketplace")}</h1>
              <p className="text-xs text-gray-400 font-bold mt-1">{t("seeds.subtitle", "Buy vetted high-yield seeds or publish your crops for sale")}</p>
            </div>

            {/* Mode Switcher — clean pill toggle */}
            <div className="flex p-1 gap-1 rounded-full bg-[#F0F4F1] border border-[#D6E4DA] shadow-inner">
              <button
                onClick={() => setMode("buy")}
                className={`px-5 py-2 rounded-full text-xs font-black transition-all duration-250 flex items-center gap-2 cursor-pointer select-none ${
                  mode === "buy"
                    ? "bg-[#1B4332] text-white shadow-md shadow-emerald-900/20"
                    : "text-[#4A7A5A] hover:bg-white/70 hover:text-[#1B4332]"
                }`}
              >
                🛒 Buy Crops & Seeds
              </button>
              <button
                onClick={() => setMode("sell")}
                className={`px-5 py-2 rounded-full text-xs font-black transition-all duration-250 flex items-center gap-2 cursor-pointer select-none ${
                  mode === "sell"
                    ? "bg-[#1B4332] text-white shadow-md shadow-emerald-900/20"
                    : "text-[#4A7A5A] hover:bg-white/70 hover:text-[#1B4332]"
                }`}
              >
                🌾 Sell Crops & Seeds
              </button>
            </div>
          </div>

          {weatherContext && (
            <div className="bg-[#FFF9E6]/75 backdrop-blur-sm border border-[#FFE0B2]/50 text-[#E65100] px-5 py-3.5 rounded-2xl text-xs font-black flex items-center gap-2">
              <span>⚠️ Weather Warning:</span> {weatherContext}
            </div>
          )}

          {/* Tab content conditional rendering */}
          <AnimatePresence mode="wait">
            
            {/* ══ BUY MODE VIEW ══ */}
            {mode === "buy" && (
              <motion.div
                key="buy-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Filters Row */}
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 w-full">
                  {/* Category & Season buttons */}
                  <div className="flex flex-wrap items-center gap-3">
                    
                    {/* Category Selector */}
                    <div className="flex p-1 gap-1 rounded-full bg-[#F0F4F1] border border-[#D6E4DA] shadow-inner shrink-0 items-center">
                      {["all", "seeds", "plants"].map(cat => (
                        <button
                          key={cat}
                          onClick={() => setCategoryFilter(cat)}
                          className={`px-3.5 py-1.5 rounded-full text-[10px] font-black capitalize transition-all duration-200 cursor-pointer select-none ${
                            categoryFilter === cat ? "bg-[#1B4332] text-white shadow-sm" : "text-[#4A7A5A] hover:bg-white/70 hover:text-[#1B4332]"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* Season Selector */}
                    <div className="flex p-1 gap-1 rounded-full bg-[#F0F4F1] border border-[#D6E4DA] shadow-inner shrink-0 items-center">
                      {["all", "kharif", "rabi", "zaid"].map(season => (
                        <button
                          key={season}
                          onClick={() => setSeasonFilter(season)}
                          className={`px-3.5 py-1.5 rounded-full text-[10px] font-black capitalize transition-all duration-200 cursor-pointer select-none ${
                            seasonFilter === season ? "bg-[#1B4332] text-white shadow-sm" : "text-[#4A7A5A] hover:bg-white/70 hover:text-[#1B4332]"
                          }`}
                        >
                          {season}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Search input bar */}
                  <div className="relative flex-1 max-w-md">
                    <input
                      type="text"
                      placeholder="Search crops, seeds, saplings..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-2xl pl-10 pr-4 py-2.5 text-xs outline-none border border-white/60 focus:border-emerald-500/30 transition-all bg-white/40 backdrop-blur-md font-bold text-emerald-955 focus:bg-white/80 shadow-sm"
                    />
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
                  </div>
                </div>

                {/* Seeds Grid list */}
                {filteredSeeds.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredSeeds.map((seed) => (
                      <motion.div
                        key={seed.id}
                        layout
                        whileHover={{ y: -6, scale: 1.012 }}
                        transition={{ type: "spring", stiffness: 300, damping: 22 }}
                        className="bg-white/70 backdrop-blur-xl rounded-3xl p-5 ring-1 ring-black/[0.06] flex flex-col justify-between gap-4 relative group cursor-default"
                        style={{ boxShadow: "0 2px 16px rgba(27,67,50,0.07), 0 1px 4px rgba(27,67,50,0.04)" }}
                      >
                        <div>
                          {/* Banner visual */}
                          <div className="h-32 w-full rounded-2xl bg-gradient-to-br from-emerald-50 to-green-100/40 flex items-center justify-center text-5xl relative overflow-hidden mb-4">
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-transparent to-transparent pointer-events-none" />
                            <span className="group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 transform-gpu inline-block select-none drop-shadow-sm">{seed.cropIcon}</span>
                            <span className="absolute top-3 right-3 text-[10px] font-black uppercase tracking-wider bg-white/95 backdrop-blur-sm text-emerald-800 px-2.5 py-1 rounded-xl shadow-sm select-none border border-emerald-100">
                              ₹{seed.price} / {seed.category === "seeds" ? "kg" : "plant"}
                            </span>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                {seed.category}
                              </span>
                              <span className="text-[9px] font-black bg-amber-50 text-amber-700 border border-amber-200/60 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                {seed.season} season
                              </span>
                            </div>

                            <h3 className="font-black text-[15px] text-[#1B3A2D] tracking-tight leading-snug group-hover:text-emerald-800 transition-colors">
                              {seed.name}
                            </h3>
                            <p className="text-[11px] text-gray-500 leading-relaxed font-medium line-clamp-3">
                              {seed.description}
                            </p>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="border-t border-gray-100 pt-3.5 flex items-center justify-between">
                          <div className="text-[10px] font-semibold text-gray-400 space-y-0.5">
                            <div>Stock: <span className="text-[#1B3A2D] font-black">{seed.stock}</span></div>
                            <div className="flex items-center gap-1">Rating: <span className="text-amber-500 font-black">★ {seed.rating}</span></div>
                          </div>
                          
                          <motion.button
                            whileHover={{ scale: 1.06 }}
                            whileTap={{ scale: 0.94 }}
                            onClick={() => addToCart(seed)}
                            className="px-4 py-2 rounded-xl bg-[#1B4332] hover:bg-[#145C38] text-white font-black text-[11px] shadow-md shadow-emerald-900/20 transition-colors cursor-pointer"
                          >
                            ➕ Add To Cart
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="h-60 rounded-[2.2rem] border border-dashed border-[#EFEBE3] bg-white flex flex-col items-center justify-center text-center p-6">
                    <span className="text-4xl">🧺</span>
                    <h3 className="font-black text-sm text-emerald-955 mt-3">No Crops Found</h3>
                    <p className="text-xs text-gray-400 font-bold mt-1 max-w-xs">Adjust your search parameters or category filter settings to discover more seeds.</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* ══ SELL MODE VIEW ══ */}
            {mode === "sell" && (
              <motion.div
                key="sell-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-xl mx-auto"
              >
                <div className="bg-white/75 backdrop-blur-xl rounded-3xl p-7 ring-1 ring-black/[0.06] space-y-6" style={{ boxShadow: "0 8px 32px rgba(27,67,50,0.08), 0 2px 8px rgba(27,67,50,0.04)" }}>
                  
                  <div>
                    <h3 className="font-black text-base text-emerald-955 tracking-tight">Sell Your Crop Harvests & Seeds</h3>
                    <p className="text-[10px] text-gray-400 font-bold mt-1">Submit details to list your crop/sapling catalog item on the active local market board</p>
                  </div>

                  <form onSubmit={handleSellMySeeds} className="space-y-4">
                    <div>
                      <label className="block text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mb-1.5">Crop or Seed Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Organic Basmati Paddy"
                        value={newSeedName}
                        onChange={(e) => setNewSeedName(e.target.value)}
                        className="w-full rounded-2xl px-4 py-3 text-xs outline-none border border-emerald-500/10 focus:border-emerald-500/30 transition-all bg-[#FCFBF8] text-emerald-955 font-bold"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mb-1.5">Category</label>
                        <select
                          value={newSeedCategory}
                          onChange={(e) => setNewSeedCategory(e.target.value)}
                          className="w-full rounded-2xl px-4 py-3 text-xs outline-none border border-emerald-500/10 focus:border-emerald-500/30 transition-all bg-[#FCFBF8] text-emerald-955 font-bold cursor-pointer"
                        >
                          <option value="seeds">Seeds (in kg)</option>
                          <option value="plants">Plants / Saplings (in units)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mb-1.5">Season Suitability</label>
                        <select
                          value={newSeedSeason}
                          onChange={(e) => setNewSeedSeason(e.target.value)}
                          className="w-full rounded-2xl px-4 py-3 text-xs outline-none border border-emerald-500/10 focus:border-emerald-500/30 transition-all bg-[#FCFBF8] text-emerald-955 font-bold cursor-pointer"
                        >
                          <option value="kharif">Kharif Season</option>
                          <option value="rabi">Rabi Season</option>
                          <option value="zaid">Zaid Season</option>
                          <option value="all">All Seasons</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mb-1.5">Price (₹ per unit)</label>
                        <input
                          type="number"
                          required
                          placeholder="e.g. 150"
                          value={newSeedPrice}
                          onChange={(e) => setNewSeedPrice(e.target.value)}
                          className="w-full rounded-2xl px-4 py-3 text-xs outline-none border border-emerald-500/10 focus:border-emerald-500/30 transition-all bg-[#FCFBF8] text-emerald-955 font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mb-1.5">Stock Volume</label>
                        <input
                          type="number"
                          placeholder="e.g. 200"
                          value={newSeedStock}
                          onChange={(e) => setNewSeedStock(e.target.value)}
                          className="w-full rounded-2xl px-4 py-3 text-xs outline-none border border-emerald-500/10 focus:border-emerald-500/30 transition-all bg-[#FCFBF8] text-emerald-955 font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mb-1.5">Choose Crop Icon</label>
                      <div className="flex flex-wrap gap-2.5 p-3 rounded-2xl bg-[#FCFBF8] border border-emerald-500/5">
                        {emojiOptions.map(emoji => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => setNewSeedIcon(emoji)}
                            className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg border transition-all ${
                              newSeedIcon === emoji 
                                ? "bg-emerald-800 border-emerald-600 text-white scale-105 shadow-sm" 
                                : "bg-white border-gray-100 hover:bg-gray-50 text-gray-700 hover:scale-102"
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mb-1.5">Detailed Breed/Yield Description</label>
                      <textarea
                        required
                        placeholder="Provide details about seed breed germination rates, recommended soil profile, or nursery origins..."
                        value={newSeedDescription}
                        onChange={(e) => setNewSeedDescription(e.target.value)}
                        className="w-full rounded-2xl px-4 py-3 text-xs outline-none border border-emerald-500/10 focus:border-emerald-500/30 transition-all bg-[#FCFBF8] text-emerald-955 font-bold h-24 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-black text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      🌾 Sell My Seeds
                    </button>

                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating Cart Indicator */}
          <AnimatePresence>
            {cart.length > 0 && (
              <motion.div
                initial={{ y: 80, opacity: 0, x: "-50%" }}
                animate={{ y: 0, opacity: 1, x: "-50%" }}
                exit={{ y: 80, opacity: 0, x: "-50%" }}
                className="fixed bottom-6 left-1/2 z-40 w-[90%] max-w-sm pointer-events-auto"
              >
                <button
                  onClick={() => setShowCheckout(true)}
                  className="w-full bg-emerald-955/95 backdrop-blur-md text-white px-5 py-4 rounded-[2rem] shadow-2xl flex items-center justify-between border border-white/10 hover:scale-[1.02] transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="bg-emerald-700 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-inner">
                      {cart.length}
                    </span>
                    <span className="font-extrabold text-[11px] uppercase tracking-wider">Crops selected in cart</span>
                  </div>
                  <span className="font-black text-xs text-emerald-350">Checkout →</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

        </main>


      </div>



      {/* Checkout Modal */}
      <AnimatePresence>
        {showCheckout && (
          <div className="fixed inset-0 flex items-center justify-center z-[9999] px-4 pointer-events-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#0a1912]/45 backdrop-blur-md"
              onClick={() => setShowCheckout(false)}
            />
            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white/95 backdrop-blur-lg rounded-[2.2rem] p-6 max-w-md w-full shadow-[0_30px_70px_-15px_rgba(10,25,18,0.35)] border border-white/50 relative z-10"
            >
              <div className="flex justify-between items-center mb-5 border-b border-[#EFEBE3]/60 pb-4">
                <div>
                  <h3 className="font-black text-[17px] text-emerald-955 tracking-tight">{t("seeds.checkout", "Secure Checkout")}</h3>
                  <p className="text-[10px] text-gray-400 font-bold mt-1">Vetted high germination index guarantee</p>
                </div>
                <button 
                  onClick={() => setShowCheckout(false)} 
                  className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 mb-6 max-h-56 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center bg-[#FCFBF8] p-3 rounded-2xl border border-emerald-500/5">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{item.cropIcon}</span>
                      <div>
                        <span className="font-black text-xs text-emerald-955 block">{item.name}</span>
                        <span className="text-[9px] text-gray-400 font-bold">₹{item.price} • Grade-A Cert</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)} 
                      className="text-red-500 hover:text-red-700 text-lg font-bold px-2 cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                ))}
                
                <div className="flex justify-between items-center border-t border-[#EFEBE3]/60 pt-4 mt-3">
                  <span className="font-extrabold text-xs text-gray-400 uppercase tracking-wide">Total Order Cost</span>
                  <span className="font-black text-lg text-emerald-800">
                    ₹{cart.reduce((acc, item) => acc + Number(item.price), 0)}
                  </span>
                </div>
              </div>

              <PayPalCheckout
                amount={cart.reduce((acc, item) => acc + Number(item.price), 0)}
                onSuccess={async () => {
                  await saveOrder();
                  alert(t("seeds.orderSuccess", "Order placed successfully! Transaction verified."));
                  setCart([]);
                  setShowCheckout(false);
                }}
              />

              <button
                onClick={() => setShowCheckout(false)}
                className="mt-4 w-full py-2.5 text-gray-400 hover:text-gray-600 transition-all text-xs font-black uppercase tracking-wider cursor-pointer"
              >
                Cancel Checkout
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Seeds;

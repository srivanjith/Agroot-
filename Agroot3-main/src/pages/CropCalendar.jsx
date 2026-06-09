import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Crop calendar data by season ───────────────────────────────────────────
const CROP_CALENDAR = {
    kharif: [
        { crop: "Rice", emoji: "🌾", sow: [5, 6], grow: [7, 8], harvest: [9, 10], soil: ["Alluvial", "Red Laterite"] },
        { crop: "Cotton", emoji: "🌿", sow: [4, 5], grow: [6, 8], harvest: [9, 11], soil: ["Black Cotton", "Regur (Black)"] },
        { crop: "Maize", emoji: "🌽", sow: [5, 6], grow: [7, 8], harvest: [9, 9], soil: ["Alluvial", "Laterite"] },
        { crop: "Groundnut", emoji: "🥜", sow: [5, 6], grow: [7, 8], harvest: [9, 10], soil: ["Red Sandy", "Laterite"] },
        { crop: "Soybean", emoji: "🌱", sow: [6, 6], grow: [7, 8], harvest: [9, 10], soil: ["Regur (Black)", "Black Cotton"] },
        { crop: "Bajra", emoji: "🌾", sow: [6, 7], grow: [8, 9], harvest: [10, 10], soil: ["Desert Sandy"] },
    ],
    rabi: [
        { crop: "Wheat", emoji: "🌾", sow: [10, 11], grow: [12, 1], harvest: [2, 3], soil: ["Alluvial"] },
        { crop: "Mustard", emoji: "🌼", sow: [9, 10], grow: [11, 12], harvest: [1, 2], soil: ["Alluvial", "Desert Sandy"] },
        { crop: "Chickpea", emoji: "🫘", sow: [10, 10], grow: [11, 12], harvest: [1, 2], soil: ["Alluvial", "Black Cotton"] },
        { crop: "Barley", emoji: "🌿", sow: [10, 10], grow: [11, 12], harvest: [2, 2], soil: ["Alluvial"] },
        { crop: "Peas", emoji: "🫛", sow: [10, 11], grow: [12, 1], harvest: [2, 2], soil: ["Alluvial", "Mountain"] },
    ],
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const SOIL_DB = {
    "Tamil Nadu": "Red Laterite", "Kerala": "Laterite", "Karnataka": "Red & Black",
    "Andhra Pradesh": "Black Cotton", "Telangana": "Red Sandy", "Maharashtra": "Regur (Black)",
    "Gujarat": "Alluvial", "Rajasthan": "Desert Sandy", "Uttar Pradesh": "Alluvial",
    "Punjab": "Alluvial", "West Bengal": "Alluvial", "Bihar": "Alluvial",
};

// Returns the colour class for a month cell given whether it's sow/grow/harvest
const getCellStyle = (monthIdx, sow, grow, harvest) => {
    const m = monthIdx; // 0-indexed
    const inRange = (range) => {
        if (!range || range.length < 2) return false;
        const [s, e] = range;
        if (s <= e) return m >= s && m <= e;
        return m >= s || m <= e; // wraps year (e.g. Dec–Jan)
    };
    if (inRange(harvest.map(x => x - 1))) return "bg-orange-400 text-white";
    if (inRange(grow.map(x => x - 1))) return "bg-yellow-300 text-yellow-900";
    if (inRange(sow.map(x => x - 1))) return "bg-green-500 text-white";
    return "bg-gray-100 text-gray-300";
};

const CropCalendar = () => {
    const [tab, setTab] = useState("kharif");
    const [soilType, setSoilType] = useState("Alluvial");
    const [cityName, setCityName] = useState("");
    const [locationLoading, setLocationLoading] = useState(true);
    const [myPlan, setMyPlan] = useState(() => {
        try { return JSON.parse(localStorage.getItem("agroot_crop_plan") || "[]"); } catch { return []; }
    });
    const [showAddForm, setShowAddForm] = useState(false);
    const [newEntry, setNewEntry] = useState({ crop: "", month: "June", note: "" });
    const currentMonth = new Date().getMonth(); // 0-indexed

    useEffect(() => {
        if (!navigator.geolocation) { setLocationLoading(false); return; }
        navigator.geolocation.getCurrentPosition(
            async ({ coords: { latitude, longitude } }) => {
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
                    const data = await res.json();
                    const state = data.address?.state || "";
                    const city = data.address?.city || data.address?.town || state;
                    setCityName(city);
                    const key = Object.keys(SOIL_DB).find(k =>
                        state.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(state.toLowerCase())
                    );
                    if (key) setSoilType(SOIL_DB[key]);
                } catch { /* silent */ }
                setLocationLoading(false);
            },
            () => setLocationLoading(false)
        );
    }, []);

    const crops = CROP_CALENDAR[tab];

    // Highlight crops relevant to detected soil
    const isRelevant = (crop) => crop.soil.some(s => soilType.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(soilType.toLowerCase()));

    const saveEntry = () => {
        if (!newEntry.crop.trim()) return;
        const updated = [...myPlan, { ...newEntry, id: Date.now() }];
        setMyPlan(updated);
        localStorage.setItem("agroot_crop_plan", JSON.stringify(updated));
        setShowAddForm(false);
        setNewEntry({ crop: "", month: "June", note: "" });
    };

    const removeEntry = (id) => {
        const updated = myPlan.filter(e => e.id !== id);
        setMyPlan(updated);
        localStorage.setItem("agroot_crop_plan", JSON.stringify(updated));
    };

    return (
        <div className="min-h-screen w-full bg-green-50 font-sans text-gray-800">

            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-700 text-white px-5 py-6 rounded-b-[2.5rem] shadow-xl relative overflow-hidden"
            >
                <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => window.history.back()} className="p-2 rounded-full hover:bg-white/10 transition-colors">←</button>
                        <div>
                            <h1 className="text-xl font-bold">📅 Crop Calendar</h1>
                            <p className="text-green-200 text-xs mt-0.5">
                                {locationLoading ? "Detecting location..." : cityName ? `📍 ${cityName} · ${soilType} Soil` : `${soilType} Soil`}
                            </p>
                        </div>
                    </div>
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-semibold">{new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</p>
                        <p className="text-green-200 text-xs">{tab === "kharif" ? "Kharif Season" : "Rabi Season"}</p>
                    </div>
                </div>

                {/* Season tabs */}
                <div className="relative z-10 flex gap-2 mt-5">
                    {["kharif", "rabi"].map(s => (
                        <button key={s}
                            onClick={() => setTab(s)}
                            className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 capitalize ${tab === s ? "bg-white text-green-700 shadow-md" : "bg-white/20 text-white hover:bg-white/30"
                                }`}
                        >
                            {s === "kharif" ? "☀️ Kharif" : "❄️ Rabi"}
                        </button>
                    ))}
                </div>
            </motion.header>

            <div className="px-4 md:px-10 py-6 space-y-6">

                {/* Legend */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                    className="flex flex-wrap gap-3 text-xs"
                >
                    {[
                        { color: "bg-green-500", label: "Sowing" },
                        { color: "bg-yellow-300", label: "Growing" },
                        { color: "bg-orange-400", label: "Harvest" },
                        { color: "bg-gray-100", label: "Off Season" },
                    ].map(l => (
                        <div key={l.label} className="flex items-center gap-1.5">
                            <div className={`w-3 h-3 rounded-sm ${l.color}`} />
                            <span className="text-gray-500">{l.label}</span>
                        </div>
                    ))}
                    <div className="flex items-center gap-1.5 ml-auto">
                        <div className="w-3 h-3 rounded-sm bg-blue-200 border border-blue-400" />
                        <span className="text-gray-500">Current Month</span>
                    </div>
                </motion.div>

                {/* Calendar Grid */}
                <div className="bg-white rounded-3xl shadow-sm border border-green-50 overflow-hidden">
                    {/* Month header */}
                    <div className="grid grid-cols-[140px_repeat(12,1fr)] border-b border-gray-100">
                        <div className="px-3 py-3 text-xs text-gray-400 font-semibold">Crop</div>
                        {MONTHS.map((m, i) => (
                            <div key={m} className={`text-center py-3 text-[11px] font-bold ${i === currentMonth ? "bg-blue-50 text-blue-600" : "text-gray-400"}`}>
                                {m}
                            </div>
                        ))}
                    </div>

                    {/* Crop rows */}
                    <AnimatePresence>
                        {crops.map((c, rowIdx) => (
                            <motion.div
                                key={c.crop}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.05 * rowIdx }}
                                className={`grid grid-cols-[140px_repeat(12,1fr)] border-b border-gray-50 last:border-0 ${isRelevant(c) ? "" : "opacity-40"}`}
                            >
                                <div className="flex items-center gap-2 px-3 py-3">
                                    <span className="text-xl">{c.emoji}</span>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">{c.crop}</p>
                                        {isRelevant(c) && <p className="text-[10px] text-green-600 font-bold">✓ Your soil</p>}
                                    </div>
                                </div>
                                {MONTHS.map((_, mi) => (
                                    <div
                                        key={mi}
                                        className={`flex items-center justify-center py-3 text-[10px] font-bold transition-all ${mi === currentMonth ? "ring-1 ring-inset ring-blue-200" : ""
                                            } ${getCellStyle(mi, c.sow, c.grow, c.harvest)}`}
                                    >
                                        {getCellStyle(mi, c.sow, c.grow, c.harvest).includes("green-500") ? "Sow" :
                                            getCellStyle(mi, c.sow, c.grow, c.harvest).includes("yellow") ? "Grow" :
                                                getCellStyle(mi, c.sow, c.grow, c.harvest).includes("orange") ? "Hvst" : ""}
                                    </div>
                                ))}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* My Plan */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-green-50">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-xs uppercase tracking-widest text-green-600 font-bold">📋 My Crop Plan</p>
                        <button
                            onClick={() => setShowAddForm(!showAddForm)}
                            className="px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-full hover:bg-green-700 transition-colors"
                        >
                            + Add Plan
                        </button>
                    </div>

                    <AnimatePresence>
                        {showAddForm && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-4 bg-green-50 rounded-2xl p-4 border border-green-100 space-y-3"
                            >
                                <input
                                    className="w-full bg-white border border-green-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                                    placeholder="Crop name (e.g. Rice)"
                                    value={newEntry.crop}
                                    onChange={e => setNewEntry({ ...newEntry, crop: e.target.value })}
                                />
                                <div className="flex gap-3">
                                    <select
                                        className="flex-1 bg-white border border-green-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                                        value={newEntry.month}
                                        onChange={e => setNewEntry({ ...newEntry, month: e.target.value })}
                                    >
                                        {MONTHS.map(m => <option key={m}>{m}</option>)}
                                    </select>
                                    <input
                                        className="flex-1 bg-white border border-green-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                                        placeholder="Note (optional)"
                                        value={newEntry.note}
                                        onChange={e => setNewEntry({ ...newEntry, note: e.target.value })}
                                    />
                                </div>
                                <button onClick={saveEntry} className="w-full py-2 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-colors">
                                    Save Plan
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {myPlan.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-6">No plans yet. Add your first crop plan above!</p>
                    ) : (
                        <div className="space-y-2">
                            {myPlan.map((entry, i) => (
                                <motion.div
                                    key={entry.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg">🌱</span>
                                        <div>
                                            <p className="font-semibold text-sm text-gray-800">{entry.crop}</p>
                                            <p className="text-xs text-gray-400">{entry.month}{entry.note ? ` · ${entry.note}` : ""}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => removeEntry(entry.id)} className="text-gray-300 hover:text-red-400 transition-colors text-sm">✕</button>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CropCalendar;

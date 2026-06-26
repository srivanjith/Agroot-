import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const CATEGORIES = [
    { name: "Seeds",       emoji: "🌱", bar: "#10b981" },
    { name: "Fertilizer",  emoji: "🧪", bar: "#60a5fa" },
    { name: "Labour",      emoji: "👷", bar: "#facc15" },
    { name: "Equipment",   emoji: "🚜", bar: "#fb923c" },
    { name: "Irrigation",  emoji: "💧", bar: "#22d3ee" },
    { name: "Other",       emoji: "📦", bar: "#9ca3af" },
];

const catColor = (name) => CATEGORIES.find(c => c.name === name) || CATEGORIES[5];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

/* ── Sidebar icons ── */
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

const CostTracker = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [expenses, setExpenses] = useState(() => {
        try { return JSON.parse(localStorage.getItem("agroot_expenses") || "[]"); } catch { return []; }
    });
    const [showForm, setShowForm]     = useState(false);
    const [form, setForm]             = useState({ category: "Seeds", amount: "", date: new Date().toISOString().split("T")[0], note: "" });
    const [filterCat, setFilterCat]   = useState("All");
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const save = (list) => { setExpenses(list); localStorage.setItem("agroot_expenses", JSON.stringify(list)); };

    const addExpense = () => {
        if (!form.amount || isNaN(Number(form.amount))) return;
        save([{ ...form, amount: Number(form.amount), id: Date.now() }, ...expenses]);
        setForm({ category: "Seeds", amount: "", date: new Date().toISOString().split("T")[0], note: "" });
        setShowForm(false);
    };

    const deleteExpense = (id) => { save(expenses.filter(e => e.id !== id)); setDeleteConfirm(null); };

    const total      = expenses.reduce((s, e) => s + e.amount, 0);
    const thisMonth  = expenses.filter(e => new Date(e.date).getMonth() === new Date().getMonth()).reduce((s, e) => s + e.amount, 0);
    const byCategory = CATEGORIES.map(c => ({
        ...c, total: expenses.filter(e => e.category === c.name).reduce((s, e) => s + e.amount, 0),
    })).filter(c => c.total > 0).sort((a, b) => b.total - a.total);
    const biggest = byCategory[0]?.name || "—";
    const maxCat  = byCategory[0]?.total || 1;
    const filtered = filterCat === "All" ? expenses : expenses.filter(e => e.category === filterCat);
    const fmt = (n) => `₹${n.toLocaleString("en-IN")}`;

    const sidebarItems = [
        { label: "Dashboard",    path: "/home" },
        { label: "Fields",       path: "/satellite" },
        { label: "Crops",        path: "/seeds" },
        { label: "Crop Tracker", active: true },
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
                            <span className="font-extrabold text-[12px] tracking-[0.18em] text-emerald-950 uppercase mt-1">AGROOT</span>
                        </div>

                        {/* Nav */}
                        <nav className="space-y-1.5 mt-5">
                            {sidebarItems.map(item => {
                                const isActive = !!item.active;
                                return (
                                    <button key={item.label}
                                        onClick={() => item.path && navigate(item.path)}
                                        className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-[12px] font-extrabold tracking-wide transition-all duration-300 ${
                                            isActive
                                                ? "bg-emerald-50 text-emerald-900 border border-emerald-500/10 shadow-sm"
                                                : "text-gray-400 hover:text-emerald-950 hover:bg-gray-50/50"
                                        }`}>
                                        <span className={`shrink-0 transition-colors ${isActive ? "text-emerald-600" : "text-gray-400"}`}>
                                            {renderSidebarIcon(item.label)}
                                        </span>
                                        <span>{t(`sidebar.${item.label.toLowerCase().replace(/\s+/g, "")}`, item.label)}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* AGROOT AI dock */}
                    <div className="mt-auto border-t border-[#EFEBE3]/60 pt-4 pb-2 flex flex-col items-center gap-3">
                        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                            onClick={() => navigate("/chat")}
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
                <main className="p-5 lg:p-8 space-y-6 pb-32 max-w-4xl mx-auto w-full">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#EFEBE3]/60 pb-5">
                        <div>
                            <h1 className="text-2xl font-black tracking-tight text-emerald-950">💰 {t("sidebar.croptracker", "Crop Tracker")}</h1>
                            <p className="text-xs text-gray-400 font-bold mt-1">Track and analyse your farming expenses</p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                            onClick={() => setShowForm(!showForm)}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1B4332] text-white text-xs font-black shadow-md shadow-emerald-900/20 cursor-pointer border border-emerald-700/40">
                            + Add Expense
                        </motion.button>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { label: "Total",      value: fmt(total),     icon: "💸" },
                            { label: "This Month", value: fmt(thisMonth), icon: "📅" },
                            { label: "Top",        value: biggest,        icon: "📊" },
                        ].map((s, i) => (
                            <motion.div key={s.label}
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}
                                className="bg-white/70 backdrop-blur-xl rounded-3xl p-5 ring-1 ring-black/[0.06] flex flex-col items-center justify-center text-center gap-1"
                                style={{ boxShadow: "0 2px 16px rgba(27,67,50,0.07)" }}>
                                <span className="text-2xl">{s.icon}</span>
                                <p className="font-black text-sm text-[#1B3A2D] mt-1 truncate max-w-full">{s.value}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{s.label}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Add Expense Form */}
                    <AnimatePresence>
                        {showForm && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                className="bg-white/75 backdrop-blur-xl rounded-3xl p-6 ring-1 ring-black/[0.06] space-y-5"
                                style={{ boxShadow: "0 8px 32px rgba(27,67,50,0.08)" }}>

                                <div>
                                    <p className="text-[10px] uppercase tracking-widest font-black text-gray-400 mb-3">Select Category</p>
                                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                        {CATEGORIES.map(c => (
                                            <button key={c.name} onClick={() => setForm({ ...form, category: c.name })}
                                                className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl text-xs font-black transition-all cursor-pointer border ${
                                                    form.category === c.name
                                                        ? "bg-[#1B4332] text-white border-emerald-700/40 shadow-md"
                                                        : "bg-[#F0F4F1] text-[#4A7A5A] border-transparent hover:bg-white"
                                                }`}>
                                                <span className="text-xl">{c.emoji}</span>
                                                <span>{c.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mb-1.5">Amount (₹)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-sm">₹</span>
                                            <input type="number" placeholder="0.00" value={form.amount}
                                                onChange={e => setForm({ ...form, amount: e.target.value })}
                                                className="w-full pl-8 pr-4 py-3 rounded-2xl text-xs outline-none border border-emerald-500/10 focus:border-emerald-500/30 transition-all bg-[#FCFBF8] text-emerald-955 font-bold"/>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mb-1.5">Date</label>
                                        <input type="date" value={form.date}
                                            onChange={e => setForm({ ...form, date: e.target.value })}
                                            className="w-full px-4 py-3 rounded-2xl text-xs outline-none border border-emerald-500/10 focus:border-emerald-500/30 transition-all bg-[#FCFBF8] text-emerald-955 font-bold"/>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mb-1.5">Description</label>
                                    <input placeholder="e.g. Urea 50 kg" value={form.note}
                                        onChange={e => setForm({ ...form, note: e.target.value })}
                                        className="w-full px-4 py-3 rounded-2xl text-xs outline-none border border-emerald-500/10 focus:border-emerald-500/30 transition-all bg-[#FCFBF8] text-emerald-955 font-bold"/>
                                </div>

                                <div className="flex gap-3">
                                    <button onClick={() => setShowForm(false)}
                                        className="flex-1 py-3 rounded-2xl text-xs font-black text-gray-400 border border-[#EFEBE3] hover:bg-gray-50 transition-all cursor-pointer">
                                        Cancel
                                    </button>
                                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={addExpense}
                                        className="flex-1 py-3 rounded-2xl text-white text-xs font-black bg-[#1B4332] hover:bg-[#145C38] shadow-md shadow-emerald-900/20 transition-colors cursor-pointer">
                                        Add Expense
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Spending Breakdown */}
                    {byCategory.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 ring-1 ring-black/[0.06]"
                            style={{ boxShadow: "0 2px 16px rgba(27,67,50,0.07)" }}>
                            <p className="text-[10px] uppercase tracking-widest font-black text-gray-400 mb-4">📊 Spending Breakdown</p>
                            <div className="space-y-3.5">
                                {byCategory.map((c, i) => (
                                    <motion.div key={c.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.07 * i }}>
                                        <div className="flex justify-between items-center mb-1.5">
                                            <span className="text-xs flex items-center gap-2 font-semibold text-gray-700">
                                                <span>{c.emoji}</span>{c.name}
                                            </span>
                                            <span className="text-xs font-black text-[#1B3A2D]">{fmt(c.total)}</span>
                                        </div>
                                        <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                                            <motion.div className="h-1.5 rounded-full" style={{ background: c.bar }}
                                                initial={{ width: 0 }} animate={{ width: `${(c.total / maxCat) * 100}%` }}
                                                transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 + 0.07 * i }}/>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Filter Pills */}
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                        {["All", ...CATEGORIES.map(c => c.name)].map(c => (
                            <button key={c} onClick={() => setFilterCat(c)}
                                className={`flex-none px-4 py-1.5 rounded-full text-[10px] font-black capitalize transition-all duration-200 cursor-pointer select-none ${
                                    filterCat === c ? "bg-[#1B4332] text-white shadow-sm" : "text-[#4A7A5A] bg-[#F0F4F1] border border-[#D6E4DA] hover:bg-white"
                                }`}>
                                {CATEGORIES.find(cat => cat.name === c)?.emoji || "🔘"} {c}
                            </button>
                        ))}
                    </div>

                    {/* Expense List */}
                    <div className="bg-white/70 backdrop-blur-xl rounded-3xl ring-1 ring-black/[0.06] overflow-hidden"
                        style={{ boxShadow: "0 2px 16px rgba(27,67,50,0.07)" }}>
                        {filtered.length === 0 ? (
                            <div className="py-16 text-center">
                                <p className="text-4xl mb-3">💰</p>
                                <p className="text-gray-400 text-sm font-semibold">No expenses yet. Tap <strong className="text-[#1B3A2D]">+ Add Expense</strong> to begin tracking.</p>
                            </div>
                        ) : (
                            <AnimatePresence>
                                {filtered.map((e, i) => {
                                    const cat = catColor(e.category);
                                    const d   = new Date(e.date);
                                    return (
                                        <motion.div key={e.id}
                                            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 10, height: 0 }} transition={{ delay: i * 0.04 }}
                                            className="flex items-center gap-4 px-5 py-4 border-b border-gray-50 last:border-0 hover:bg-emerald-50/30 transition-colors">
                                            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg flex-none bg-emerald-50 border border-emerald-100">
                                                {cat.emoji}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-black text-sm text-[#1B3A2D] truncate">
                                                    {e.category}{e.note ? ` · ${e.note}` : ""}
                                                </p>
                                                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{MONTHS[d.getMonth()]} {d.getDate()}, {d.getFullYear()}</p>
                                            </div>
                                            <p className="font-black text-sm text-emerald-800">{fmt(e.amount)}</p>
                                            {deleteConfirm === e.id ? (
                                                <div className="flex gap-1">
                                                    <button onClick={() => deleteExpense(e.id)} className="text-[10px] px-2.5 py-1 bg-red-500 text-white rounded-xl font-black cursor-pointer">Yes</button>
                                                    <button onClick={() => setDeleteConfirm(null)} className="text-[10px] px-2.5 py-1 bg-gray-100 text-gray-500 rounded-xl font-black cursor-pointer">No</button>
                                                </div>
                                            ) : (
                                                <button onClick={() => setDeleteConfirm(e.id)} className="text-gray-300 hover:text-red-400 transition-colors text-lg flex-none cursor-pointer">✕</button>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        )}
                    </div>

                    {expenses.length > 0 && (
                        <p className="text-center text-[10px] text-gray-400 font-bold pb-2">
                            {filtered.length} expense{filtered.length !== 1 ? "s" : ""} · Total: {fmt(filtered.reduce((s, e) => s + e.amount, 0))}
                        </p>
                    )}
                </main>
            </div>
        </div>
    );
};

export default CostTracker;

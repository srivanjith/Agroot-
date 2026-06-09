import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = [
    { name: "Seeds", emoji: "🌱", color: "bg-green-100 text-green-700", bar: "#22c55e" },
    { name: "Fertilizer", emoji: "🧪", color: "bg-blue-100 text-blue-700", bar: "#60a5fa" },
    { name: "Labour", emoji: "👷", color: "bg-yellow-100 text-yellow-700", bar: "#facc15" },
    { name: "Equipment", emoji: "🚜", color: "bg-orange-100 text-orange-700", bar: "#fb923c" },
    { name: "Irrigation", emoji: "💧", color: "bg-cyan-100 text-cyan-700", bar: "#22d3ee" },
    { name: "Other", emoji: "📦", color: "bg-gray-100 text-gray-700", bar: "#9ca3af" },
];

const catColor = (name) => CATEGORIES.find(c => c.name === name) || CATEGORIES[5];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const CostTracker = () => {
    const [expenses, setExpenses] = useState(() => {
        try { return JSON.parse(localStorage.getItem("agroot_expenses") || "[]"); } catch { return []; }
    });
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ category: "Seeds", amount: "", date: new Date().toISOString().split("T")[0], note: "" });
    const [filterCat, setFilterCat] = useState("All");
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const save = (list) => { setExpenses(list); localStorage.setItem("agroot_expenses", JSON.stringify(list)); };

    const addExpense = () => {
        if (!form.amount || isNaN(Number(form.amount))) return;
        save([{ ...form, amount: Number(form.amount), id: Date.now() }, ...expenses]);
        setForm({ category: "Seeds", amount: "", date: new Date().toISOString().split("T")[0], note: "" });
        setShowForm(false);
    };

    const deleteExpense = (id) => { save(expenses.filter(e => e.id !== id)); setDeleteConfirm(null); };

    const total = expenses.reduce((s, e) => s + e.amount, 0);
    const thisMonth = expenses
        .filter(e => new Date(e.date).getMonth() === new Date().getMonth())
        .reduce((s, e) => s + e.amount, 0);

    const byCategory = CATEGORIES.map(c => ({
        ...c,
        total: expenses.filter(e => e.name === c.name || e.category === c.name).reduce((s, e) => s + e.amount, 0),
    })).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

    const biggest = byCategory[0]?.name || "—";
    const maxCat = byCategory[0]?.total || 1;

    const filtered = filterCat === "All" ? expenses : expenses.filter(e => e.category === filterCat);

    const fmt = (n) => `₹${n.toLocaleString("en-IN")}`;

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

                <div className="relative z-10 flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <button onClick={() => window.history.back()}
                            className="w-9 h-9 rounded-full flex items-center justify-center text-white"
                            style={{ background: "rgba(255,255,255,0.12)" }}>
                            ←
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-white">💰 Cost Tracker</h1>
                            <p className="text-green-300 text-xs">Track your farming expenses</p>
                        </div>
                    </div>
                    <span className="text-white text-xl">🔔</span>
                </div>

                {/* Summary chips */}
                <div className="relative z-10 grid grid-cols-3 gap-2">
                    {[
                        { label: "Total", value: fmt(total), icon: "💸" },
                        { label: "This Month", value: fmt(thisMonth), icon: "📅" },
                        { label: "Top", value: biggest, icon: "📊" },
                    ].map((s, i) => (
                        <motion.div key={s.label}
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.1 }}
                            className="rounded-2xl p-3 text-center"
                            style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.15)" }}>
                            <p className="text-xl mb-0.5">{s.icon}</p>
                            <p className="font-bold text-white text-xs truncate">{s.value}</p>
                            <p className="text-green-300 text-[10px] mt-0.5">{s.label}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.header>

            <div className="px-5 py-5 space-y-4 pb-28">

                {/* Add Expense Form */}
                <AnimatePresence>
                    {showForm && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-white rounded-3xl p-5 shadow-sm overflow-hidden"
                            style={{ border: "1px solid var(--agroot-tan-light)" }}
                        >
                            <p className="text-xs uppercase tracking-widest font-bold mb-4" style={{ color: "var(--agroot-forest)" }}>
                                Select Category
                            </p>

                            {/* Category Grid */}
                            <div className="grid grid-cols-3 gap-3 mb-5">
                                {CATEGORIES.map(c => (
                                    <button
                                        key={c.name}
                                        onClick={() => setForm({ ...form, category: c.name })}
                                        className="flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-all"
                                        style={form.category === c.name ? {
                                            background: "var(--agroot-forest)", color: "#fff"
                                        } : {
                                            background: "var(--agroot-cream)",
                                            border: "1px solid var(--agroot-tan-light)",
                                            color: "#6B7B6B"
                                        }}
                                    >
                                        <span className="text-2xl">{c.emoji}</span>
                                        <span className="text-xs font-semibold">{c.name}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Amount */}
                            <div className="mb-3">
                                <label className="text-xs font-semibold text-gray-400 mb-1.5 block uppercase tracking-wider">Amount</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">₹</span>
                                    <input
                                        type="number"
                                        className="w-full pl-9 pr-4 py-3 rounded-xl text-sm outline-none"
                                        style={{ background: "var(--agroot-cream)", border: "1.5px solid var(--agroot-tan-light)" }}
                                        placeholder="0.00"
                                        value={form.amount}
                                        onChange={e => setForm({ ...form, amount: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Description / Date */}
                            <div className="mb-4">
                                <label className="text-xs font-semibold text-gray-400 mb-1.5 block uppercase tracking-wider">Description</label>
                                <div className="flex gap-2">
                                    <input
                                        className="flex-1 px-4 py-3 rounded-xl text-sm outline-none"
                                        style={{ background: "var(--agroot-cream)", border: "1.5px solid var(--agroot-tan-light)" }}
                                        placeholder="e.g. Urea 50kg"
                                        value={form.note}
                                        onChange={e => setForm({ ...form, note: e.target.value })}
                                    />
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">📅</span>
                                        <input
                                            type="date"
                                            className="pl-9 pr-3 py-3 rounded-xl text-sm outline-none w-36"
                                            style={{ background: "var(--agroot-cream)", border: "1.5px solid var(--agroot-tan-light)" }}
                                            value={form.date}
                                            onChange={e => setForm({ ...form, date: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button onClick={() => setShowForm(false)}
                                    className="flex-1 py-3 rounded-xl text-sm font-semibold transition-colors"
                                    style={{ border: "1px solid var(--agroot-tan-light)", color: "#6B7B6B" }}>
                                    Cancel
                                </button>
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                    onClick={addExpense}
                                    className="flex-1 py-3 rounded-xl text-white text-sm font-bold"
                                    style={{ background: "var(--agroot-forest)" }}>
                                    Add Expense
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Spending Breakdown */}
                {byCategory.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl p-5 shadow-sm"
                        style={{ border: "1px solid var(--agroot-tan-light)" }}>
                        <p className="text-xs uppercase tracking-widest font-bold mb-4" style={{ color: "var(--agroot-forest)" }}>
                            📊 Spending Breakdown
                        </p>
                        <div className="space-y-3">
                            {byCategory.map((c, i) => (
                                <motion.div key={c.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 + i * 0.07 }}>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="text-sm flex items-center gap-2">
                                            <span>{c.emoji}</span>
                                            <span className="font-medium text-gray-700">{c.name}</span>
                                        </span>
                                        <span className="text-sm font-bold" style={{ color: "var(--agroot-forest)" }}>{fmt(c.total)}</span>
                                    </div>
                                    <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--agroot-cream)" }}>
                                        <motion.div
                                            className="h-2 rounded-full"
                                            style={{ background: c.bar }}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(c.total / maxCat) * 100}%` }}
                                            transition={{ duration: 1, ease: "easeOut", delay: 0.2 + i * 0.07 }}
                                        />
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
                            className="flex-none px-4 py-2 rounded-full text-xs font-semibold transition-all"
                            style={filterCat === c ? {
                                background: "var(--agroot-forest)", color: "#fff"
                            } : {
                                background: "#fff", color: "#6B7B6B",
                                border: "1px solid var(--agroot-tan-light)"
                            }}>
                            {CATEGORIES.find(cat => cat.name === c)?.emoji || "🔘"} {c}
                        </button>
                    ))}
                </div>

                {/* Expense List */}
                <div className="bg-white rounded-3xl shadow-sm overflow-hidden"
                    style={{ border: "1px solid var(--agroot-tan-light)" }}>
                    {filtered.length === 0 ? (
                        <div className="py-16 text-center">
                            <p className="text-4xl mb-3">💰</p>
                            <p className="text-gray-400 text-sm">No expenses yet. Tap <strong>+ Add</strong> to begin tracking.</p>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {filtered.map((e, i) => {
                                const cat = catColor(e.category);
                                const d = new Date(e.date);
                                return (
                                    <motion.div key={e.id}
                                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10, height: 0 }} transition={{ delay: i * 0.04 }}
                                        className="flex items-center gap-4 px-5 py-4 transition-colors"
                                        style={{ borderBottom: "1px solid var(--agroot-cream)" }}>
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg flex-none ${cat.color}`}>
                                            {cat.emoji}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm truncate" style={{ color: "#1A2E1A" }}>
                                                {e.category}{e.note ? ` · ${e.note}` : ""}
                                            </p>
                                            <p className="text-xs text-gray-400">{MONTHS[d.getMonth()]} {d.getDate()}, {d.getFullYear()}</p>
                                        </div>
                                        <p className="font-bold text-sm" style={{ color: "var(--agroot-forest)" }}>{fmt(e.amount)}</p>
                                        {deleteConfirm === e.id ? (
                                            <div className="flex gap-1">
                                                <button onClick={() => deleteExpense(e.id)}
                                                    className="text-xs px-2 py-1 bg-red-500 text-white rounded-lg">Yes</button>
                                                <button onClick={() => setDeleteConfirm(null)}
                                                    className="text-xs px-2 py-1 rounded-lg"
                                                    style={{ background: "var(--agroot-cream)", color: "#6B7B6B" }}>No</button>
                                            </div>
                                        ) : (
                                            <button onClick={() => setDeleteConfirm(e.id)}
                                                className="text-gray-300 hover:text-red-400 transition-colors text-sm flex-none">✕</button>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    )}
                </div>

                {expenses.length > 0 && (
                    <p className="text-center text-xs text-gray-400 pb-2">
                        {filtered.length} expense{filtered.length !== 1 ? "s" : ""} · Total: {fmt(filtered.reduce((s, e) => s + e.amount, 0))}
                    </p>
                )}
            </div>

            {/* Floating Add Button */}
            <div className="fixed bottom-20 right-5 z-20">
                <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-5 py-3.5 rounded-full text-white font-bold text-sm shadow-xl"
                    style={{ background: "var(--agroot-forest)" }}>
                    + Add Expense
                </motion.button>
            </div>

            {/* Bottom Nav */}
            <div className="fixed bottom-0 left-0 right-0 h-16 flex items-center justify-around px-6 z-30"
                style={{ background: "rgba(255,250,240,0.95)", backdropFilter: "blur(20px)", borderTop: "1px solid var(--agroot-tan-light)" }}>
                <button onClick={() => window.location.href = "/home"} className="flex flex-col items-center gap-1">
                    <span className="text-xl">🌱</span><span className="text-[10px] text-gray-500">Soil Analysis</span>
                </button>
                <button onClick={() => window.location.href = "/soil"} className="flex flex-col items-center gap-1">
                    <span className="text-xl">📋</span><span className="text-[10px] text-gray-500">Reports</span>
                </button>
                <button onClick={() => window.location.href = "/seeds"} className="flex flex-col items-center gap-1">
                    <span className="text-xl">🌾</span><span className="text-[10px] text-gray-500">Crops</span>
                </button>
            </div>
        </div>
    );
};

export default CostTracker;

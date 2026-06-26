import { useState, useEffect } from "react";
import { db } from "../firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import PayPalCheckout from "./PayPalCheckout";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

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

const Rental = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const user   = JSON.parse(localStorage.getItem("agroot_user"));
  const userId = user?.phone ? `${user.phone}@agroot.local` : "demo";

  const [mode, setMode]         = useState("rent");
  const [machines, setMachines] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("all");
  const [newMachine, setNewMachine] = useState({ name: "", type: "tractor", price: "", image: "", location: "Kottayam", available: true });
  const [rented, setRented]         = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const res   = await fetch("http://localhost:5000/machines");
        const items = await res.json();
        setMachines(items);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchMachines();
  }, []);

  const handleAddMachine = async () => {
    if (!newMachine.name || !newMachine.price) return alert(t("rental.fillDetails"));
    try {
      await fetch("http://localhost:5000/machines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newMachine, ownerId: userId, available: true }),
      });
      alert(t("rental.machineAdded"));
      setNewMachine({ name: "", type: "tractor", price: "", image: "", location: "Kottayam", available: true });
      const res   = await fetch("http://localhost:5000/machines");
      const items = await res.json();
      setMachines(items);
    } catch (e) { console.error(e); alert("Failed to save machine"); }
  };

  const handleRent = (machine) => setRented([...rented, machine]);

  const handlePaymentSuccess = async () => {
    for (const item of rented) {
      await addDoc(collection(db, "rentalBookings"), {
        machineId: item.id, machineName: item.name, userId,
        bookedAt: serverTimestamp(), status: "booked", price: item.price,
      });
    }
    setRented([]); setShowCheckout(false);
    alert("Rentals booked successfully!");
    navigate("/my-rentals");
  };

  const filteredMachines = filter === "all" ? machines : machines.filter(m => m.type === filter);
  const typeEmoji = { tractor: "🚜", harvester: "🌾", tiller: "⚙️", drone: "🚁" };

  const sidebarItems = [
    { label: "Dashboard",    path: "/home" },
    { label: "Fields",       path: "/satellite" },
    { label: "Crops",        path: "/seeds" },
    { label: "Crop Tracker", path: "/costs" },
    { label: "Rentals",      active: true },
    { label: "Alerts",       path: "/alerts" },
    { label: "Reports",      path: "/profile" },
    { label: "Profile",      path: "/profile" },
  ];

  const inputCls = "w-full px-4 py-3 rounded-2xl text-xs outline-none border border-emerald-500/10 focus:border-emerald-500/30 transition-all bg-[#FCFBF8] text-[#1B3A2D] font-semibold";

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
                      isActive ? "bg-emerald-50 text-emerald-900 border border-emerald-500/10 shadow-sm" : "text-gray-400 hover:text-emerald-950 hover:bg-gray-50/50"
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

          {/* Page Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#EFEBE3]/60 pb-5">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-emerald-950">🚜 {t("rental.title")}</h1>
              <p className="text-xs text-gray-400 font-bold mt-1">{t("rental.subtitle")}</p>
            </div>

            {/* Mode Switcher Pill */}
            <div className="flex p-1 rounded-full bg-[#F0F4F1] border border-[#D6E4DA]">
              {["rent", "owner"].map(m => (
                <button key={m} onClick={() => setMode(m)}
                  className={`px-5 py-2 rounded-full text-xs font-black capitalize transition-all cursor-pointer ${
                    mode === m ? "bg-[#1B4332] text-white shadow-md" : "text-[#4A7A5A] hover:text-emerald-900"
                  }`}>
                  {m === "rent" ? t("rental.rentMode") : t("rental.ownerMode")}
                </button>
              ))}
            </div>
          </div>

          {mode === "rent" ? (
            <>
              {/* Filter Pills */}
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                {["all","tractor","harvester","tiller","drone"].map(type => (
                  <button key={type} onClick={() => setFilter(type)}
                    className={`flex-none px-4 py-1.5 rounded-full text-[10px] font-black capitalize transition-all cursor-pointer ${
                      filter === type ? "bg-[#1B4332] text-white shadow-sm" : "text-[#4A7A5A] bg-[#F0F4F1] border border-[#D6E4DA] hover:bg-white"
                    }`}>
                    {type !== "all" && <span className="mr-1">{typeEmoji[type] || "🔧"}</span>}
                    {type === "all" ? "All" : type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>

              {/* Machines Grid */}
              {loading ? (
                <div className="flex items-center justify-center py-24">
                  <div className="w-8 h-8 border-2 border-emerald-200 border-t-emerald-700 rounded-full animate-spin"/>
                </div>
              ) : (
                <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AnimatePresence>
                    {filteredMachines.map((machine, i) => (
                      <motion.div layout key={machine.id}
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.05 }}
                        className="bg-white/70 backdrop-blur-xl rounded-3xl p-5 ring-1 ring-black/[0.06] hover:shadow-md transition-all"
                        style={{ boxShadow: "0 2px 16px rgba(27,67,50,0.07)" }}>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-none text-3xl bg-emerald-50 border border-emerald-100">
                            {machine.image
                              ? <img src={machine.image} alt={machine.name} className="w-full h-full object-cover rounded-2xl"/>
                              : typeEmoji[machine.type] || "🔧"}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-black text-sm text-[#1B3A2D]">{machine.name}</p>
                                <p className="text-[10px] capitalize text-gray-400 mt-0.5 font-semibold">{machine.type}</p>
                              </div>
                              <span className="font-black text-sm text-emerald-800">₹{machine.price}/hr</span>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1 font-semibold">
                              <span>📍</span>{machine.location}
                            </p>
                          </div>
                        </div>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                          onClick={() => handleRent(machine)}
                          className="w-full py-2.5 rounded-2xl text-white font-black text-xs bg-[#1B4332] hover:bg-[#145C38] shadow-md shadow-emerald-900/20 transition-colors cursor-pointer">
                          {t("rental.book")}
                        </motion.button>
                      </motion.div>
                    ))}

                    {filteredMachines.length === 0 && !loading && (
                      <div className="col-span-2 text-center py-20 bg-white/60 rounded-3xl ring-1 ring-black/[0.06]">
                        <p className="text-4xl mb-3">🚜</p>
                        <p className="text-gray-400 text-sm font-semibold">No machines available for this category.</p>
                      </div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* Floating Cart Button */}
              {rented.length > 0 && (
                <motion.div initial={{ y: 100 }} animate={{ y: 0 }}
                  className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20 w-[90%] max-w-sm lg:left-[calc(50%+110px)]">
                  <button onClick={() => setShowCheckout(true)}
                    className="w-full text-white px-6 py-4 rounded-full shadow-2xl shadow-emerald-900/30 flex items-center justify-between bg-[#1B4332] cursor-pointer">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-sm font-black">
                        {rented.length}
                      </span>
                      <span className="font-black text-xs">Items in Cart</span>
                    </div>
                    <span className="font-black text-xs">Checkout →</span>
                  </button>
                </motion.div>
              )}
            </>
          ) : (
            /* Owner Mode */
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 ring-1 ring-black/[0.06] max-w-lg space-y-5"
              style={{ boxShadow: "0 2px 16px rgba(27,67,50,0.07)" }}>
              <div>
                <h2 className="text-sm font-black text-emerald-950 mb-0.5">{t("rental.addMachine")}</h2>
                <p className="text-[10px] text-gray-400 font-bold">List your equipment for other farmers to rent</p>
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mb-1.5">{t("rental.machineName")}</label>
                <input type="text" className={inputCls} placeholder="e.g. John Deere 5050D"
                  value={newMachine.name} onChange={e => setNewMachine({ ...newMachine, name: e.target.value })}/>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mb-1.5">Type</label>
                  <select className={inputCls} value={newMachine.type} onChange={e => setNewMachine({ ...newMachine, type: e.target.value })}>
                    <option value="tractor">Tractor</option>
                    <option value="harvester">Harvester</option>
                    <option value="tiller">Tiller</option>
                    <option value="drone">Drone</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mb-1.5">Price / Hour (₹)</label>
                  <input type="number" className={inputCls} placeholder="800"
                    value={newMachine.price} onChange={e => setNewMachine({ ...newMachine, price: e.target.value })}/>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mb-1.5">Image URL (Optional)</label>
                <input type="text" className={inputCls} placeholder="https://..."
                  value={newMachine.image} onChange={e => setNewMachine({ ...newMachine, image: e.target.value })}/>
              </div>

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleAddMachine}
                className="w-full py-3 rounded-2xl text-white font-black text-xs bg-[#1B4332] hover:bg-[#145C38] shadow-md shadow-emerald-900/20 transition-colors cursor-pointer">
                {t("rental.publish")}
              </motion.button>
            </motion.div>
          )}
        </main>
      </div>

      {/* ── Checkout Modal ── */}
      <AnimatePresence>
        {showCheckout && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center p-4 z-50"
            style={{ background: "rgba(10,25,18,0.45)", backdropFilter: "blur(14px)" }}
            onClick={e => { if (e.target === e.currentTarget) setShowCheckout(false); }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.97, opacity: 0 }}
              className="bg-white/95 backdrop-blur-md rounded-3xl p-7 max-w-md w-full ring-1 ring-black/[0.06]"
              style={{ boxShadow: "0 30px 70px -15px rgba(10,25,18,0.25)" }}>
              <h2 className="text-base font-black text-emerald-950 mb-5">{t("rental.checkout")}</h2>
              <div className="space-y-2 mb-5 max-h-52 overflow-y-auto">
                {rented.map((item, i) => (
                  <div key={i} className="flex justify-between items-center px-4 py-3 rounded-2xl bg-[#F0F4F1]">
                    <span className="font-semibold text-gray-700 text-xs">{item.name}</span>
                    <span className="font-black text-xs text-emerald-800">₹{item.price}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-3 border-t border-[#EFEBE3]">
                  <span className="font-black text-xs text-[#1B3A2D]">Total</span>
                  <span className="font-black text-sm text-emerald-800">₹{rented.reduce((a, i) => a + Number(i.price), 0)}</span>
                </div>
              </div>
              <PayPalCheckout amount={rented.reduce((a, i) => a + Number(i.price), 0)} onSuccess={handlePaymentSuccess}/>
              <button onClick={() => setShowCheckout(false)}
                className="mt-3 w-full py-3 text-gray-400 hover:text-gray-600 transition-colors text-xs font-bold cursor-pointer">
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Rental;
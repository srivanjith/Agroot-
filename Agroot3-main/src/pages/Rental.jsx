import { useState, useEffect } from "react";
import { db } from "../firebase/config";
import { collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";
import PayPalCheckout from "./PayPalCheckout";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";

const Rental = () => {
  const { t } = useTranslation();

  const user = JSON.parse(localStorage.getItem("agroot_user"));
  const userId = user?.phone ? `${user.phone}@agroot.local` : "demo";

  const [mode, setMode] = useState("rent");
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const [newMachine, setNewMachine] = useState({
    name: "", type: "tractor", price: "", image: "", location: "Kottayam", available: true,
  });

  const [rented, setRented] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const response = await fetch("http://localhost:5000/machines");
        const items = await response.json();
        setMachines(items);
      } catch (error) {
        console.error("Error fetching machines:", error);
      }
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
        body: JSON.stringify({ ...newMachine, ownerId: userId, available: true })
      });
      alert(t("rental.machineAdded"));
      setNewMachine({ name: "", type: "tractor", price: "", image: "", location: "Kottayam", available: true });
      const response = await fetch("http://localhost:5000/machines");
      const items = await response.json();
      setMachines(items);
    } catch (error) {
      console.error("Error saving machine:", error);
      alert("Failed to save machine");
    }
  };

  const handleRent = (machine) => setRented([...rented, machine]);

  const handlePaymentSuccess = async () => {
    for (const item of rented) {
      await addDoc(collection(db, "rentalBookings"), {
        machineId: item.id, machineName: item.name, userId,
        bookedAt: serverTimestamp(), status: "booked", price: item.price
      });
    }
    setRented([]); setShowCheckout(false);
    alert("Rentals booked successfully!");
    window.location.href = "/my-rentals";
  };

  const filteredMachines = filter === "all" ? machines : machines.filter(m => m.type === filter);

  const typeEmoji = { tractor: "🚜", harvester: "🌾", tiller: "⚙️", drone: "🚁" };

  return (
    <div className="min-h-screen w-full font-sans flex flex-col" style={{ background: "var(--agroot-cream)" }}>

      {/* ── Header ── */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-none px-5 pt-10 pb-6 relative overflow-hidden"
        style={{ background: "var(--agroot-forest)" }}
      >
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-10" style={{ background: "#fff" }} />

        <div className="relative z-10 flex items-center gap-4 mb-5">
          <button onClick={() => window.history.back()}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white"
            style={{ background: "rgba(255,255,255,0.12)" }}>
            ←
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">{t("rental.title")}</h1>
            <p className="text-green-300 text-xs">{t("rental.subtitle")}</p>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="relative z-10 flex p-1 rounded-full"
          style={{ background: "rgba(255,255,255,0.12)" }}>
          {["rent", "owner"].map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className="flex-1 py-2 rounded-full text-sm font-semibold transition-all capitalize"
              style={mode === m ? { background: "#fff", color: "var(--agroot-forest)" } : { color: "rgba(255,255,255,0.7)" }}>
              {m === "rent" ? t("rental.rentMode") : t("rental.ownerMode")}
            </button>
          ))}
        </div>
      </motion.header>

      <div className="flex-1 px-5 py-5 pb-28">
        {mode === "rent" ? (
          <>
            {/* Filter Chips */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-5">
              {["all", "tractor", "harvester", "tiller", "drone"].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className="flex-none px-4 py-2 rounded-full text-sm font-semibold transition-all capitalize"
                  style={filter === type ? {
                    background: "var(--agroot-forest)", color: "#fff"
                  } : {
                    background: "#fff", color: "#6B7B6B",
                    border: "1px solid var(--agroot-tan-light)"
                  }}
                >
                  {type !== "all" && <span className="mr-1">{typeEmoji[type] || "🔧"}</span>}
                  {type === "all" ? "All" : type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>

            {/* Machines Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 rounded-full animate-spin"
                  style={{ borderColor: "var(--agroot-tan-light)", borderTopColor: "var(--agroot-forest)" }} />
              </div>
            ) : (
              <motion.div layout className="grid grid-cols-1 gap-4">
                <AnimatePresence>
                  {filteredMachines.map((machine, i) => (
                    <motion.div
                      layout key={machine.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-white rounded-3xl p-5 shadow-sm"
                      style={{ border: "1px solid var(--agroot-tan-light)" }}
                    >
                      <div className="flex items-center gap-4">
                        {/* Machine image / emoji */}
                        <div className="w-20 h-20 rounded-2xl flex items-center justify-center flex-none text-4xl"
                          style={{ background: "var(--agroot-cream)" }}>
                          {machine.image
                            ? <img src={machine.image} alt={machine.name} className="w-full h-full object-cover rounded-2xl" />
                            : typeEmoji[machine.type] || "🔧"
                          }
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-bold text-base" style={{ color: "#1A2E1A" }}>{machine.name}</p>
                              <p className="text-xs capitalize text-gray-400 mt-0.5">{machine.type}</p>
                            </div>
                            <span className="font-bold text-sm" style={{ color: "var(--agroot-forest)" }}>
                              ₹{machine.price}/hr
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                            <span>📍</span> {machine.location}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRent(machine)}
                        className="mt-4 w-full py-3 rounded-xl text-white font-semibold text-sm transition-all"
                        style={{ background: "var(--agroot-forest)" }}
                      >
                        {t("rental.book")}
                      </button>
                    </motion.div>
                  ))}

                  {filteredMachines.length === 0 && !loading && (
                    <div className="text-center py-16">
                      <p className="text-4xl mb-3">🚜</p>
                      <p className="text-gray-400 text-sm">No machines available for this category.</p>
                    </div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Floating Cart Button */}
            {rented.length > 0 && (
              <motion.div initial={{ y: 100 }} animate={{ y: 0 }}
                className="fixed bottom-20 left-1/2 -translate-x-1/2 z-20 w-[90%] max-w-sm">
                <button
                  onClick={() => setShowCheckout(true)}
                  className="w-full text-white px-6 py-4 rounded-full shadow-2xl flex items-center justify-between"
                  style={{ background: "var(--agroot-forest)" }}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{ background: "rgba(255,255,255,0.2)" }}>
                      {rented.length}
                    </span>
                    <span className="font-medium">Items in Cart</span>
                  </div>
                  <span className="font-bold">Checkout →</span>
                </button>
              </motion.div>
            )}
          </>
        ) : (
          /* Owner Mode */
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-6 shadow-sm max-w-lg mx-auto"
            style={{ border: "1px solid var(--agroot-tan-light)" }}>
            <h2 className="text-xl font-bold mb-5" style={{ color: "var(--agroot-forest)" }}>{t("rental.addMachine")}</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">{t("rental.machineName")}</label>
                <input type="text"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{ background: "var(--agroot-cream)", border: "1.5px solid var(--agroot-tan-light)" }}
                  value={newMachine.name}
                  onChange={(e) => setNewMachine({ ...newMachine, name: e.target.value })}
                  placeholder="e.g. John Deere 5050D"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Type</label>
                  <select
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{ background: "var(--agroot-cream)", border: "1.5px solid var(--agroot-tan-light)" }}
                    value={newMachine.type}
                    onChange={(e) => setNewMachine({ ...newMachine, type: e.target.value })}
                  >
                    <option value="tractor">Tractor</option>
                    <option value="harvester">Harvester</option>
                    <option value="tiller">Tiller</option>
                    <option value="drone">Drone</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Price / Hour (₹)</label>
                  <input type="number"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{ background: "var(--agroot-cream)", border: "1.5px solid var(--agroot-tan-light)" }}
                    value={newMachine.price}
                    onChange={(e) => setNewMachine({ ...newMachine, price: e.target.value })}
                    placeholder="800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Image URL (Optional)</label>
                <input type="text"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{ background: "var(--agroot-cream)", border: "1.5px solid var(--agroot-tan-light)" }}
                  value={newMachine.image}
                  onChange={(e) => setNewMachine({ ...newMachine, image: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleAddMachine}
                className="w-full py-3.5 rounded-xl text-white font-bold text-sm shadow-lg"
                style={{ background: "var(--agroot-forest)" }}
              >
                {t("rental.publish")}
              </motion.button>
            </div>
          </motion.div>
        )}
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

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-4xl p-7 max-w-md w-full shadow-2xl">
            <h2 className="text-xl font-bold mb-5" style={{ color: "var(--agroot-forest)" }}>{t("rental.checkout")}</h2>
            <div className="space-y-3 mb-5 max-h-52 overflow-y-auto">
              {rented.map((item, i) => (
                <div key={i} className="flex justify-between items-center px-4 py-3 rounded-xl"
                  style={{ background: "var(--agroot-cream)" }}>
                  <span className="font-medium text-gray-700 text-sm">{item.name}</span>
                  <span className="font-bold text-sm" style={{ color: "var(--agroot-forest)" }}>₹{item.price}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-3"
                style={{ borderTop: "1px solid var(--agroot-tan-light)" }}>
                <span className="font-bold">Total</span>
                <span className="font-bold text-lg" style={{ color: "var(--agroot-forest)" }}>
                  ₹{rented.reduce((acc, item) => acc + Number(item.price), 0)}
                </span>
              </div>
            </div>

            <PayPalCheckout amount={rented.reduce((acc, item) => acc + Number(item.price), 0)} onSuccess={handlePaymentSuccess} />

            <button onClick={() => setShowCheckout(false)}
              className="mt-3 w-full py-3 text-gray-400 hover:text-gray-600 transition-colors text-sm font-medium">
              Cancel
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Rental;
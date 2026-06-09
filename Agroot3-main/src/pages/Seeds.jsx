import { useState, useEffect } from "react";
import { db } from "../firebase/config";
import { collection, addDoc, getDocs, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import PayPalCheckout from "./PayPalCheckout";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";

const Seeds = () => {
  const { t } = useTranslation();
  const [seeds, setSeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [seasonFilter, setSeasonFilter] = useState("all");
  const [mode, setMode] = useState("buy");
  const [newSeed, setNewSeed] = useState({ name: "", season: "kharif", description: "", price: "", image: "" });

  // Weather Context (Mocked or from localStorage)
  const [weatherContext, setWeatherContext] = useState(null);

  // Get user info
  const user = JSON.parse(localStorage.getItem("agroot_user"));
  const userId = user?.phone ? `${user.phone}@agroot.local` : "demo";

  useEffect(() => {
    const fetchSeeds = async () => {
      try {
        const response = await fetch("http://localhost:5000/seeds");
        const items = await response.json();
        setSeeds(items);
      } catch (error) {
        console.error("Error fetching seeds:", error);
      }
      setLoading(false);
    };

    fetchSeeds();

    // Check for weather data (rain)
    const isRaining = localStorage.getItem("agroot_rain") === "true";
    if (isRaining) {
      setWeatherContext("It's raining! Consider waiting to sow.");
    }
  }, []);

  const handleAddSeed = async () => {
    if (!newSeed.name || !newSeed.price) return alert("Please fill name and price.");
    try {
      await fetch("http://localhost:5000/seeds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newSeed, ownerId: userId })
      });
      alert("Crop published successfully!");
      setNewSeed({ name: "", season: "kharif", description: "", price: "", image: "" });
      const response = await fetch("http://localhost:5000/seeds");
      const items = await response.json();
      setSeeds(items);
    } catch (error) {
      console.error("Error saving seed:", error);
      alert("Failed to publish crop");
    }
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
  };

  const filteredSeeds = seasonFilter === "all" ? seeds : seeds.filter(s => s.season === seasonFilter || s.season === "all");

  return (
    <div className="min-h-screen w-full bg-green-50 text-gray-800 flex flex-col font-sans">

      {/* Header - Green (Balanced) */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-none bg-green-700 text-white rounded-b-[2.5rem] px-6 md:px-16 py-8 shadow-lg relative overflow-hidden z-10"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button onClick={() => window.history.back()} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
              ←
            </button>
            <div>
              <h1 className="text-2xl font-bold">{t("seeds.title")}</h1>
              <p className="text-sm text-green-100">{t("seeds.subtitle")}</p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex p-1 rounded-full bg-white/20 backdrop-blur-md">
            {["buy", "sell"].map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all capitalize ${
                  mode === m ? "bg-white text-green-800 shadow-md" : "text-white/80 hover:text-white"
                }`}
              >
                {m === "buy" ? "Buy Crops" : "Sell Crops"}
              </button>
            ))}
          </div>
        </div>

        {weatherContext && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-4 bg-white/20 backdrop-blur-md rounded-xl p-3 text-sm flex items-center gap-2 border border-white/20"
          >
            <span>🌧</span> {weatherContext}
          </motion.div>
        )}
      </motion.header>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 md:px-16 py-8">

        {mode === "buy" ? (
          <>
            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-8">
              {["all", "kharif", "rabi", "zaid"].map((season) => (
                <button
                  key={season}
                  onClick={() => setSeasonFilter(season)}
                  className={`px-4 py-2 rounded-full text-sm border transition-all capitalize ${seasonFilter === season
                    ? "bg-green-600 text-white border-green-600 shadow-md"
                    : "bg-white text-green-800 border-green-200 hover:bg-green-50"
                    }`}
                >
                  {season}
                </button>
              ))}
            </div>

            {/* Seeds Grid */}
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-24"
            >
              <AnimatePresence>
                {filteredSeeds.map((seed, i) => (
                  <motion.div
                    layout
                    key={seed.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow border border-green-100 flex flex-col group"
                  >
                    <div className="relative h-40 bg-gray-100 rounded-2xl mb-4 overflow-hidden">
                      {seed.image ? (
                        <img src={seed.image} alt={seed.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl bg-green-50 text-green-200">🌱</div>
                      )}
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-green-800 shadow-sm">
                        ₹{seed.price}/kg
                      </div>
                    </div>

                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-800 mb-1">{seed.name}</h3>
                      <p className="text-xs text-green-600 bg-green-50 inline-block px-2 py-1 rounded-md mb-2 capitalize">{seed.season} Season</p>
                      <p className="text-xs text-gray-500 line-clamp-2">{seed.description}</p>
                    </div>

                    <button
                      onClick={() => addToCart(seed)}
                      className="mt-4 w-full py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition shadow-lg shadow-green-200 active:scale-95"
                    >
                      {t("seeds.addToCart")}
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-6 shadow-sm max-w-lg mx-auto border border-green-100">
            <h2 className="text-xl font-bold mb-5 text-green-800">Publish Crop Input</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Crop Name</label>
                <input type="text"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none bg-green-50 border border-green-200"
                  value={newSeed.name}
                  onChange={(e) => setNewSeed({ ...newSeed, name: e.target.value })}
                  placeholder="e.g. Rice Seeds"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Season</label>
                  <select
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none bg-green-50 border border-green-200"
                    value={newSeed.season}
                    onChange={(e) => setNewSeed({ ...newSeed, season: e.target.value })}
                  >
                    <option value="kharif">Kharif</option>
                    <option value="rabi">Rabi</option>
                    <option value="zaid">Zaid</option>
                    <option value="all">All Seasons</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Price / kg (₹)</label>
                  <input type="number"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none bg-green-50 border border-green-200"
                    value={newSeed.price}
                    onChange={(e) => setNewSeed({ ...newSeed, price: e.target.value })}
                    placeholder="120"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Description</label>
                <textarea
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none bg-green-50 border border-green-200 resize-none h-24"
                  value={newSeed.description}
                  onChange={(e) => setNewSeed({ ...newSeed, description: e.target.value })}
                  placeholder="High yield variety..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Image URL (Optional)</label>
                <input type="text"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none bg-green-50 border border-green-200"
                  value={newSeed.image}
                  onChange={(e) => setNewSeed({ ...newSeed, image: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleAddSeed}
                className="w-full py-3.5 rounded-xl text-white font-bold text-sm bg-green-700 shadow-lg hover:bg-green-800 transition-colors"
              >
                Publish Crop
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Floating Cart Button */}
        {cart.length > 0 && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 w-[90%] md:w-auto"
          >
            <button
              onClick={() => setShowCheckout(true)}
              className="w-full md:w-96 bg-green-900 text-white px-6 py-4 rounded-full shadow-2xl flex items-center justify-between hover:scale-105 transition-transform"
            >
              <div className="flex items-center gap-3">
                <span className="bg-green-700 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                  {cart.length}
                </span>
                <span className="font-medium">Items in Cart</span>
              </div>
              <span className="font-bold">Checkout →</span>
            </button>
          </motion.div>
        )}
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{t("seeds.checkout")}</h2>
            <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
              {cart.map((item, i) => (
                <div key={i} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                  <div>
                    <span className="font-medium text-gray-700 block">{item.name}</span>
                    <span className="text-xs text-gray-400">₹{item.price} x 1kg</span>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700 px-2">×</button>
                </div>
              ))}
              <div className="flex justify-between items-center border-t border-gray-200 pt-3 mt-2">
                <span className="font-bold text-lg">Total</span>
                <span className="font-bold text-xl text-green-800">
                  ₹{cart.reduce((acc, item) => acc + Number(item.price), 0)}
                </span>
              </div>
            </div>

            <PayPalCheckout
              amount={cart.reduce((acc, item) => acc + Number(item.price), 0)}
              onSuccess={async () => {
                await saveOrder();
                alert(t("seeds.orderSuccess"));
                setCart([]);
                setShowCheckout(false);
              }}
            />

            <button
              onClick={() => setShowCheckout(false)}
              className="mt-4 w-full py-3 text-gray-500 hover:text-gray-800 transition text-sm font-medium"
            >
              Cancel
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Seeds;
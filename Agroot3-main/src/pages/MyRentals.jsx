import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";

const MyRentals = () => {
  const { t } = useTranslation();
  const user = JSON.parse(localStorage.getItem("agroot_user"));

  const userId = user?.phone
    ? `${user.phone}@agroot.local`
    : "demo";

  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyRentals = async () => {
    try {
      const q = query(
        collection(db, "rentalBookings"),
        where("userId", "==", userId),
        orderBy("bookedAt", "desc")
      );

      const snap = await getDocs(q);
      setRentals(
        snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      );
    } catch (err) {
      console.error("Failed to fetch rentals", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRentals();
  }, []);

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
              <h1 className="text-2xl font-bold">{t("rentals.title")}</h1>
              <p className="text-sm text-green-100">{t("rentals.subtitle")}</p>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Content */}
      <div className="flex-1 px-6 md:px-16 py-8 container mx-auto">
        <AnimatePresence>
          {rentals.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border border-green-100 rounded-3xl p-12 text-center shadow-sm max-w-lg mx-auto mt-10"
            >
              <div className="text-6xl mb-6 bg-green-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto">🚜</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No Rentals Yet</h3>
              <p className="text-gray-500 mb-8">{t("rentals.empty")}</p>
              <button
                onClick={() => window.location.href = "/rental"}
                className="px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-medium shadow-lg shadow-green-200"
              >
                Browse Equipment
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rentals.map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white border border-green-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-green-50 p-3 rounded-2xl">
                      <span className="text-2xl">🚜</span>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200 uppercase tracking-wider">
                      {r.status || "confirmed"}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-800 mb-1">{r.machineName}</h3>
                  <p className="text-sm text-gray-500 mb-4">{t("rentals.date")}: {r.bookedAt ? new Date(r.bookedAt.seconds * 1000).toLocaleDateString() : "Just now"}</p>

                  <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-sm text-gray-400">Total Paid</span>
                    <span className="text-lg font-bold text-green-700">₹{r.price || "Check history"}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MyRentals;

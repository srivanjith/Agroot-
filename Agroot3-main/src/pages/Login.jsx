import { useState, useEffect } from "react";
import { sendOTP, verifyOTP } from "../firebase/otp";
import { createOrGetUser } from "../firebase/user";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// Helper for generating random particles
const generateParticles = (count) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: i,
    x: Math.random() * 100 - 50, // -50px to 50px
    y: Math.random() * -100 - 50, // -50px to -150px upwards
    duration: Math.random() * 1.5 + 1,
    delay: Math.random() * 0.5,
    size: Math.random() * 6 + 4,
    rotation: Math.random() * 360,
  }));
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [step, setStep] = useState("phone"); // phone | otp
  const [debugLogs, setDebugLogs] = useState(["Ready..."]);
  
  // Animation States
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [particles, setParticles] = useState([]);
  
  const navigate = useNavigate();

  const addLog = (msg) => setDebugLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);

  const checkConnection = async () => {
    addLog("Testing Internet...");
    try {
      const res = await fetch("https://jsonplaceholder.typicode.com/todos/1", { cache: "no-store" });
      if (res.ok) addLog("Internet Check: OK");
      else addLog(`Internet Check: Failed (${res.status})`);
    } catch (e) {
      addLog(`Internet Check: ERROR (${e.message})`);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  // Trigger particle burst when input is grouped/focused
  useEffect(() => {
    if (focusedInput) {
      setParticles(generateParticles(8));
      const timer = setTimeout(() => setParticles([]), 2000);
      return () => clearTimeout(timer);
    }
  }, [focusedInput]);

  const triggerError = (msg) => {
    setIsError(true);
    setTimeout(() => setIsError(false), 600);
    // Optional: we can use a custom beautiful toast here later if needed
  };

  const handleSendOTP = async () => {
    addLog("Send OTP Clicked");
    try {
      if (!email || phone.length !== 10) {
        triggerError("Invalid credentials");
        return;
      }
      await checkConnection();
      await sendOTP(email, addLog);
      setStep("otp");
    } catch (err) {
      triggerError("Failed to send OTP");
      console.error("SEND OTP ERROR:", err);
    }
  };

  const handleVerifyOTP = async () => {
    addLog("Verify OTP Clicked");
    try {
      const result = await verifyOTP(email, otp.join(""), addLog);
      if (!result.success) {
        triggerError("Verification failed");
        return;
      }
      
      try {
        await createOrGetUser({ email: `${phone}@agroot.local`, phone });
        
        // Save user to MySQL backend
        fetch("http://localhost:5000/saveUser", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            uid: email,
            email: email
          })
        }).catch(err => console.error("MySQL Save Error:", err));

      } catch (userErr) {
        addLog(`User Creation Failed: ${userErr.message}`);
      }
      
      localStorage.setItem("agroot_user", JSON.stringify({ phone }));
      
      // Trigger success animation
      setIsSuccess(true);
      setTimeout(() => {
        navigate("/language");
      }, 2500); // Wait for the sprouting animation

    } catch (err) {
      triggerError(err.message || "Verification Failed");
      console.error("VERIFY OTP ERROR:", err);
    }
  };

  // Variants for staggered entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.5 } }
  };

  const childVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 100 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80, damping: 20, delay: 0.1 } }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col font-sans overflow-hidden bg-[#8abf82]">
      
      {/* Dynamic Nature Background (Seamless Loop) */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        
        {/* Layer 1: Sky Gradient (Slow pulse of warmth) */}
        <motion.div 
          className="absolute inset-0"
          animate={{
            background: [
              "linear-gradient(to bottom, #d4f0f0, #fcf4d9)", // Early sunrise
              "linear-gradient(to bottom, #bce6e6, #fae29c)", // Mid morning
              "linear-gradient(to bottom, #d4f0f0, #fcf4d9)"  // Back to sunrise
            ]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Layer 2: Sun/Light Source */}
        <motion.div 
          className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[120vw] h-[60vh] rounded-[100%] bg-[#ffefb3] blur-[100px] opacity-60"
          animate={{
             scale: [1, 1.1, 1],
             opacity: [0.5, 0.7, 0.5]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Layer 3: Distant Hills (Static silhouettes) */}
        <div className="absolute bottom-[40%] w-full h-[30%]">
           <svg className="absolute bottom-0 w-[200%] h-full opacity-30 text-[#6ea36e] fill-current" viewBox="0 0 1440 320" preserveAspectRatio="none">
             <path d="M0,160L80,149.3C160,139,320,117,480,128C640,139,800,181,960,186.7C1120,192,1280,160,1360,144L1440,128L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
           </svg>
        </div>

        {/* Layer 4: Distant Clouds (Infinite horizontal scroll) */}
        <motion.div className="absolute top-[10%] w-[300%] h-[30%] flex opacity-50"
          animate={{ x: ["0%", "-33.33%"] }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        >
          {/* We repeat the cloud pattern 3 times to ensure a seamless wrap */}
          {[0, 1, 2].map((groupIndex) => (
             <div key={groupIndex} className="w-1/3 h-full relative">
                <div className="absolute top-[10%] left-[10%] w-48 h-12 bg-white/60 blur-xl rounded-full" />
                <div className="absolute top-[40%] left-[60%] w-64 h-16 bg-white/70 blur-[24px] rounded-full" />
                <div className="absolute top-[70%] left-[30%] w-32 h-10 bg-white/50 blur-lg rounded-full" />
             </div>
          ))}
        </motion.div>

        {/* Layer 5: Mid-ground Field (Smooth sway) */}
        <div className="absolute bottom-[-10%] w-full h-[60%] overflow-hidden">
           <motion.div className="absolute bottom-0 w-[200%] h-full flex items-end"
             animate={{ x: ["-5%", "-15%", "-5%"] }} // Gentle panning
             transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
           >
             <svg className="w-full h-[80%] text-[#84cc6b] fill-current" viewBox="0 0 1440 320" preserveAspectRatio="none">
               <path d="M0,96L80,112C160,128,320,160,480,176C640,192,800,192,960,186.7C1120,181,1280,160,1360,149.3L1440,139L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
             </svg>
           </motion.div>
        </div>

        {/* Layer 6: Foreground Crops Overlay (Fast sway) */}
        <motion.div
           className="absolute bottom-[-5%] w-[120%] h-[40%] bg-gradient-to-t from-[#4a8a4a] to-transparent opacity-40 blur-sm pointer-events-none"
           animate={{
              x: ["-5%", "0%", "-5%"],
              skewX: [-2, 2, -2] // Wind effect
           }}
           transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Layer 7: Floating Background Particles (Continuous ambient pollen) */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
           {/* Recreating continuous particles using multiple static layers that drift up */}
           {[0, 1].map((layer) => (
              <motion.div key={`ambient-${layer}`} className="absolute w-[200%] h-[200%] -left-1/2"
                initial={{ y: layer === 0 ? "0%" : "100%" }}
                animate={{ y: layer === 0 ? "-100%" : "0%" }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              >
                 {Array.from({length: 15}).map((_, i) => (
                    <div 
                      key={i} 
                      className="absolute rounded-full bg-white/40 blur-[1px]"
                      style={{
                         left: `${Math.random() * 80 + 10}%`,
                         top: `${Math.random() * 80 + 10}%`,
                         width: `${Math.random() * 4 + 2}px`,
                         height: `${Math.random() * 4 + 2}px`,
                         animation: `wobble ${Math.random() * 4 + 3}s ease-in-out infinite alternate`
                      }}
                    />
                 ))}
              </motion.div>
           ))}
           <style>{`
             @keyframes wobble {
               0% { transform: translateX(-10px); }
               100% { transform: translateX(10px); }
             }
           `}</style>
        </div>
      </div>

      {/* Main Content Area */}
      <AnimatePresence>
        {!isSuccess && (
          <motion.div
            className="relative z-10 w-full max-w-md mx-auto h-[100dvh] flex flex-col px-6 py-12"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Top Logo */}
            <motion.div variants={childVariants} className="flex flex-col items-center mt-8">
              <div className="w-20 h-20 rounded-[2rem] flex items-center justify-center backdrop-blur-md shadow-[0_8px_32px_rgba(45,74,62,0.15)] bg-white/40 border border-white/60 mb-4">
                <span className="text-4xl">🪴</span>
              </div>
              <h1 className="text-2xl font-bold text-[#2D4A3E] tracking-tight">Agroot</h1>
              <p className="text-[#4A7A5A] text-sm">Nurturing your growth</p>
            </motion.div>

            <div className="flex-1" />

            {/* Login Card Structure for 9:16 compact view */}
            <motion.div
              variants={cardVariants}
              animate={isError ? { x: [-10, 10, -10, 10, 0] } : {}}
              transition={isError ? { duration: 0.4 } : {}}
              className="w-full rounded-[2.5rem] p-8 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.08)] mb-8 bg-white/60 border border-white/50 relative"
            >
              <h2 className="font-semibold text-xl text-[#2D4A3E] mb-6 tracking-wide">
                {step === "phone" ? "Sow your seeds" : "Verify harvest"}
              </h2>

              <div className="space-y-5 relative">
                {/* Floating Particles container for inputs */}
                <div className="absolute inset-0 pointer-events-none z-50">
                   <AnimatePresence>
                      {particles.map((p) => (
                         <motion.div
                            key={p.id}
                            initial={{ opacity: 1, x: 0, y: 0, scale: 0, rotate: 0 }}
                            animate={{ opacity: 0, x: p.x, y: p.y, scale: 1, rotate: p.rotation }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: p.duration, ease: "easeOut", delay: p.delay }}
                            className="absolute left-1/2 top-1/2 w-2 h-2 rounded-full bg-[#8ABF82]/80"
                            style={{ width: p.size, height: p.size }}
                         />
                      ))}
                   </AnimatePresence>
                </div>

                <motion.div variants={childVariants}>
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full rounded-2xl px-5 py-4 text-sm outline-none transition-all placeholder-[#6A8F6A] text-[#2D4A3E] bg-white/50 focus:bg-white/80 border border-white/60 focus:border-[#8ABF82] shadow-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedInput('email')}
                    onBlur={() => setFocusedInput(null)}
                  />
                </motion.div>

                {step === "phone" && (
                  <motion.div
                    variants={childVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  >
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      className="w-full rounded-2xl px-5 py-4 text-sm outline-none transition-all placeholder-[#6A8F6A] text-[#2D4A3E] bg-white/50 focus:bg-white/80 border border-white/60 focus:border-[#8ABF82] shadow-sm"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      onFocus={() => setFocusedInput('phone')}
                      onBlur={() => setFocusedInput(null)}
                    />
                  </motion.div>
                )}

                {step === "otp" && (
                  <motion.div
                    variants={childVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="flex gap-2 justify-between"
                  >
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        className="w-12 h-14 rounded-2xl text-xl outline-none transition-all text-center font-bold text-[#2D4A3E] bg-white/50 focus:bg-white/90 border border-white/60 focus:border-[#8ABF82] focus:ring-2 focus:ring-[#8ABF82]/50 shadow-sm sm:w-14 sm:h-16"
                        value={otp[index]}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, "");
                          const newOtp = [...otp];
                          
                          if (val) {
                              newOtp[index] = val.slice(-1);
                              setOtp(newOtp);
                              if (index < 5) {
                                  const nextInput = document.getElementById(`otp-${index + 1}`);
                                  if (nextInput) nextInput.focus();
                              }
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Backspace") {
                              const newOtp = [...otp];
                              if (newOtp[index]) {
                                  newOtp[index] = "";
                                  setOtp(newOtp);
                              } else if (index > 0) {
                                  newOtp[index - 1] = "";
                                  setOtp(newOtp);
                                  const prevInput = document.getElementById(`otp-${index - 1}`);
                                  if (prevInput) prevInput.focus();
                              }
                          }
                        }}
                        onFocus={(e) => {
                          setFocusedInput('otp');
                          e.target.select();
                        }}
                        onBlur={() => setFocusedInput(null)}
                        onPaste={(e) => {
                          e.preventDefault();
                          const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
                          if (pasted) {
                              const newOtp = [...otp];
                              for(let i=0; i<pasted.length; i++){
                                if(index + i < 6) newOtp[index + i] = pasted[i];
                              }
                              setOtp(newOtp);
                              const nextIdx = Math.min(index + pasted.length, 5);
                              const nextInput = document.getElementById(`otp-${nextIdx}`);
                              if (nextInput) nextInput.focus();
                          }
                        }}
                      />
                    ))}
                  </motion.div>
                )}

                <motion.div variants={childVariants} className="pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={step === "phone" ? handleSendOTP : handleVerifyOTP}
                    className="w-full block py-4 rounded-2xl text-white font-semibold text-sm shadow-[0_8px_20px_rgba(74,122,90,0.3)] transition-all overflow-hidden relative"
                    style={{
                      background: "linear-gradient(135deg, #4A7A5A 0%, #64CF57 100%)",
                    }}
                  >
                    <span>{step === "phone" ? "CONTINUE" : "VERIFY"}</span>
                  </motion.button>
                </motion.div>

                {step === "otp" && (
                  <motion.button
                    variants={childVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    onClick={() => {
                      setStep("phone");
                      setOtp(["", "", "", "", "", ""]);
                    }}
                    className="w-full py-2 text-sm font-medium text-[#4A7A5A] hover:text-[#2D4A3E] transition-colors"
                  >
                    ← Back to Phone
                  </motion.button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Animation Overlay (Sprouting Plant) */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#e8f3e8]/90 backdrop-blur-sm"
          >
            <motion.div
               animate={{ 
                  scale: [0, 1.2, 1],
                  rotate: [0, -10, 10, 0]
               }}
               transition={{ duration: 1.5, ease: "easeOut" }}
               className="text-7xl drop-shadow-lg"
            >
              🌱
            </motion.div>
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.8 }}
               className="mt-6 text-xl font-bold text-[#2D4A3E]"
            >
               Welcome to Agroot
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Language from "./pages/Language";
import Home from "./pages/Home";
import Rental from "./pages/Rental";
import Seeds from "./pages/Seeds";
import Chatbot from "./pages/Chatbot";
import Weather from "./pages/Weather";
import Soil from "./pages/Soil";
import { AppProvider } from "./context/AppContext";
import MyRentals from "./pages/MyRentals";
import SatelliteView from "./pages/SatelliteView";
import CropCalendar from "./pages/CropCalendar";
import CostTracker from "./pages/CostTracker";

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/language" element={<Language />} />
          <Route path="/home" element={<Home />} />
          <Route path="/rental" element={<Rental />} />
          <Route path="/my-rentals" element={<MyRentals />} />
          <Route path="/seeds" element={<Seeds />} />
          <Route path="/chat" element={<Chatbot />} />
          <Route path="/weather" element={<Weather />} />
          <Route path="/soil" element={<Soil />} />
          <Route path="/satellite" element={<SatelliteView />} />
          <Route path="/calendar" element={<CropCalendar />} />
          <Route path="/costs" element={<CostTracker />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
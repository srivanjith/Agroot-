import { createContext, useContext, useEffect, useState } from "react";
import i18n from "../i18n";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [language, setLanguage] = useState(
    localStorage.getItem("agroot_lang") || "en"
  );

  useEffect(() => {
    localStorage.setItem("agroot_lang", language);
    i18n.changeLanguage(language);
  }, [language]);

  return (
    <AppContext.Provider value={{ language, setLanguage }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
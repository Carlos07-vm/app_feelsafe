import { createContext, useContext, useState } from "react";

const AppContext = createContext();

export function AppProvider({ children }) {

  const [user, setUser] = useState({
    name: "Carlos",
    wellbeing: 85,
    mood: "Feliz",
  });

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
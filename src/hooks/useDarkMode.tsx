import { useCallback, useEffect, useState, createContext, useContext } from "react";

export type DarkModeProps = {
  isDark: boolean;
  toggle: () => void;
  setDark: (dark: boolean) => void;
};

const DarkModeContext = createContext<DarkModeProps>({} as DarkModeProps);

export function DarkModeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setDarkMode] = useState(false);

  const setDark = useCallback((dark: boolean) => {
    setDarkMode(dark);

    if (dark) {
      document.body.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, []);

  const toggle = useCallback(() => {
    setDark(!isDark);
  }, [isDark, setDark]);

  useEffect(() => {
    const dark = localStorage.getItem("theme") === "dark";
    setDark(dark);
  }, [setDark]);

  return (
    <DarkModeContext.Provider value={{ isDark, setDark, toggle }}>
      {children}
    </DarkModeContext.Provider>
  );
}

export function useDarkMode() {
  return useContext(DarkModeContext);
}

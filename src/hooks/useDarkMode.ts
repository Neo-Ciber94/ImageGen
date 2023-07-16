import { useCallback, useEffect } from "react";
import { atom, useAtom } from "jotai";

export type DarkModeProps = {
  isDark: boolean;
  toggle: () => void;
  setDark: (dark: boolean) => void;
};

const darkModeAtom = atom(true);

export function useDarkMode() {
  const [isDark, setDarkMode] = useAtom(darkModeAtom);

  const setDark = useCallback(
    (dark: boolean) => {
      setDarkMode(dark);

      if (dark) {
        document.body.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.body.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
    },
    [setDarkMode]
  );

  const toggle = useCallback(() => {
    setDark(!isDark);
  }, [isDark, setDark]);

  useEffect(() => {
    const dark = localStorage.getItem("theme") === "dark";
    setDark(dark);
  }, [setDark]);

  return { isDark, setDark, toggle };
}

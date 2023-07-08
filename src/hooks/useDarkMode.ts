import { useCallback, useEffect, useState } from "react";

export function useDarkMode() {
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
    }, [])

    const toggle = useCallback(() => {
        setDark(!isDark);
    }, [isDark, setDark])

    useEffect(() => {
        const dark = localStorage.getItem("theme") === "dark";
        setDark(dark);
    }, [setDark])

    return { isDark, setDark, toggle }
}

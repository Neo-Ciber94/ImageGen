import { useCallback, useEffect, useState } from "react";

export function useDarkMode() {
    const [isDark, setIsDark] = useState(false);

    const setDark = useCallback((dark: boolean) => {
        setIsDark(dark);

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
        setIsDark(dark);
    }, [setDark])

    return { isDark, setDark, toggle }
}


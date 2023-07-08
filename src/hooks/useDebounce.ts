import { useState, useEffect, useRef } from "react";

export function useDebounce<T>(val: T, ms: number) {
    const timeoutRef = useRef<number>();
    const [value, setValue] = useState(val);

    useEffect(() => {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = window.setTimeout(() => setValue(val), ms);

        return () => {
            window.clearTimeout(timeoutRef.current);
        }
    }, [ms, val])

    return value;
}
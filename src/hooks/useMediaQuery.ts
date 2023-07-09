import { useEffect, useState } from "react";

export function useMediaQuery(query: string) {
    const [matching, setIsMatching] = useState<boolean>(() => checkMatchQuery(query));

    useEffect(() => {
        const handleResize = () => {
            setIsMatching(checkMatchQuery(query));
        }

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        }
    }, [query])

    return matching;
}

function checkMatchQuery(query: string) {
    return typeof window !== 'undefined' && window.matchMedia(query).matches;
}
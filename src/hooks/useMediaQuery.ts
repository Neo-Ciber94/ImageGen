import { useEffect, useState } from "react";

export function useMediaQuery(query: string) {
    const [matching, setIsMatching] = useState(() => checkMatchQuery(query));

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

    return matching.matches;
}

function checkMatchQuery(query: string) {
    return window.matchMedia(query);
}
import { useEffect, useState } from "react";

export interface UseMediaQueryOptions {
    initialMatching: boolean
}

export function useMediaQuery(query: string, options: UseMediaQueryOptions = { initialMatching: false }) {
    const [matching, setIsMatching] = useState<boolean>(options.initialMatching);

    useEffect(() => {
        const handleResize = (e: MediaQueryListEvent) => {
            const isMatching = e.matches;
            setIsMatching(isMatching);
        }

        const match = window.matchMedia(query);
        handleResize(new MediaQueryListEvent("change", { matches: match.matches }));
        match.addEventListener('change', handleResize);

        return () => {
            match.removeEventListener("change", handleResize);
        }
    }, [query])

    return matching;
}

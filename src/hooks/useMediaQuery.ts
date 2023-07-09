import { useEffect, useState } from "react";

export function useMediaQuery(query: string) {
    const [matching, setIsMatching] = useState<boolean>(false);

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

import { useEffect, useState } from "react";
import { delay } from "~/utils/delay";

interface UseNumberOptions {
    speed: number
}

export function useNumber(n: number, { speed }: UseNumberOptions = { speed: 50 }) {
    if (n < 0) {
        throw new Error("number must positive")
    }

    const [value, setValue] = useState(0);

    useEffect(() => {
        let unmounted = false;

        const run = async () => {
            for (let i = 0; i < n; i++) {
                if (unmounted) {
                    return;
                }

                if (i > 1) {
                    await delay(speed);
                }

                setValue(i + 1);
            }
        }

        void run();

        return () => {
            unmounted = true;
        }
    }, [n, speed])

    return value;
}
import { useState, useEffect } from "react";
import toast, { useToasterStore } from "react-hot-toast";

interface UseLimitedToastOptions {
    id: string;
    max: number;
}

export function useLimitedToaster({ id, max }: UseLimitedToastOptions) {
    const { toasts } = useToasterStore();
    const [toastLimit, setToastLimit] = useState<number>(max);

    useEffect(() => {
        toasts
            .filter((tt) => tt.visible && tt.id === id)
            .filter((_, i) => i >= toastLimit)
            .forEach((tt) => toast.dismiss(tt.id));
    }, [id, toastLimit, toasts]);

    const toast$ = {
        ...toast,
        id,
        setLimit: (l: number) => {
            if (l !== toastLimit) {
                setToastLimit(l);
            }
        },
    };

    return { toast: toast$ };
}
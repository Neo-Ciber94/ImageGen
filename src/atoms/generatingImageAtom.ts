import { atom, useAtom } from "jotai";

// We use this atom to notify when N images are being generated
// and show that same number of placeholders
export const generatingImageAtom = atom(0);

export function useGeneratingImagesCount() {
    return useAtom(generatingImageAtom)[0];
}
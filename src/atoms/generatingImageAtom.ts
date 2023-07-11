import { atom, useAtom } from "jotai";

export const generatingImageAtom = atom(0);

export function useGeneratingImagesCount() {
    return useAtom(generatingImageAtom)[0];
}
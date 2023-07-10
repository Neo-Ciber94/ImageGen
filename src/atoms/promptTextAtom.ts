import { atom, useAtom } from "jotai";
import { useCallback } from "react";

export const generateImageSearchBarAtom = atom({
    text: "",
    loading: false
});

export function useSetRandomPrompt() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [state, setState] = useAtom(generateImageSearchBarAtom);

    const setRandomPrompt = useCallback(() => {
        // We don't set a random prompt if there is already one
        if (state.text.trim().length > 0) {
            return;
        }

        const prompts: string[] = [
            "A fluffy white cat sitting on a pink pillow",
            "A serene mountain landscape with a flowing river",
            "A futuristic cityscape at night with flying cars",
            "A field of sunflowers under a bright blue sky",
            "A cozy cabin nestled in a snowy forest",
            "A vibrant underwater coral reef teeming with marine life",
            "A majestic castle on top of a hill surrounded by mist",
            "A bustling street market with colorful stalls",
            "A magical forest with glowing mushrooms and fairies",
            "A mouthwatering spread of delicious desserts on a table",
        ];

        const text = prompts[Math.floor(Math.random() * prompts.length)] as string;
        setState(p => ({ ...p, text: text }))
    }, [setState, state.text])

    return setRandomPrompt;
}

export function useIsGeneratingImage() {
    const [state] = useAtom(generateImageSearchBarAtom);
    return state.loading;
}

export function usePromptText() {
    const [state] = useAtom(generateImageSearchBarAtom);
    return state.text;
}
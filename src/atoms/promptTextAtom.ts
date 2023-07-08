import { atom, useAtom } from "jotai";
import { useCallback } from "react";

export const promptTextAtom = atom("");

export function useSetSearchTerm() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, setText] = useAtom(promptTextAtom);

    const setRandomSearchTerm = useCallback(() => {
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

        const term = prompts[Math.floor(Math.random() * prompts.length)] as string;
        setText(term);
    }, [setText]);

    return setRandomSearchTerm;
}

export function useSearchText() {
    const [text] = useAtom(promptTextAtom);
    return text;
}
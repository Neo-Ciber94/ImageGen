import * as blurhash from "blurhash";
import blurHashToDataURL from "~/utils/blurHashToDataURL";


export interface UseBase64BlurHashOptions {
    blurHash: string | null | undefined;
    width: number;
    height: number;
    punch?: number;
}

export function useBase64BlurHash({ blurHash, width, height, punch }: UseBase64BlurHashOptions) {
    if (blurHash == null) {
        return null;
    }

    if (blurhash.isBlurhashValid(blurHash).result === false) {
        return null;
    }

    return blurHashToDataURL(blurHash, width, height, punch);
}
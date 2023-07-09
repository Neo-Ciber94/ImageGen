import Color from "color";
import ContrastColor from "contrast-color";
import { FastAverageColor } from "fast-average-color";

export interface GetImageDisplayColorsOptions {
    bgColor?: string;
    fgColor?: string;
}

export interface ImageDisplayColor {
    bgColor: string;
    fgColor: string;
}

export function getImageDisplayColors(img: HTMLImageElement, options?: GetImageDisplayColorsOptions): ImageDisplayColor {
    const fac = new FastAverageColor();
    const cc = new ContrastColor();

    try {
        const averageColor = fac.getColor(img, {
            ignoredColor: [
                [0, 0, 0, 0],
                [255, 255, 255, 255]
            ]
        });
        const bgColor = new Color(averageColor.rgb).saturate(0.5).hex();
        const fgColor = cc.contrastColor({ bgColor });
        return { bgColor, fgColor };
    }
    catch (err) {
        console.error(err);
        return {
            bgColor: options?.bgColor ?? "white",
            fgColor: options?.fgColor ?? "black"
        }
    }
}

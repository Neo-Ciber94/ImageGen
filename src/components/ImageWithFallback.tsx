import { type ImageProps } from "next/dist/shared/lib/get-img-props";
import Image from "next/image";
import { forwardRef, useMemo, useState } from "react";
import { useDarkMode } from "~/hooks/useDarkMode";

const LIGHT_FALLBACK_IMG =
  "https://placehold.co/512x512/CAABFF/000000?text=Not+Found&font=Open%20Sans";

const DARK_FALLBACK_IMG =
  "https://placehold.co/512x512/000000/CAABFF?text=Not+Found&font=Open%20Sans";

export type FallbackImageProps = Omit<ImageProps, "onError"> & {
  fallbackSrc?: string;
};

const ImageWithFallback = forwardRef<HTMLImageElement, FallbackImageProps>(
  function Inner({ src, alt, fallbackSrc, ...rest }, ref) {
    const { isDark } = useDarkMode();
    const fallback = useMemo(() => {
      if (fallbackSrc) {
        return fallbackSrc;
      }

      return isDark ? DARK_FALLBACK_IMG : LIGHT_FALLBACK_IMG;
    }, [fallbackSrc, isDark]);
    const [imgSrc, setImgSrc] = useState(src);

    return (
      <Image
        {...rest}
        ref={ref}
        alt={alt}
        src={imgSrc}
        onError={() => {
          if (imgSrc != fallbackSrc) {
            setImgSrc(fallback);
          }
        }}
      />
    );
  }
);

export default ImageWithFallback;

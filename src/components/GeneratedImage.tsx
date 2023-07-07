import Image from "next/image";
import { useEffect, useState } from "react";

export interface GeneratedImageProps {
  src: string;
}

export default function GeneratedImage({ src }: GeneratedImageProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className="relative cursor-pointer overflow-hidden rounded-lg border 
        border-gray-200/50 shadow-md transition-shadow duration-200 hover:shadow-lg"
      >
        <Image
          className="h-full w-full object-contain "
          alt={src}
          src={src}
          width={512}
          height={512}
        />
      </div>

      {open && <FullscreenImage src={src} onClose={() => setOpen(false)} />}
    </>
  );
}

interface FullscreenImageProps {
  src: string;
  onClose: () => void;
}

function FullscreenImage({ src, onClose }: FullscreenImageProps) {
  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  useEffect(() => {
    const handleKeyEvent = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyEvent);
    return () => {
      window.removeEventListener("keydown", handleKeyEvent);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 h-screen w-full bg-black/70 p-5 backdrop-blur-lg lg:p-10"
      onClick={onClose}
    >
      <div className="relative flex h-full flex-row items-center justify-center">
        <Image
          className="h-auto w-full max-w-[512px]"
          width={0}
          height={0}
          sizes="100vw"
          alt={src}
          src={src}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
}

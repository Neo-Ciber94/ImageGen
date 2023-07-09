import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { MdDelete } from "react-icons/md";
import { type GeneratedImageModel } from "~/server/db/repositories";
import ImageWithFallback from "./ImageWithFallback";
import {
  type ImageDisplayColor,
  getImageDisplayColors,
} from "~/utils/getImageDisplayColors";

type GeneratedImageType = Pick<
  GeneratedImageModel,
  "id" | "prompt" | "createdAt"
> & { url: string };

export interface GeneratedImageProps {
  img: GeneratedImageType;
  onDelete: () => Promise<void>;
}

export default function GeneratedImage({ img, onDelete }: GeneratedImageProps) {
  const [open, setOpen] = useState(false);
  const [displayColors, setDisplayColors] = useState<ImageDisplayColor>();

  return (
    <>
      <div className="relative">
        <div
          onClick={() => setOpen(true)}
          className="group relative cursor-pointer overflow-hidden rounded-lg border 
        border-gray-200/50 shadow-md transition-all duration-200 hover:shadow-lg 
        dark:border-white/10 dark:hover:shadow-violet-400/20"
        >
          <ImageWithFallback
            className="h-full w-full object-contain"
            alt={img.prompt}
            src={img.url}
            width={512}
            height={512}
            onLoad={(e) => {
              const img = e.currentTarget;
              setDisplayColors(getImageDisplayColors(img));
            }}
          />
        </div>
      </div>

      {open &&
        createPortal(
          <FullscreenImage
            url={img.url}
            prompt={img.prompt}
            onDelete={onDelete}
            onClose={() => setOpen(false)}
            displayColors={
              displayColors ?? { bgColor: "black", fgColor: "white" }
            }
          />,
          document.body
        )}
    </>
  );
}

interface FullscreenImageProps {
  url: string;
  prompt: string;
  displayColors: ImageDisplayColor;
  onClose: () => void;
  onDelete: () => Promise<void>;
}

function FullscreenImage({
  url,
  prompt,
  onClose,
  onDelete,
  displayColors,
}: FullscreenImageProps) {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.body.style.marginRight = "16px";

    return () => {
      document.body.style.overflow = "auto";
      document.body.style.marginRight = "0px";
    };
  }, []);

  useEffect(() => {
    const handleKeyEvent = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyEvent);
    return () => {
      window.removeEventListener("keydown", handleKeyEvent);
    };
  }, []);

  const handleDelete = async () => {
    await Promise.resolve(onDelete());
    onClose();
  };

  return (
    <AnimatePresence onExitComplete={onClose}>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-30 h-screen w-full bg-black/70 p-5 backdrop-blur-lg lg:p-10"
          onClick={() => {
            setIsOpen(false);
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              void handleDelete();
            }}
            className="absolute right-10 top-10 z-40"
            title="Delete"
          >
            <MdDelete className="cursor-pointer text-3xl text-red-500 transition-colors duration-200 hover:text-red-700" />
          </button>

          <AnimatePresence>
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              transition={{
                type: "spring",
                duration: 0.3,
              }}
              className="relative flex h-full flex-row items-center justify-center"
            >
              <ImageWithFallback
                className="h-auto w-full max-w-[512px]"
                width={0}
                height={0}
                sizes="100vw"
                alt={prompt}
                src={url}
                onClick={(e) => e.stopPropagation()}
              />
            </motion.div>
          </AnimatePresence>

          <p
            className={`lg:max-fit absolute inset-x-0 bottom-6 left-1/2 max-h-12 w-11/12 
              max-w-[600px] -translate-x-1/2 rotate-1 cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap rounded-xl
              p-2 text-center font-mono text-sm leading-7 shadow-lg
            transition-all duration-200 selection:bg-violet-400 selection:text-white hover:max-h-[400px] hover:whitespace-normal md:w-5/12
            `}
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: displayColors.bgColor,
              color: displayColors.fgColor,
            }}
          >
            {prompt.toLowerCase()}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

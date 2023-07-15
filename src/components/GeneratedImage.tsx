import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { MdDelete } from "react-icons/md";
import { type GeneratedImageModel } from "~/server/db/repositories";
import ImageWithFallback from "./ImageWithFallback";
import {
  type ImageDisplayColor,
  getImageDisplayColors,
} from "~/utils/getImageDisplayColors";
import { Dialog } from "@headlessui/react";
import toast, { useToasterStore } from "react-hot-toast";

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

  const handleOpen = () => {
    setOpen(true);
  }

  const handleClose = () => {
    setOpen(false);
  }

  return (
    <>
      <div className="relative">
        <div
          onClick={handleOpen}
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

      {open && (
        <PreviewImage
          url={img.url}
          prompt={img.prompt}
          onDelete={onDelete}
          onClose={handleClose}
          displayColors={
            displayColors ?? { bgColor: "black", fgColor: "white" }
          }
        />
      )}
    </>
  );
}

interface PreviewImageProps {
  url: string;
  prompt: string;
  displayColors: ImageDisplayColor;
  onClose: () => void;
  onDelete: () => Promise<void>;
}

function PreviewImage({
  url,
  prompt,
  onClose,
  onDelete,
  displayColors,
}: PreviewImageProps) {
  useLimitedToast(1, "clipboard");
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    onClose();
  };

  const handleDelete = async () => {
    await Promise.resolve(onDelete());
    handleClose();
  };

  return (
    <AnimatePresence onExitComplete={handleClose}>
      {isOpen && (
        <Dialog
          static
          open={isOpen}
          as={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-30 h-screen w-full bg-black/70 px-2 py-5 backdrop-blur-lg sm:px-5 lg:p-10"
          onClose={() => {
            setIsOpen(false);
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              void handleDelete();
            }}
            className="absolute right-10 top-10 z-40 outline-none"
            title="Delete"
          >
            <MdDelete className="cursor-pointer text-3xl text-red-500 transition-colors duration-200 hover:text-red-700" />
          </button>

          <AnimatePresence>
            <Dialog.Panel
              className="relative flex h-full flex-row items-center justify-center"
              as={motion.div}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              transition={{
                type: "spring",
                duration: 0.3,
              }}
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
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

              <p
                className={`lg:max-fit selection-none absolute inset-x-0 -bottom-2 left-1/2 z-50 
              max-h-12 w-full max-w-[600px] -translate-x-1/2 rotate-1 cursor-pointer overflow-hidden 
              text-ellipsis whitespace-nowrap rounded-xl p-0 text-center font-mono text-xs
              leading-7 shadow-lg transition-all duration-200 selection:bg-violet-400
              selection:text-white hover:max-h-[400px] hover:whitespace-normal sm:p-2 sm:text-sm md:w-5/12
            `}
                onClick={(e) => {
                  navigator.clipboard
                    .writeText(prompt)
                    .then(() =>
                      toast.success("Copied to clipboard", {
                        id: "clipboard",
                        icon: "✏️",
                      })
                    )
                    .catch(console.error);

                  e.stopPropagation();
                }}
                style={{
                  backgroundColor: displayColors.bgColor,
                  color: displayColors.fgColor,
                }}
              >
                {prompt.toLowerCase()}
              </p>
            </Dialog.Panel>
          </AnimatePresence>
        </Dialog>
      )}
    </AnimatePresence>
  );
}

const useLimitedToast = (max: number, id: string) => {
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
};

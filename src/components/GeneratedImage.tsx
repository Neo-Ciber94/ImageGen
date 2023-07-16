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
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { useLimitedToaster } from "~/hooks/useLimitedToaster";
import { GENERATED_IMAGE_SIZE } from "~/common/constants";
import { useBase64BlurHash } from "~/hooks/useBase64BlurHash";

type GeneratedImageType = Pick<
  GeneratedImageModel,
  "id" | "prompt" | "createdAt" | "blurHash"
> & { url: string };

export interface GeneratedImageProps {
  img: GeneratedImageType;
  onDelete: () => Promise<void>;
}

export default function GeneratedImage({ img, onDelete }: GeneratedImageProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [displayColors, setDisplayColors] = useState<ImageDisplayColor>();

  const handleOpen = () => {
    // We assign the id of the image to the url which is later to open the modal for that image
    window.location.hash = `img-${img.id}`;
  };

  const handleClose = () => {
    // For close we check if there is an image id, in that case we just go back,
    // otherwise we try to close the modal anyway
    if (getImageUrlHashId() != null && open) {
      router.back();
    } else {
      setOpen(false);
    }
  };

  useEffect(() => {
    // We control when an image is showing using the URL,
    // this way on mobile devices the back button can be used to close the modal
    // and not only the close button.
    const handleHashChange = () => {
      const imgId = getImageUrlHashId();

      if (imgId === img.id) {
        setOpen(true);
        return;
      }

      // Not matches, attempt to close it if possible
      if (open) {
        setOpen(false);
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [img.id, open]);

  const imgBlurHash = useBase64BlurHash({
    blurHash: img.blurHash,
    width: GENERATED_IMAGE_SIZE,
    height: GENERATED_IMAGE_SIZE,
  });

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
            placeholder={imgBlurHash == null ? "empty" : "blur"}
            blurDataURL={
              imgBlurHash == null
                ? undefined
                : `data:image/png;base64,${imgBlurHash}`
            }
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
          blurHash={img.blurHash}
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
  blurHash: string | null;
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
  blurHash,
}: PreviewImageProps) {
  useLimitedToaster({ id: "clipboard", max: 1 });
  const [isOpen, setIsOpen] = useState(true);

  const imgBlurHash = useBase64BlurHash({
    blurHash: blurHash,
    width: GENERATED_IMAGE_SIZE,
    height: GENERATED_IMAGE_SIZE,
  });

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
                placeholder={imgBlurHash == null ? "empty" : "blur"}
                blurDataURL={
                  imgBlurHash == null
                    ? undefined
                    : `data:image/png;base64,${imgBlurHash}`
                }
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

function getImageUrlHashId() {
  const matches = /img-(\d+)/.exec(window.location.hash);
  if (matches == null) {
    return null;
  }

  const id = Number(matches[1]);
  return Number.isNaN(id) ? null : id;
}

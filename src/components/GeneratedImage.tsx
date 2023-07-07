import Image from "next/image";
import { useEffect, useState } from "react";
import { MdDelete } from "react-icons/md";
import { type GeneratedImageModel } from "~/server/db/repositories";

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

  return (
    <>
      <div className="relative">
        <div
          onClick={() => setOpen(true)}
          className="group relative cursor-pointer overflow-hidden rounded-lg border 
        border-gray-200/50 shadow-md transition-shadow duration-200 hover:shadow-lg"
        >
          <Image
            className="h-full w-full object-contain"
            alt={img.prompt}
            src={img.url}
            width={512}
            height={512}
          />
        </div>
      </div>

      {open && (
        <FullscreenImage
          url={img.url}
          prompt={img.prompt}
          onDelete={onDelete}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

interface FullscreenImageProps {
  url: string;
  prompt: string;
  onClose: () => void;
  onDelete: () => Promise<void>;
}

function FullscreenImage({
  url,
  prompt,
  onClose,
  onDelete,
}: FullscreenImageProps) {
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

  const handleDelete = async () => {
    await Promise.resolve(onDelete());
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-30 h-screen w-full bg-black/70 p-5 backdrop-blur-lg lg:p-10"
      onClick={onClose}
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

      <div className="relative flex h-full flex-row items-center justify-center">
        <Image
          className="h-auto w-full max-w-[512px]"
          width={0}
          height={0}
          sizes="100vw"
          alt={prompt}
          src={url}
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      <p
        className="lg:max-fit absolute inset-x-0 bottom-6 left-1/2 max-h-8 w-10/12 -translate-x-1/2 
      rotate-1 cursor-pointer text-ellipsis rounded-xl bg-white p-2 text-center font-mono
       text-sm transition-all duration-200 selection:bg-violet-400
       selection:text-white hover:max-h-[300px] md:w-fit
      "
        title={prompt}
        onClick={(e) => e.stopPropagation()}
      >
        {prompt.toLowerCase()}
      </p>
    </div>
  );
}

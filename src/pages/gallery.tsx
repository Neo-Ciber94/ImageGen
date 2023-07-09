import Head from "next/head";
import GenerateImageSearchBar from "~/components/GenerateImageSearchBar";
import {
  useIsGeneratingImage,
  useSearchText,
  useSetRandomPrompt,
} from "~/atoms/promptTextAtom";
import { api } from "~/utils/api";
import GeneratedImage from "~/components/GeneratedImage";
import LoadingIndicator from "~/components/LoadingIndicator";
import { toast } from "react-hot-toast";
import { deferred } from "~/utils/promises";
import { useDebounce } from "~/hooks/useDebounce";
import { AnimatePresence, motion } from "framer-motion";
import { AnimatedPage } from "~/components/AnimatedPage";
import { getTRPCValidationError } from "~/utils/getTRPCValidationError";

export default function GalleryPage() {
  const apiContext = api.useContext();
  const setRandomSearchTerm = useSetRandomPrompt();
  const isGenerateImageLoading = useIsGeneratingImage();
  const search = useSearchText();
  const q = useDebounce(search, 1000);
  const {
    data: images,
    isLoading,
    error,
  } = api.images.getAll.useQuery({
    q: q.trim().length === 0 || isGenerateImageLoading ? undefined : q,
  });
  const deleteImage = api.images.deleteImage.useMutation();

  const handleDelete = async (id: number) => {
    const shouldDelete = confirm("Do you want to delete this image?");

    if (!shouldDelete) {
      return;
    }

    const toastPromise = deferred<void>();
    void toast.promise(toastPromise.promise, {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
      error: (err) => err?.message ?? "Something went wrong",
      success: "Image deleted successfully",
      loading: "Deleting...",
    });

    try {
      await deleteImage.mutateAsync({ id });
      await apiContext.images.getAll.invalidate();
      toastPromise.resolve();
    } catch (err) {
      console.error(err);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const trpcError = getTRPCValidationError(err);
      if (trpcError) {
        return toastPromise.reject(trpcError);
      }

      toastPromise.reject(err);
    }
  };

  return (
    <>
      <Head>
        <title>ImageGen | Gallery</title>
      </Head>

      <AnimatedPage>
        <div className="relative p-4">
          <div className={`fixed inset-x-0 z-10 w-full px-2 py-2 md:px-10`}>
            <GenerateImageSearchBar
              afterGenerate={() => {
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
              }}
            />
          </div>

          {isLoading && (
            <div className="w-full p-4 text-center">
              <LoadingIndicator size={25} />
            </div>
          )}

          {error && (
            <p className="text-md mx-auto mt-10 flex w-5/6 flex-row justify-center rounded-md bg-red-300/50 p-4 font-bold text-red-600">
              {error?.message || "Something went wrong"}
            </p>
          )}

          {!isGenerateImageLoading &&
            !isLoading &&
            images &&
            images.length === 0 && (
              <h1
                onClick={() => {
                  setRandomSearchTerm();
                }}
                className="mt-20 flex w-full cursor-pointer select-none flex-row justify-center p-4 
                text-xl text-violet-300 transition duration-200 hover:text-violet-400 sm:text-2xl md:text-4xl"
              >
                No Images found, generate one?
              </h1>
            )}

          <div className="grid grid-flow-row-dense grid-cols-2 gap-2 px-2 pb-2 pt-52 sm:pt-20 md:gap-6 md:px-8 lg:grid-cols-5">
            {images &&
              images.map((data, idx) => {
                return (
                  <AnimatePresence key={data.id}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        type: "sprint",
                        duration: 0.25,
                        delay: 0.08 * idx,
                      }}
                      className={`relative mb-auto ${
                        idx % 3 === 0 ? "col-span-2 row-span-2" : ""
                      }`}
                    >
                      <GeneratedImage
                        img={data}
                        onDelete={() => handleDelete(data.id)}
                      />
                    </motion.div>
                  </AnimatePresence>
                );
              })}
          </div>
        </div>
      </AnimatedPage>
    </>
  );
}

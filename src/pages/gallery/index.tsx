import Head from "next/head";
import GenerateImageSearchBar from "~/components/GenerateImageSearchBar";
import {
  useIsGeneratingImage,
  usePromptText,
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
import { Fragment, useEffect, useMemo } from "react";
import { useInView } from "react-intersection-observer";
import { MdOutlineHideImage } from "react-icons/md";
import { FallingLines } from "react-loader-spinner";
import ScrollToTop from "~/components/ScrollToTop";
import { useGeneratingImagesCount } from "~/atoms/generatingImageAtom";
import { drawImageAsBase64 } from "~/utils/drawImageAsBase64";
import Image from "next/image";

// This is for make SST detect this route as dynamic
export const getServerSideProps = () => {
  return Promise.resolve({ props: {} });
};

export default function GalleryPage() {
  const apiContext = api.useContext();
  const setRandomSearchTerm = useSetRandomPrompt();
  const generatingImageCount = useGeneratingImagesCount();
  const isGenerateImageLoading = useIsGeneratingImage();
  const promptText = usePromptText();
  const search = useDebounce(promptText, 1000);
  const { ref: inViewRef, inView } = useInView();

  const {
    data,
    isLoading,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = api.images.getAll.useInfiniteQuery(
    {
      search:
        search.trim().length === 0 || isGenerateImageLoading
          ? undefined
          : search,
      limit: 10,
    },
    {
      getNextPageParam(lastPage) {
        return lastPage.nextCursor;
      },
    }
  );

  const isEmpty = useMemo(() => {
    const firstPage = data?.pages?.[0];
    return firstPage == null || firstPage.images.length === 0;
  }, [data?.pages]);

  useEffect(() => {
    if (inView && hasNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, inView]);

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

  const placeholderArray = useMemo(
    () => Array.from(Array(generatingImageCount).keys()),
    [generatingImageCount]
  );

  return (
    <>
      <Head>
        <title>ImageGen | Gallery</title>
      </Head>

      <AnimatedPage>
        <div className="relative p-4">
          <div className={`z-10 w-full px-2 py-2 md:px-10`}>
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

          {!isGenerateImageLoading && !isLoading && isEmpty && (
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

          <div className="grid grid-flow-row-dense grid-cols-2 gap-2 px-2 pb-2 pt-6 md:gap-6 md:px-8 lg:grid-cols-5">
            {placeholderArray.map((idx) => (
              <AnimatePresence key={`${idx}-placeholder`}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    type: "sprint",
                    duration: 0.25,
                    delay: 0.08 * idx,
                  }}
                  className={`${idx % 3 === 0 ? "col-span-2 row-span-2" : ""}`}
                >
                  <ImageLoading />
                </motion.div>
              </AnimatePresence>
            ))}

            {data &&
              data.pages.map((page, pageIdx) => {
                return (
                  <Fragment key={pageIdx}>
                    {page.images.map((data, idx) => {
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
                              (idx + generatingImageCount) % 3 === 0
                                ? "col-span-2 row-span-2"
                                : ""
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
                  </Fragment>
                );
              })}
          </div>
        </div>

        <div className="h-20 w-full p-4 text-center">
          {isFetchingNextPage && !isLoading && (
            <div className="flex flex-row items-center justify-center">
              <FallingLines width="50" color=" rgb(139 92 246)" />
            </div>
          )}
        </div>

        <div className="fixed bottom-5 right-5 z-10">
          <ScrollToTop />
        </div>

        <div ref={inViewRef}></div>
      </AnimatedPage>

      {!hasNextPage &&
        search.trim().length === 0 &&
        data &&
        data.pages.length > 2 && (
          <div
            className="flex w-full scale-100 cursor-pointer select-none flex-row items-center justify-center
              gap-4 px-4 pb-8 pt-2 text-xl text-violet-500 opacity-30 transition-all duration-300 active:scale-90 sm:text-3xl"
          >
            <MdOutlineHideImage className="text-5xl" />
            <span>No more images here</span>
          </div>
        )}
    </>
  );
}

function ImageLoading() {
  /**
   * FIXME: I want to make a div behave like an image, but after several tries
   * I decide to just create an image using the canvas and use it.
   */
  const imgBase64 = useMemo(() => drawImageAsBase64(512, 512), []);

  return (
    <div className="h-full w-full">
      <Image
        className="h-full w-full animate-pulse rounded-lg bg-violet-500/30 object-contain"
        src={imgBase64}
        alt="Loading Image"
        width={0}
        height={0}
        sizes="100vw"
      />
    </div>
  );
}
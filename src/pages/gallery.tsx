import Head from "next/head";
import GenerateSearchBar from "~/components/GenerateSearchBar";
import { useSetSearchTerm } from "~/atoms/promptTextAtom";
import { api } from "~/utils/api";
import GeneratedImage from "~/components/GeneratedImage";
import LoadingIndicator from "~/components/LoadingIndicator";
import { toast } from "react-hot-toast";
import { useRef } from "react";
import { deferred } from "~/utils/promises";

export default function GalleryPage() {
  const apiContext = api.useContext();
  const setRandomSearchTerm = useSetSearchTerm();
  const { data: images, isLoading, error } = api.images.getAll.useQuery();
  const lastElementRef = useRef<HTMLDivElement | null>(null);
  const deleteImage = api.images.deleteImage.useMutation();

  const handleDelete = async (id: number) => {
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
      toastPromise.reject(err);
    }
  };

  return (
    <>
      <Head>
        <title>ImageGen | Gallery</title>
      </Head>

      <div className="relative p-4">
        <div className="sticky inset-x-0 top-8 z-10 w-full px-10 py-2">
          <GenerateSearchBar
            afterGenerate={() => {
              if (lastElementRef.current) {
                lastElementRef.current.scrollIntoView({ behavior: "smooth" });
              }
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

        {images && images.length === 0 && (
          <h1
            onClick={() => setRandomSearchTerm()}
            className="mt-20 flex w-full cursor-pointer select-none flex-row justify-center p-4 
          text-2xl text-violet-300 transition duration-200 hover:text-violet-400 md:text-4xl"
          >
            No Images, Want to generate one?
          </h1>
        )}

        <div className="grid  grid-flow-row-dense grid-cols-2 gap-2 px-8 pb-2 pt-6 md:gap-6 lg:grid-cols-5">
          {images &&
            images.map((data, idx) => {
              return (
                <div
                  key={idx}
                  className={`relative mb-auto ${
                    idx % 3 === 0 ? "col-span-2 row-span-2" : ""
                  }`}
                  ref={idx === images.length - 1 ? lastElementRef : undefined}
                >
                  <GeneratedImage
                    img={data}
                    onDelete={() => handleDelete(data.id)}
                  />
                </div>
              );
            })}
        </div>
      </div>
    </>
  );
}

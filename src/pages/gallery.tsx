import Head from "next/head";
import GenerateSearchBar, {
  useSetSearchTerm,
} from "~/components/GenerateSearchBar";
import { api } from "~/utils/api";
import GeneratedImage from "~/components/GeneratedImage";
import LoadingIndicator from "~/components/LoadingIndicator";

export default function GalleryPage() {
  const { data: images, isLoading, error } = api.images.getAll.useQuery();
  const setRandomSearchTerm = useSetSearchTerm();

  return (
    <>
      <Head>
        <title>ImageGen | Gallery</title>
      </Head>

      <div className="relative p-4">
        <div className="sticky inset-x-0 top-8 z-10 w-full px-10 py-2">
          <GenerateSearchBar />
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

        <div className="grid grid-cols-2 gap-2 px-8 pb-2 pt-6 md:gap-6 lg:grid-cols-5">
          {images &&
            images.map((data, idx) => {
              return (
                <div
                  key={idx}
                  className={`relative mb-auto ${
                    idx % 6 === 0 ? "col-span-2" : ""
                  }`}
                >
                  <GeneratedImage src={data.url} />
                </div>
              );
            })}
        </div>
      </div>
    </>
  );
}

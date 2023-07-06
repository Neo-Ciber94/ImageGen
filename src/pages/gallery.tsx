import Head from "next/head";
import GenerateSearchBar from "~/components/GenerateSearchBar";
import { api } from "~/utils/api";
import GeneratedImage from "~/components/GeneratedImage";

export default function GalleryPage() {
  const { data: images, isLoading, error } = api.images.getAll.useQuery();

  return (
    <>
      <Head>
        <title>ImageGen | Gallery</title>
      </Head>

      <div className="relative p-4">
        <div className="sticky inset-x-0 top-8 z-10 w-full px-10 py-2">
          <GenerateSearchBar />
        </div>

        {isLoading && <p>Loading...</p>}
        {error && <p>{error.message}</p>}

        {images && images.length === 0 && (
          <h1 className="flex w-full flex-row justify-center p-4 text-2xl text-violet-400 md:text-4xl">
            No Images, Want to generate one?
          </h1>
        )}

        <div className="grid grid-cols-2 gap-2 px-8 pb-2 pt-6 md:gap-6 lg:grid-cols-5">
          {images &&
            images.map((img, idx) => {
              return (
                <div
                  key={idx}
                  className={`relative mb-auto ${
                    idx % 6 === 0 ? "col-span-2" : ""
                  }`}
                >
                  <GeneratedImage src={img} />
                </div>
              );
            })}
        </div>
      </div>
    </>
  );
}

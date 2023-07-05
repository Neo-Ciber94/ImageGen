/* eslint-disable @next/next/no-img-element */
import Head from "next/head";
import GenerateSearchBar from "~/components/GenerateSearchBar";
import Image from "next/image";
import { api } from "~/utils/api";

const images = Array<string>(21).fill("https://placehold.co/256x256");

export default function Home() {
  return (
    <>
      <Head>
        <title>Image Generator</title>
      </Head>

      <div className="relative p-4">
        <div className="sticky inset-x-0 top-8 z-10 w-full px-10 py-2">
          <GenerateSearchBar />
        </div>

        <div className="grid grid-cols-2 gap-2 px-8 pb-2 pt-6 md:gap-6 lg:grid-cols-4">
          {images.map((img, idx) => {
            return (
              <div
                key={idx}
                className={`relative mb-auto ${
                  idx % 6 === 0 ? "col-span-2" : ""
                }`}
              >
                <img
                  className="h-full w-full object-contain"
                  alt={img}
                  src={img}
                />
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { BsHeart } from "react-icons/bs";
import { AnimatedPage } from "~/components/AnimatedPage";

const BLUR_HASH =
  "data:image/webp;base64,UklGRm4DAABXRUJQVlA4WAoAAAAgAAAAgQAAgQAASUNDUMgBAAAAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADZWUDgggAEAADANAJ0BKoIAggA+7XCvUjOyKaKllJwqcB2JZW7f/Nx9dvitL63rAD2t3vF6uwiTGVPk+9Tj5dYNRNS6Zsgy8lKLPYFQ2QZRaJDe686rkCva48la5NbhkcmYP9ytWDhgwdUaTDFp/+ZNVoRexMPJ1iw6AAD+5/etS3Pa3fl/ZfGEEtLnKiH8RCD1Q8sPzE0ksTvO2NR5Rs44oUNpoedrNNw3fMrd3hHOiei0Pj3rA3Op/iQISphiOx2U7UPwyflwLoIcL9nHSFwut2PuipMPxUk6qT7/SY1GslCx/F7VSKJyyvon0B4tLg6W2rIWxQwO5Vtvur+EGdiB5JzCRLZdFl77SmzDfEzaSgXw0/GEI/4BuSDLj1o29GPb8yE/W8w0oiinAqW/oFW9g+lmZWdyoWIKrl0IvmjufMBHuEZg6ZTckwtcChBH5VR4aSk5/OYOzCgXmVbcXnwd0MrUeO/gyYkcUaF6yK7I4YQHptXJ2xMrbAZtrnAB1pAPpWTPLAAAAA==";

export default function HomePage() {
  const { isSignedIn } = useUser();

  return (
    <>
      <AnimatedPage>
        <div className="mx:mx-20 mx-4 mt-10 flex flex-col justify-center gap-4 p-4 lg:flex-row xl:mx-40">
          <div className="w-full lg:w-5/12">
            <div className="relative mx-auto h-[200px] w-[80vw] rotate-0 overflow-hidden rounded-lg shadow-md md:h-[400px] lg:h-[400px] lg:w-[400px] lg:-rotate-3">
              <Image
                priority
                alt="Abstract 3D Figures"
                src="/images/bg_home.png"
                fill
                className="mx-auto object-cover lg:mx-0"
                placeholder="blur"
                blurDataURL={BLUR_HASH}
              />
            </div>
          </div>
          <div className="w-full p-0 lg:w-7/12 lg:pl-6">
            <h1 className="pt-4 text-xl font-bold text-violet-600 md:text-4xl lg:text-6xl">
              Introducing ImageGen: Unleash Your Visual Creativity
            </h1>

            <p className="py-7 text-justify text-lg text-violet-400">
              Welcome to ImageGen, the ultimate platform for unleashing your
              visual creativity! ImageGen has everything you need to bring your
              imagination to life.
            </p>

            <div className="flex w-full flex-row">
              <Link
                href={isSignedIn ? "/gallery" : "/sign-up"}
                className="ml-auto"
              >
                <button
                  className=" flex flex-row items-center justify-between gap-3 rounded-lg bg-gradient-to-tr from-violet-500
            to-violet-700 px-10 py-3 text-center text-white            
           shadow-lg  transition  duration-200 hover:from-violet-700
           hover:to-violet-500 hover:ring-4 hover:ring-purple-300 active:scale-95 active:from-violet-600 active:to-violet-600"
                >
                  <span>Go to Gallery</span>
                  <BsHeart className="mt-1 text-lg" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </AnimatedPage>
    </>
  );
}

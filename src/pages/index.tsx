import { useUser } from "@clerk/nextjs";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { BsHeart } from "react-icons/bs";

export default function HomePage() {
  const { isSignedIn } = useUser();

  return (
    <>
      <Head>
        <title>ImageGen | Home</title>
      </Head>

      <div className="mx:mx-20 mx-4 mt-10 flex flex-col justify-center gap-4 p-4 lg:flex-row xl:mx-40">
        <div className="w-full lg:w-5/12">
          <div className="relative h-[200px] w-[80vw] rotate-0 overflow-hidden rounded-lg shadow-md md:h-[400px] lg:h-[400px] lg:w-[400px] lg:-rotate-3">
            <Image
              priority
              alt="Abstract 3D Figures"
              src="/images/bg_home.png"
              fill
              className="mx-auto object-cover lg:mx-0"
              placeholder="blur"
              blurDataURL="LmM3xC$[n|xIOssrogWB}XJ*Sdsq"
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
                <span>{isSignedIn ? "Go to Gallery" : "Get me started"}</span>
                <BsHeart className="mt-1 text-lg" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

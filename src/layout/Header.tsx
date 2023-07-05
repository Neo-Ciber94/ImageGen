import { Lato } from "next/font/google";
import Link from "next/link";
import { BiImage } from "react-icons/bi";

const font = Lato({
  weight: ["700"],
  subsets: ["latin"],
});

export default function Header() {
  return (
    <header className="border-b border-gray-300/50 px-4 py-4 text-purple-600 shadow-md">
      <Link href="/" className="flex flex-row items-center">
        <BiImage fontSize={35} className="mr-3" />
        <div
          className="flex flex-row font-mono text-xl font-bold"
          style={font.style}
        >
          Image Generator
        </div>
      </Link>
    </header>
  );
}

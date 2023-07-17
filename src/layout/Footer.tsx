import { BiLogoGithub } from "react-icons/bi";

export const FOOTER_HEIGHT = 80;

export default function Footer() {
  return (
    <footer
      className="flex h-full flex-col items-center justify-center gap-3 border-t p-2 dark:border-t-violet-700"
      style={{
        minHeight: FOOTER_HEIGHT,
      }}
    >
      <div className="gap-4 text-gray-400 dark:text-pink-200">
        <span className="text-xs sm:text-base">
          ImageGen &copy; {new Date().getFullYear()}
        </span>
      </div>

      <a href="https://github.com/Neo-Ciber94/ImageGen" target="_blank">
        <BiLogoGithub className="text-lg text-white" />
      </a>
    </footer>
  );
}

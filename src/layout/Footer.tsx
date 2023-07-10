export const FOOTER_HEIGHT = 80;

export default function Footer() {
  return (
    <footer
      className="flex h-full flex-row items-center justify-center border-t p-2 dark:border-t-violet-700"
      style={{
        minHeight: FOOTER_HEIGHT,
      }}
    >
      <div className=" text-gray-400 dark:text-pink-200">
        <span className="text-xs sm:text-base">
          ImageGen &copy; {new Date().getFullYear()}
        </span>
      </div>
    </footer>
  );
}

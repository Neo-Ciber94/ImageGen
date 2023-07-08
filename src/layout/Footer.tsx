export const FOOTER_HEIGHT = 80;

export default function Footer() {
  return (
    <footer
      className="border-t p-2 dark:border-t-violet-700"
      style={{
        minHeight: FOOTER_HEIGHT,
      }}
    >
      <div className="flex h-full flex-row items-center justify-center text-gray-400">
        <span className="text-md">
          ImageGen &copy; {new Date().getFullYear()}
        </span>
      </div>
    </footer>
  );
}

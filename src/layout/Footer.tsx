export default function Footer() {
  return (
    <footer className="min-h-[80px] border-t p-2">
      <div className="flex h-full flex-row items-center justify-center text-gray-400">
        <span className="text-md">
          Image Generator &copy; {new Date().getFullYear()}
        </span>
      </div>
    </footer>
  );
}

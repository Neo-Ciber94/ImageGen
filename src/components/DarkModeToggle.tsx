import { AnimatePresence, motion } from "framer-motion";
import { type PropsWithChildren } from "react";
import { BsFillSunFill, BsFillMoonFill } from "react-icons/bs";
import { useDarkMode } from "~/hooks/useDarkMode";

export default function DarkModeToggle() {
  const { isDark, toggle } = useDarkMode();

  return (
    <button className="h-8 w-8" onClick={toggle}>
      {isDark ? (
        <RotateOnAppear>
          <BsFillSunFill className="text-2xl text-white" />
        </RotateOnAppear>
      ) : (
        <RotateOnAppear>
          <BsFillMoonFill className="text-2xl" />
        </RotateOnAppear>
      )}
    </button>
  );
}

function RotateOnAppear({ children }: PropsWithChildren) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0.6 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.6 }}
        transition={{
          duration: 0.2,
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

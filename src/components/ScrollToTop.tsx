import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { BiSolidUpArrow } from "react-icons/bi";

export interface ScrollToTopProps {
  threshold?: number;
}

export default function ScrollToTop({ threshold = 100 }: ScrollToTopProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > threshold);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [threshold]);

  const handleClick = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{
            type: "spring",
            bounce: 4,
            damping: 8,
          }}
          className="rounded-full bg-gradient-to-br from-violet-400 to-violet-700 p-4 text-white shadow-lg
          hover:from-violet-500 hover:to-violet-900"
          onClick={handleClick}
        >
          <BiSolidUpArrow className="text-lg" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

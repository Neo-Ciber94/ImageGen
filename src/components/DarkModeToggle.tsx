import { useAnimation, motion } from "framer-motion";
import { BsFillSunFill, BsFillMoonFill } from "react-icons/bs";
import { useDarkMode } from "~/hooks/useDarkMode";
import { useEffect } from "react";

export default function DarkModeToggle() {
  const { isDark, toggle } = useDarkMode();
  const controls = useAnimation();

  useEffect(() => {
    void controls.start({ rotate: isDark ? 360 : 0 });
  }, [isDark, controls]);

  return (
    <button className="h-8 w-8" onClick={toggle}>
      <motion.div
        initial={{ rotate: 0 }}
        animate={controls}
        transition={{ duration: 1 }}
        className="flex items-center justify-center"
      >
        {isDark ? (
          <BsFillSunFill className="text-2xl text-white" />
        ) : (
          <BsFillMoonFill className="text-2xl" />
        )}
      </motion.div>
    </button>
  );
}

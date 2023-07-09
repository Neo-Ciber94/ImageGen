import { AnimatePresence, motion } from "framer-motion";

export interface AnimatedPageProps {
  children: React.ReactNode;
  onExitComplete?: () => void;
}

export function AnimatedPage({ children, onExitComplete }: AnimatedPageProps) {
  return (
    <AnimatePresence onExitComplete={onExitComplete}>
      <motion.div
        initial={{ translateX: -200, opacity: 0 }}
        animate={{ translateX: 0, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

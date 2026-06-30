'use client';

import { type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function FlowPageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        className="flex min-h-full flex-1 flex-col"
        initial={reduceMotion ? { opacity: 1 } : { opacity: 0, x: 22 }}
        animate={{ opacity: 1, x: 0 }}
        exit={reduceMotion ? { opacity: 1 } : { opacity: 0, x: -18 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

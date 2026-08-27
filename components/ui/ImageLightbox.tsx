"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

export function ImageLightbox({
  src,
  alt,
  caption,
  onClose,
}: {
  src: string | null;
  alt: string;
  caption?: string | null;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {src && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={alt}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-6 top-6 flex h-9 w-9 items-center justify-center rounded-md border border-white/20 text-white"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            className="relative max-h-[85vh] w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[4/3] w-full">
              <Image src={src} alt={alt} fill sizes="90vw" className="rounded-md object-contain" />
            </div>
            {caption && <p className="mt-3 text-center font-mono text-sm text-white/70">{caption}</p>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

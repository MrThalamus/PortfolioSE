"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

type Particle = {
  symbol: string;
  angle: number; // starting position around the head, in degrees
  radius: number;
  size: string;
  color: string;
  reverse?: boolean;
  duration: number;
  delay: number;
};

// A drop-shadow keeps every color readable over the photo or the circle.
// Hues are kept away from emerald/sky/blue so nothing blends into the
// circle backdrop (fill: emerald→sky gradient, ring: blue).
const shadow = "[text-shadow:0_1px_4px_rgba(0,0,0,0.7)]";
const AMBER = `text-amber-300 ${shadow}`;
const ROSE = `text-rose-400 ${shadow}`;
const PURPLE = `text-purple-400 ${shadow}`;
const ORANGE = `text-orange-400 ${shadow}`;

const PARTICLES: Particle[] = [
  { symbol: ";", angle: 10, radius: 66, size: "text-lg", color: AMBER, duration: 14, delay: 0 },
  { symbol: "/>", angle: 55, radius: 74, size: "text-lg", color: ROSE, duration: 18, delay: -2, reverse: true },
  { symbol: "?", angle: 100, radius: 62, size: "text-xl", color: PURPLE, duration: 11, delay: -4 },
  { symbol: ":", angle: 150, radius: 70, size: "text-lg", color: ORANGE, duration: 16, delay: -1, reverse: true },
  { symbol: "0", angle: 200, radius: 64, size: "text-lg", color: AMBER, duration: 13, delay: -3 },
  { symbol: "1", angle: 250, radius: 72, size: "text-lg", color: ROSE, duration: 20, delay: -5, reverse: true },
  { symbol: "{", angle: 295, radius: 60, size: "text-xl", color: PURPLE, duration: 15, delay: -6 },
  { symbol: "}", angle: 335, radius: 68, size: "text-xl", color: ORANGE, duration: 17, delay: -2.5, reverse: true },
];

export function HeroAvatar({ avatarUrl, name }: { avatarUrl?: string | null; name: string }) {
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);

  const rotateX = useSpring(0, { stiffness: 200, damping: 20 });
  const rotateY = useSpring(0, { stiffness: 200, damping: 20 });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, shouldReduceMotion ? 0 : 36]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (shouldReduceMotion || !tiltRef.current) return;
    const rect = tiltRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(px * 10);
    rotateX.set(-py * 10);
  }

  function handleMouseLeave() {
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <motion.div
      ref={containerRef}
      className="relative mx-auto h-72 w-60 shrink-0 sm:h-80 sm:w-72"
      style={{ y: parallaxY }}
    >
      {/* breathing glow behind the circle */}
      <motion.div
        className="absolute bottom-0 left-1/2 h-44 w-44 -translate-x-1/2 rounded-full bg-accent/25 blur-2xl sm:h-52 sm:w-52"
        aria-hidden
        animate={shouldReduceMotion ? undefined : { opacity: [0.4, 0.65, 0.4] }}
        transition={shouldReduceMotion ? undefined : { duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* circular backdrop with a contrasting blue edge ring */}
      <div
        className="absolute bottom-0 left-1/2 h-44 w-44 -translate-x-1/2 rounded-full border-4 border-blue-500 sm:h-52 sm:w-52"
        aria-hidden
        style={{ background: "linear-gradient(135deg, var(--color-accent), #38bdf8)" }}
      />

      {avatarUrl ? (
        <>
          {/* code symbols, orbiting continuously around the head */}
          {!shouldReduceMotion && (
            <div className="absolute left-1/2 top-[26%] h-0 w-0" aria-hidden>
              {PARTICLES.map((p, i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ rotate: p.angle }}
                  animate={{ rotate: p.angle + (p.reverse ? -360 : 360) }}
                  transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "linear" }}
                >
                  <div style={{ transform: `translateX(${p.radius}px)` }}>
                    <motion.span
                      className={`block font-mono font-bold ${p.size} ${p.color}`}
                      initial={{ rotate: -p.angle }}
                      animate={{ rotate: -(p.angle + (p.reverse ? -360 : 360)) }}
                      transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "linear" }}
                    >
                      {p.symbol}
                    </motion.span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* photo cutout — taller than the circle, so head/shoulders overflow it */}
          <motion.div
            ref={tiltRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="absolute inset-x-0 bottom-0 h-64 sm:h-72"
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          >
            <Image
              src={avatarUrl}
              alt={name}
              fill
              sizes="288px"
              priority
              className="object-contain object-bottom drop-shadow-2xl"
            />
          </motion.div>
        </>
      ) : (
        <div className="absolute bottom-0 left-1/2 flex h-44 w-44 -translate-x-1/2 items-center justify-center rounded-full bg-background-elevated font-mono text-2xl text-foreground-muted sm:h-52 sm:w-52">
          {getInitials(name)}
        </div>
      )}
    </motion.div>
  );
}

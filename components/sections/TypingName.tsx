"use client";

import { useEffect, useState } from "react";

const HEADING_CLASS = "font-mono text-4xl font-semibold tracking-tight sm:text-5xl";

export function TypingName({ name }: { name: string }) {
  // Starts empty on both server and client (so hydration matches), then
  // types the name forward once and stops — no looping, no deleting.
  // The full name is in the <h1> as real (visually hidden) text from the first
  // server render, so search engines and screen readers get it regardless of
  // animation progress; the typed copy on top is purely visual.
  const [displayed, setDisplayed] = useState("");
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const step = reduced ? name.length : 1;
    let i = 0;
    const interval = setInterval(
      () => {
        i += step;
        setDisplayed(name.slice(0, i));
        if (i >= name.length) {
          clearInterval(interval);
          setFinished(true);
        }
      },
      reduced ? 0 : 55
    );

    return () => clearInterval(interval);
  }, [name]);

  return (
    <div className="relative">
      {/* Reserves the final layout space up front (same font/size/wrapping)
          so typing in shorter substrings doesn't reflow the page below it. */}
      <div className={`${HEADING_CLASS} invisible`} aria-hidden="true">
        {name}
      </div>
      <h1 className={`${HEADING_CLASS} absolute inset-0`}>
        <span className="sr-only">{name}</span>
        <span aria-hidden="true">
          {displayed}
          {!finished && <span className="typing-cursor" />}
        </span>
      </h1>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

type Message = { role: "user" | "assistant"; content: string };

const MAX_INPUT = 500;
const TEASER_DELAY_MS = 2500;
const TEASER_DURATION_MS = 5000;
const TEASER_SEEN_KEY = "chat-teaser-seen";

export function ChatWidget({ name }: { name: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTeaser, setShowTeaser] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const suggestions = [
    `What does ${name} do?`,
    `What's ${name}'s strongest project?`,
    "What tech stack do they use?",
    "How can I get in touch?",
  ];

  // Introduce the assistant shortly after arrival — once per browser session,
  // so it doesn't reappear on every reload.
  useEffect(() => {
    try {
      if (sessionStorage.getItem(TEASER_SEEN_KEY)) return;
    } catch {
      // Storage blocked (private mode etc.) — just show it.
    }
    const showTimer = setTimeout(() => setShowTeaser(true), TEASER_DELAY_MS);
    const hideTimer = setTimeout(() => dismissTeaser(), TEASER_DELAY_MS + TEASER_DURATION_MS);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  function dismissTeaser() {
    setShowTeaser(false);
    try {
      sessionStorage.setItem(TEASER_SEEN_KEY, "1");
    } catch {}
  }

  useEffect(() => {
    if (open) {
      dismissTeaser();
      inputRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || pending) return;

    const history: Message[] = [...messages, { role: "user", content }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setError(null);
    setPending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Something went wrong. Please try again.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let reply = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        reply += decoder.decode(value, { stream: true });
        setMessages([...history, { role: "assistant", content: reply }]);
      }
      if (!reply.trim()) throw new Error("No answer came back. Please try rephrasing.");
    } catch (err) {
      // Drop the empty/partial assistant bubble; keep the question so the
      // conversation still reads naturally when they retry.
      setMessages(history);
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label={`Ask about ${name}`}
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16, scale: shouldReduceMotion ? 1 : 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: shouldReduceMotion ? 0 : 16, scale: shouldReduceMotion ? 1 : 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex h-[min(560px,calc(100dvh-6rem))] w-[calc(100vw-2rem)] origin-bottom-right flex-col overflow-hidden rounded-lg border border-border-default bg-background-elevated shadow-2xl sm:w-96"
          >
            <div className="flex items-center justify-between border-b border-border-default px-4 py-3">
              <div>
                <p className="text-sm font-semibold">Ask about {name}</p>
                <p className="font-mono text-[11px] text-foreground-muted">AI assistant · answers may be imperfect</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="rounded-md p-1 text-foreground-muted transition-colors hover:text-foreground"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
              {messages.length === 0 && (
                <div className="space-y-3">
                  <p className="text-sm text-foreground-muted">
                    Hi! I can answer questions about {name}&apos;s projects, skills, and experience. Try one of these:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => send(s)}
                        className="rounded-full border border-border-default px-3 py-1.5 text-left text-xs transition-colors hover:border-accent hover:text-accent"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                  <div
                    className={
                      m.role === "user"
                        ? "max-w-[85%] rounded-lg bg-accent px-3 py-2 text-sm whitespace-pre-wrap text-accent-foreground"
                        : "max-w-[85%] rounded-lg border border-border-default bg-background px-3 py-2 text-sm whitespace-pre-wrap break-words"
                    }
                  >
                    {m.content || <TypingDots />}
                  </div>
                </div>
              ))}

              {error && <p className="font-mono text-xs text-red-500">{error}</p>}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex gap-2 border-t border-border-default p-3"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={MAX_INPUT}
                placeholder={`Ask something about ${name}…`}
                aria-label="Your question"
                className="min-w-0 flex-1 rounded-md border border-border-default bg-background px-3 py-2 text-sm outline-none focus:border-accent"
              />
              <button
                type="submit"
                disabled={pending || !input.trim()}
                className="rounded-md bg-accent px-3 py-2 font-mono text-sm font-medium text-accent-foreground disabled:opacity-60"
              >
                Send
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTeaser && !open && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8, scale: shouldReduceMotion ? 1 : 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: shouldReduceMotion ? 0 : 8, scale: shouldReduceMotion ? 1 : 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative max-w-[260px] origin-bottom-right rounded-lg border border-border-default bg-background-elevated py-3 pl-4 pr-8 shadow-xl"
          >
            <button type="button" onClick={() => setOpen(true)} className="text-left">
              <span className="block text-sm font-semibold">
                <span aria-hidden="true">👋 </span>Hi! I&apos;m {name}&apos;s AI assistant.
              </span>
              <span className="mt-1 block text-xs text-foreground-muted">
                Ask me anything about {name}&apos;s projects, skills, or experience.
              </span>
            </button>
            <button
              type="button"
              onClick={dismissTeaser}
              aria-label="Dismiss"
              className="absolute right-2 top-2 rounded p-0.5 text-foreground-muted transition-colors hover:text-foreground"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
            {/* Little tail pointing down at the chat button */}
            <span
              aria-hidden="true"
              className="absolute -bottom-1.5 right-6 h-3 w-3 rotate-45 border-b border-r border-border-default bg-background-elevated"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? "Close chat" : `Ask AI about ${name}`}
        className="flex items-center gap-2 rounded-full bg-accent px-4 py-3 font-mono text-sm font-medium text-accent-foreground shadow-lg transition-transform hover:scale-105"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span className="hidden sm:inline">{open ? "Close" : `Ask about ${name}`}</span>
      </button>
    </div>
  );
}

function TypingDots() {
  return (
    <span className="inline-flex gap-1 py-1" aria-label="Thinking">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground-muted"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  );
}

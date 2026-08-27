import { ReactNode } from "react";
import clsx from "clsx";
import { Container } from "./Container";
import { FadeIn } from "./FadeIn";

export function Section({
  id,
  index,
  title,
  eyebrow,
  children,
  className,
}: {
  id: string;
  index: string;
  title: string;
  eyebrow?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={clsx("scroll-mt-20 py-20 sm:py-28", className)}>
      <Container>
        <FadeIn>
          <div className="mb-10 flex items-baseline gap-3 sm:mb-14">
            <span className="font-mono text-sm text-accent">{index}</span>
            <div>
              {eyebrow && (
                <p className="mb-1 font-mono text-xs uppercase tracking-widest text-foreground-muted">
                  {eyebrow}
                </p>
              )}
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                {title}
              </h2>
            </div>
          </div>
        </FadeIn>
        {children}
      </Container>
    </section>
  );
}

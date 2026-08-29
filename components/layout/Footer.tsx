export function Footer({ name }: { name: string }) {
  return (
    <footer className="border-t border-border-default py-8">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-6 text-center font-mono text-xs text-foreground-muted sm:flex-row sm:justify-between">
        <p>All rights reserved © {new Date().getFullYear()} {name}</p>
      </div>
    </footer>
  );
}

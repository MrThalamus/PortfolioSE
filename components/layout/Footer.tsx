export function Footer({ name }: { name: string }) {
  return (
    <footer className="border-t border-border-default py-8">
      <div className="mx-auto max-w-5xl px-6 text-center font-mono text-xs text-foreground-muted">
        <p>All rights reserved © {new Date().getFullYear()} {name}</p>
      </div>
    </footer>
  );
}

"use client";

import { useTransition } from "react";
import { dangerLink } from "./styles";

export function DeleteButton({
  action,
  itemLabel,
  onDeleted,
}: {
  action: () => Promise<void>;
  itemLabel: string;
  onDeleted?: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm(`Delete "${itemLabel}"? This cannot be undone.`)) return;
    startTransition(async () => {
      await action();
      onDeleted?.();
    });
  }

  return (
    <button type="button" onClick={handleClick} disabled={isPending} className={dangerLink}>
      {isPending ? "Deleting…" : "Delete"}
    </button>
  );
}

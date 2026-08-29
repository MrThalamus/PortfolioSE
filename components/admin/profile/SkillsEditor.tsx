"use client";

import { useState } from "react";
import type { SkillGroup } from "@/lib/data";
import { label, input, secondaryButton, dangerLink } from "@/components/admin/styles";

type Row = { category: string; items: string[]; draft: string };

function toRows(groups: SkillGroup[]): Row[] {
  if (groups.length === 0) return [{ category: "", items: [], draft: "" }];
  return groups.map((g) => ({ category: g.category, items: g.items, draft: "" }));
}

export function SkillsEditor({ initialSkills }: { initialSkills: SkillGroup[] }) {
  const [rows, setRows] = useState<Row[]>(toRows(initialSkills));

  function updateCategory(index: number, category: string) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, category } : r)));
  }

  function updateDraft(index: number, draft: string) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, draft } : r)));
  }

  function commitDraft(index: number) {
    setRows((prev) =>
      prev.map((r, i) => {
        if (i !== index) return r;
        const value = r.draft.trim();
        if (!value || r.items.includes(value)) return { ...r, draft: "" };
        return { ...r, items: [...r.items, value], draft: "" };
      })
    );
  }

  function removeItem(rowIndex: number, itemIndex: number) {
    setRows((prev) =>
      prev.map((r, i) => (i === rowIndex ? { ...r, items: r.items.filter((_, j) => j !== itemIndex) } : r))
    );
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  function addRow() {
    setRows((prev) => [...prev, { category: "", items: [], draft: "" }]);
  }

  const serialized: SkillGroup[] = rows
    .filter((r) => r.category.trim())
    .map((r) => ({ category: r.category.trim(), items: r.items }));

  return (
    <div>
      <label className={label}>Skills, grouped by category</label>
      <div className="space-y-4">
        {rows.map((row, i) => (
          <div key={i} className="rounded-md border border-border-default p-3">
            <div className="mb-3 flex flex-wrap gap-3">
              <input
                value={row.category}
                onChange={(e) => updateCategory(i, e.target.value)}
                placeholder="Category (e.g. Languages)"
                className={input + " w-full min-w-0 sm:w-48 sm:shrink-0"}
              />
              <button type="button" onClick={() => removeRow(i)} className={dangerLink + " ml-auto shrink-0"}>
                Remove category
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {row.items.map((item, j) => (
                <span
                  key={item}
                  className="flex items-center gap-1.5 rounded-full border border-border-default bg-background px-3 py-1 font-mono text-xs"
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => removeItem(i, j)}
                    aria-label={`Remove ${item}`}
                    className="text-foreground-muted hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                value={row.draft}
                onChange={(e) => updateDraft(i, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    commitDraft(i);
                  } else if (e.key === "Backspace" && row.draft === "" && row.items.length > 0) {
                    removeItem(i, row.items.length - 1);
                  }
                }}
                onBlur={() => commitDraft(i)}
                placeholder="Type a skill, press Enter"
                className={input + " w-44 !py-1"}
              />
            </div>
          </div>
        ))}
      </div>
      <button type="button" onClick={addRow} className={secondaryButton + " mt-3 !py-1"}>
        + Add category
      </button>
      <input type="hidden" name="skillsJson" value={JSON.stringify(serialized)} readOnly />
    </div>
  );
}

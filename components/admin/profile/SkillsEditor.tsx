"use client";

import { useState } from "react";
import type { SkillGroup } from "@/lib/data";
import { label, input, secondaryButton, dangerLink } from "@/components/admin/styles";

type Row = { category: string; itemsText: string };

function toRows(groups: SkillGroup[]): Row[] {
  if (groups.length === 0) return [{ category: "", itemsText: "" }];
  return groups.map((g) => ({ category: g.category, itemsText: g.items.join(", ") }));
}

export function SkillsEditor({ initialSkills }: { initialSkills: SkillGroup[] }) {
  const [rows, setRows] = useState<Row[]>(toRows(initialSkills));

  function updateRow(index: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  function addRow() {
    setRows((prev) => [...prev, { category: "", itemsText: "" }]);
  }

  const serialized: SkillGroup[] = rows
    .filter((r) => r.category.trim())
    .map((r) => ({
      category: r.category.trim(),
      items: r.itemsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    }));

  return (
    <div>
      <label className={label}>Skills, grouped by category</label>
      <div className="space-y-3">
        {rows.map((row, i) => (
          <div key={i} className="flex gap-3">
            <input
              value={row.category}
              onChange={(e) => updateRow(i, { category: e.target.value })}
              placeholder="Category (e.g. Languages)"
              className={input + " w-40 shrink-0"}
            />
            <input
              value={row.itemsText}
              onChange={(e) => updateRow(i, { itemsText: e.target.value })}
              placeholder="C#, TypeScript, SQL"
              className={input}
            />
            <button type="button" onClick={() => removeRow(i)} className={dangerLink + " shrink-0"}>
              Remove
            </button>
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

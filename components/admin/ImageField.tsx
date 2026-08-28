import Image from "next/image";
import { label as labelClass, input } from "./styles";

export function ImageField({
  label,
  currentUrl,
  urlFieldName,
  existingFieldName,
  removeFieldName,
  helpText,
  round = false,
  defaultUrlValue = "",
}: {
  label: string;
  currentUrl?: string | null;
  urlFieldName: string;
  existingFieldName: string;
  removeFieldName: string;
  helpText?: string;
  round?: boolean;
  defaultUrlValue?: string;
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>

      {currentUrl && (
        <div className="mb-2 flex items-center gap-3">
          <div
            className={`relative h-16 w-16 shrink-0 overflow-hidden border border-border-default ${round ? "rounded-full" : "rounded-md"}`}
          >
            <Image src={currentUrl} alt="" fill sizes="64px" className="object-cover" />
          </div>
          <label className="flex items-center gap-2 font-mono text-xs text-foreground-muted">
            <input type="checkbox" name={removeFieldName} />
            Remove current image
          </label>
        </div>
      )}
      <input type="hidden" name={existingFieldName} value={currentUrl ?? ""} />

      <div className="grid gap-3 sm:grid-cols-2">
        <input type="file" name="file" accept="image/*" className={input} />
        <input
          type="text"
          name={urlFieldName}
          defaultValue={defaultUrlValue}
          placeholder="or paste an image URL"
          className={input}
        />
      </div>
      {helpText && <p className="mt-1 font-mono text-xs text-foreground-muted">{helpText}</p>}
    </div>
  );
}

import { cn } from "@/lib/utils";

export function MultiSelectGroup({
  name,
  options,
  selected = [],
}: {
  name: string;
  options: string[];
  selected?: string[];
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {options.map((option) => {
        const isSelected = selected.includes(option);

        return (
          <label
            key={option}
            className={cn(
              "cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition",
              isSelected
                ? "border-[var(--primary)] bg-[rgba(163,71,45,0.12)] text-[var(--primary-strong)]"
                : "border-[var(--line)] bg-white/70",
            )}
          >
            <input
              className="sr-only"
              type="checkbox"
              name={name}
              value={option}
              defaultChecked={isSelected}
            />
            {option}
          </label>
        );
      })}
    </div>
  );
}

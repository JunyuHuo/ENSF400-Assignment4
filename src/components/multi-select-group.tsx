"use client";

import * as React from "react";

export function MultiSelectGroup({
  name,
  options,
  selected = [],
}: {
  name: string;
  options: string[];
  selected?: string[];
}) {
  const [current, setCurrent] = React.useState<string[]>(selected ?? []);

  React.useEffect(() => {
    setCurrent(selected ?? []);
  }, [selected]);

  function toggle(option: string) {
    setCurrent((prev) => (prev.includes(option) ? prev.filter((p) => p !== option) : [...prev, option]));
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {options.map((option) => {
        const isSelected = current.includes(option);

        return (
          <React.Fragment key={option}>
            <button
              type="button"
              onClick={() => toggle(option)}
              style={{
                cursor: "pointer",
                borderRadius: 999,
                padding: "6px 16px",
                fontSize: 14,
                fontWeight: 600,
                background: isSelected ? "rgba(229,9,20,0.15)" : "rgba(255,255,255,0.05)",
                border: isSelected ? "1px solid #e50914" : "1px solid rgba(255,255,255,0.15)",
                color: isSelected ? "#fff" : "rgba(255,255,255,0.75)",
              }}
            >
              {option}
            </button>
          </React.Fragment>
        );
      })}

      {current.map((val) => (
        <input key={`hidden-${val}`} type="hidden" name={name} value={val} />
      ))}
    </div>
  );
}

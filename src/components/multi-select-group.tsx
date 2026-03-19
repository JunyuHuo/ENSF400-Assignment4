"use client";

import * as React from "react";
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
                background: isSelected ? "rgba(229,9,20,0.12)" : "#101010",
                border: isSelected ? "1px solid rgba(229,9,20,0.9)" : "1px solid transparent",
                color: "#ffffff",
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

"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      style={{
        background: pending ? "rgba(229,9,20,0.5)" : "#e50914",
        color: "#fff",
        fontWeight: 700,
        padding: "13px 36px",
        borderRadius: 999,
        border: "none",
        cursor: pending ? "not-allowed" : "pointer",
        boxShadow: "0 12px 32px rgba(229,9,20,0.3)",
        fontSize: "0.9rem",
        letterSpacing: "0.02em",
        transition: "background 0.2s",
        width: "100%",
      }}
    >
      {pending ? "Working..." : children}
    </button>
  );
}

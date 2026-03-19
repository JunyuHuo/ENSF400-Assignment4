"use client";

import { useFormStatus } from "react-dom";

export function SubmitButtonInline({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      style={{
        background: "#e50914",
        color: "#fff",
        borderRadius: 999,
        padding: "12px 18px",
        border: "none",
        boxShadow: "0 12px 30px rgba(229,9,20,0.28)",
        fontWeight: 700,
        width: "100%",
        maxWidth: 360,
        cursor: pending ? "default" : "pointer",
        opacity: pending ? 0.8 : 1,
      }}
    >
      {pending ? "Working..." : children}
    </button>
  );
}

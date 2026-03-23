"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  className,
  pendingText,
  showProgress = false,
  progressLabel,
}: {
  children: React.ReactNode;
  className?: string;
  pendingText?: string;
  showProgress?: boolean;
  progressLabel?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <div style={{ display: "grid", gap: pending && showProgress ? 10 : 0 }}>
      <button
        type="submit"
        disabled={pending}
        className={className}
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
        {pending ? pendingText ?? "Working..." : children}
      </button>
      {pending && showProgress ? (
        <div style={{ borderRadius: 14, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", padding: "12px 14px" }}>
          <p style={{ color: "#fff", fontSize: 13, fontWeight: 700, margin: 0 }}>
            {progressLabel ?? pendingText ?? "Working..."}
          </p>
          <div style={{ height: 8, marginTop: 10, borderRadius: 999, overflow: "hidden", background: "rgba(255,255,255,0.08)" }}>
            <div style={{ width: "48%", height: "100%", background: "linear-gradient(90deg, #e50914, #ff6b6b)", animation: "submit-progress 1.15s ease-in-out infinite alternate" }} />
          </div>
        </div>
      ) : null}
      <style jsx>{`
        @keyframes submit-progress {
          from {
            transform: translateX(-18%);
          }
          to {
            transform: translateX(102%);
          }
        }
      `}</style>
    </div>
  );
}

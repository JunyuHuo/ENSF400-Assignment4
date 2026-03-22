export function StatusBanner({
  message,
  kind = "success",
}: {
  message?: string;
  kind?: "success" | "error";
}) {
  if (!message) {
    return null;
  }

  return (
    <div
      style={{
        padding: "10px 16px",
        borderRadius: 8,
        fontSize: "0.875rem",
        fontWeight: 600,
        marginBottom: 12,
        background: kind === "error" ? "rgba(229,9,20,0.15)" : "rgba(46,204,113,0.12)",
        border: `1px solid ${kind === "error" ? "rgba(229,9,20,0.4)" : "rgba(46,204,113,0.35)"}`,
        color: kind === "error" ? "#ff6b6b" : "#6bffb8",
      }}
    >
      {message}
    </div>
  );
}

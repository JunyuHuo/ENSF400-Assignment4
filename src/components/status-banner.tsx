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
    <div className={kind === "error" ? "status-banner error" : "status-banner"}>
      {message}
    </div>
  );
}

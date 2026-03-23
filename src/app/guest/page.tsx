import { Suspense } from "react";
import GuestClient from "./GuestClient";

export default function GuestPage() {
  return (
    <main style={{ padding: 0 }}>
      <Suspense fallback={
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px 24px", textAlign: "center" }}>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>Loading...</p>
        </div>
      }>
        <GuestClient />
      </Suspense>
    </main>
  );
}

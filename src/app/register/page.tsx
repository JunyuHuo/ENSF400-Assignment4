import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import { StatusBanner } from "@/components/status-banner";
import { registerAction } from "@/server/actions";
import { SubmitButtonInline } from "@/components/submit-button-inline";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const session = await getCurrentSession();

  if (session) {
    redirect("/dashboard");
  }

  const params = await searchParams;

  return (
    <main style={{ background: "#0a0a0a", minHeight: "100vh", padding: "0" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "32px 16px" }}>
        <section style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "2rem" }}>
          <p style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.18em", color: "#e50914", marginBottom: 8 }}>New account</p>
          <h1 style={{ fontFamily: "Georgia, serif", color: "#ffffff", fontSize: 28, margin: 0, fontWeight: 700 }}>Create your CineMatch profile</h1>
          <p style={{ color: "rgba(255,255,255,0.85)", marginTop: 12, fontSize: 14 }}>
            Register with email and password, then complete the onboarding questionnaire so the recommendation engine has a solid starting profile.
          </p>

          <div style={{ marginTop: 18 }}>
            <StatusBanner message={params.success} />
            <StatusBanner kind="error" message={params.error} />
          </div>

          <form action={registerAction} style={{ marginTop: 18 }}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", color: "rgba(255,255,255,0.85)", fontSize: 13, marginBottom: 6 }}>Name</label>
              <input name="name" type="text" placeholder="Your name" required style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "12px 14px", color: "#fff", fontSize: "0.9rem", outline: "none" }} />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", color: "rgba(255,255,255,0.85)", fontSize: 13, marginBottom: 6 }}>Email</label>
              <input name="email" type="email" placeholder="you@example.com" required style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "12px 14px", color: "#fff", fontSize: "0.9rem", outline: "none" }} />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", color: "rgba(255,255,255,0.85)", fontSize: 13, marginBottom: 6 }}>Password</label>
              <input name="password" type="password" placeholder="At least 8 chars, upper/lower/number" required style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "12px 14px", color: "#fff", fontSize: "0.9rem", outline: "none" }} />
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <SubmitButtonInline> Create account </SubmitButtonInline>
              </div>
            </div>
          </form>

          <p style={{ color: "rgba(255,255,255,0.7)", marginTop: 16, textAlign: "center", fontSize: 14 }}>
            Already registered? <Link href="/login" style={{ color: "#ddd", fontWeight: 700 }}>Log in here</Link>.
          </p>
        </section>
      </div>
    </main>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";

export default async function HomePage() {
  const session = await getCurrentSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="page-shell" style={{ paddingTop: "4rem" }}>
      <section className="hero-full">
        <div style={{ width: "100%", display: "grid", gap: 10, gridTemplateColumns: "1fr", alignItems: "center" }}>
          <div style={{ textAlign: "center", margin: "0 auto", maxWidth: 900 }}>
            <p style={{ fontSize: 14, color: "#bfbfbf", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "1.5rem" }}>ENSF 400 • CineMatch</p>
            <h1 style={{ fontFamily: "Georgia, serif", color: "#ffffff", fontSize: 48, margin: "0 auto", marginBottom: "1.5rem" }}>Find your next favorite   curated like a classic cinema.</h1>
            <p style={{ color: "rgba(255,255,255,0.8)", marginTop: 12, fontSize: 18, maxWidth: 720, marginLeft: "auto", marginRight: "auto", marginBottom: "2rem" }}>CineMatch turns your tastes, ratings, and feedback into explainable movie and TV recommendations. Immersive explore, fast onboarding, and guest previews.</p>

            <div style={{ display: "flex", justifyContent: "center", gap: "0.75rem", marginTop: 18, marginBottom: "2rem" }}>
              <Link href="/register" className="btn-primary-cinematic">Get Started</Link>
              <Link href="/guest" className="btn-ghost-cinematic">Try Guest Mode</Link>
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem", alignItems: "center", marginTop: 18, marginBottom: "3rem" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center", color: "#fff" }}>
                <span style={{ color: "#fff", opacity: 0.9, fontSize: 13 }}>Onboarding Quiz</span>
                <span style={{ width: 6, height: 6, borderRadius: 6, background: "#e50914" }} />
                <span style={{ color: "#fff", opacity: 0.9, fontSize: 13 }}>AI Recommendations</span>
                <span style={{ width: 6, height: 6, borderRadius: 6, background: "#e50914" }} />
                <span style={{ color: "#fff", opacity: 0.9, fontSize: 13 }}>Ratings & Reviews</span>
              </div>
            </div>
          </div>

          <aside style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
            <div className="movie-card" style={{ width: "100%", maxWidth: 720 }}>
              <img src="/banner.jpg" alt="Cinema" style={{ width: "100%", height: 420, objectFit: "cover", borderRadius: 16, display: "block", margin: "0 auto", marginTop: "3rem" }} />
              <div className="movie-card-body">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ textAlign: "left" }}>
                    <div className="movie-title">Featured Demo Picks</div>
                    <div style={{ fontSize: 14, color: "#bfbfbf" }}>Curated for new users</div>
                  </div>
                  <div className="rating">★ 9.1</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

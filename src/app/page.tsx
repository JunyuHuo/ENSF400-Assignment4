import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";

export default async function HomePage() {
  const session = await getCurrentSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="page-shell">
      <section className="hero-full">
        <div className="w-full grid gap-8 grid-cols-1 items-center">
          <div className="text-center mx-auto max-w-4xl">
            <p className="eyebrow mb-6">ENSF 400 • CineMatch</p>
            <h1 className="hero-title mb-8">Find your next favorite curated like a classic cinema.</h1>
            <p className="hero-sub mx-auto mb-10">CineMatch turns your tastes, ratings, and feedback into explainable movie and TV recommendations. Immersive exploration, fast onboarding, and guest previews.</p>

            <div className="hero-ctas justify-center mb-10">
              <Link href="/register" className="btn-primary-cinematic">Get Started</Link>
              <Link href="/guest" className="btn-ghost-cinematic">Try Guest Mode</Link>
            </div>

            <div className="flex justify-center gap-6 items-center flex-wrap">
              <div className="flex gap-4 items-center">
                <span className="pill">Onboarding Quiz</span>
                <span className="pill">AI Recommendations</span>
                <span className="pill">Ratings & Reviews</span>
              </div>
            </div>
          </div>

          <aside className="flex justify-center mt-12">
            <div className="movie-card max-w-3xl w-full">
              <img src="/banner.jpg" alt="Cinema" className="movie-poster h-[400px] w-full" />
              <div className="movie-card-body flex items-center justify-between p-6">
                <div>
                  <div className="movie-title text-xl">Featured Demo Picks</div>
                  <div className="muted text-sm mt-1">Curated for new users</div>
                </div>
                <div className="rating text-2xl font-bold">★ 9.1</div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

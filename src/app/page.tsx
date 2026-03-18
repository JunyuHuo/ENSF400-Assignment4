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
      <section className="hero-card glass-card rounded-[36px] px-6 py-8 md:px-10 md:py-12">
        <div className="grid items-center gap-10 md:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <p className="eyebrow">ENSF 400 Assignment 4</p>
            <h1 className="max-w-3xl text-5xl font-bold tracking-tight md:text-6xl">
              Personalized movie and TV recommendations with a full-stack Next.js build.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[var(--muted)]">
              CineMatch turns your onboarding preferences, ratings, reviews, and manual adjustments into explainable recommendations. The stack is ready for Render PostgreSQL, email verification, admin moderation, and OpenAI-powered recommendation generation.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link className="btn-primary" href="/register">
                Create account
              </Link>
              <Link className="btn-ghost" href="/login">
                Log in
              </Link>
              <Link className="btn-ghost" href="/guest">
                Try guest mode
              </Link>
            </div>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="pill">Registration + Login</span>
              <span className="pill">Onboarding Questionnaire</span>
              <span className="pill">LLM Recommendations</span>
              <span className="pill">Guest Mode + Prompting</span>
              <span className="pill">Ratings, Reviews, Reports</span>
            </div>
          </div>
          <div className="grid gap-4">
            <div className="glass-card rounded-[28px] p-5">
              <p className="eyebrow">Core Flow</p>
              <ol className="mt-4 space-y-3 text-sm text-[var(--muted)]">
                <li>1. Register and optionally verify via email.</li>
                <li>2. Complete the multi-select onboarding questionnaire.</li>
                <li>3. Receive 5 explainable recommendations on the dashboard.</li>
                <li>4. Adjust by prompt, guest mode, rating, review, comment, and report.</li>
              </ol>
            </div>
            <div className="glass-card rounded-[28px] p-5">
              <p className="eyebrow">Admin Demo</p>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                Seeded admin login: <strong>admin@cinematch.local</strong> with password <strong>Admin1234</strong> after you run the seed script.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

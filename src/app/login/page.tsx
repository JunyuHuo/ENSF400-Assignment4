import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import { StatusBanner } from "@/components/status-banner";
import { SubmitButton } from "@/components/submit-button";
import { loginAction } from "@/server/actions";

export default async function LoginPage({
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
    <main className="page-shell max-w-2xl">
      <section className="glass-card rounded-[32px] p-6 md:p-8">
        <p className="eyebrow">Welcome back</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">Log in to CineMatch</h1>
        <p className="muted mt-3 max-w-xl">
          Access your dashboard, update your taste profile, and keep refining recommendations with ratings and reviews.
        </p>
        <div className="mt-6 space-y-3">
          <StatusBanner message={params.success} />
          <StatusBanner kind="error" message={params.error} />
        </div>
        <form action={loginAction} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Email</label>
            <input name="email" type="email" placeholder="you@example.com" required />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Password</label>
            <input name="password" type="password" placeholder="Your password" required />
          </div>
          <SubmitButton>Log in</SubmitButton>
        </form>
        <p className="muted mt-5 text-sm">
          Need an account? <Link className="font-semibold text-[var(--primary)]" href="/register">Register here</Link>.
        </p>
      </section>
    </main>
  );
}

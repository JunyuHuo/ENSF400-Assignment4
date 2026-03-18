import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import { StatusBanner } from "@/components/status-banner";
import { SubmitButton } from "@/components/submit-button";
import { registerAction } from "@/server/actions";

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
    <main className="page-shell max-w-2xl">
      <section className="glass-card rounded-[32px] p-6 md:p-8">
        <p className="eyebrow">New account</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">Create your CineMatch profile</h1>
        <p className="muted mt-3 max-w-xl">
          Register with email and password, then complete the onboarding questionnaire so the recommendation engine has a solid starting profile.
        </p>
        <div className="mt-6 space-y-3">
          <StatusBanner message={params.success} />
          <StatusBanner kind="error" message={params.error} />
        </div>
        <form action={registerAction} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Name</label>
            <input name="name" type="text" placeholder="Your name" required />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Email</label>
            <input name="email" type="email" placeholder="you@example.com" required />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Password</label>
            <input
              name="password"
              type="password"
              placeholder="At least 8 chars, upper/lower/number"
              required
            />
          </div>
          <SubmitButton>Create account</SubmitButton>
        </form>
        <p className="muted mt-5 text-sm">
          Already registered? <Link className="font-semibold text-[var(--primary)]" href="/login">Log in here</Link>.
        </p>
      </section>
    </main>
  );
}

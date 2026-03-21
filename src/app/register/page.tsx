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
    <main className="page-shell flex items-center justify-center min-h-[80vh]">
      <section className="glass-card max-w-[480px] w-full p-8 md:p-10">
        <p className="eyebrow mb-4">New account</p>
        <h1 className="section-title text-3xl mb-4">Create your CineMatch profile</h1>
        <p className="muted text-sm leading-relaxed mb-8">
          Register with email and password, then complete the onboarding questionnaire so the recommendation engine has a solid starting profile.
        </p>

        <div className="space-y-4">
          <StatusBanner message={params.success} />
          <StatusBanner kind="error" message={params.error} />
        </div>

        <form action={registerAction} className="mt-8 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <input name="name" type="text" placeholder="Your name" required />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <input name="email" type="email" placeholder="you@example.com" required />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <input name="password" type="password" placeholder="At least 8 chars, upper/lower/number" required />
          </div>

          <div className="pt-2">
            <SubmitButtonInline className="w-full">Create account</SubmitButtonInline>
          </div>
        </form>

        <p className="muted text-center text-sm mt-8">
          Already registered? <Link href="/login" className="text-white hover:text-[var(--cin-red)] transition-colors font-semibold">Log in here</Link>.
        </p>
      </section>
    </main>
  );
}

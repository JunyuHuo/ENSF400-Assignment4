import { verifyEmailAction } from "@/server/actions";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;

  if (params.token) {
    await verifyEmailAction(params.token);
  } else {
    await verifyEmailAction("");
  }

  return (
    <main className="page-shell flex items-center justify-center min-h-[60vh]">
      <section className="glass-card p-10 text-center max-w-md w-full">
        <div className="flex justify-center mb-6">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--cin-red)]"></div>
        </div>
        <h1 className="section-title text-2xl mb-2">Verifying your account</h1>
        <p className="muted">Please wait while we confirm your email address and unlock your movie profile.</p>
      </section>
    </main>
  );
}

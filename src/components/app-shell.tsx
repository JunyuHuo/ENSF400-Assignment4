import Link from "next/link";
import { Role } from "@prisma/client";
import { logoutAction } from "@/server/actions";

type ShellUser = {
  name: string;
  email: string;
  role: Role;
};

export function AppShell({
  user,
  children,
}: {
  user: ShellUser;
  children: React.ReactNode;
}) {
  return (
    <div className="page-shell">
      <header className="glass-card mb-6 rounded-[28px] px-5 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Link href="/dashboard" className="text-2xl font-bold tracking-tight">
              CineMatch
            </Link>
            <p className="muted mt-1 text-sm">
              Personalized recommendations, ratings, moderation, and content feedback.
            </p>
          </div>
          <nav className="flex flex-wrap items-center gap-3">
            <Link className="btn-ghost" href="/dashboard">
              Dashboard
            </Link>
            <Link className="btn-ghost" href="/browse">
              Browse
            </Link>
            <Link className="btn-ghost" href="/onboarding">
              Taste Profile
            </Link>
            {user.role === Role.ADMIN ? (
              <Link className="btn-secondary" href="/admin">
                Admin
              </Link>
            ) : null}
            <form action={logoutAction}>
              <button className="btn-primary" type="submit">
                Log out
              </button>
            </form>
          </nav>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
          <span className="pill">{user.name}</span>
          <span className="pill">{user.email}</span>
          <span className="pill">{user.role === Role.ADMIN ? "Administrator" : "Member"}</span>
        </div>
      </header>
      {children}
    </div>
  );
}

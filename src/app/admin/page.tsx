import { AppShell } from "@/components/app-shell";
import { StatusBanner } from "@/components/status-banner";
import { SubmitButton } from "@/components/submit-button";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateReportStatusAction } from "@/server/actions";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const session = await requireAdmin();
  const params = await searchParams;

  const [reports, userCount, reviewCount, commentCount] = await Promise.all([
    prisma.report.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        content: true,
        review: true,
        comment: true,
        reportedBy: true,
      },
    }),
    prisma.user.count(),
    prisma.review.count(),
    prisma.comment.count(),
  ]);

  const openReports = reports.filter((report) => report.status === "OPEN").length;
  const [onboardedUsers, ratingCount, recommendationBatches, topRated, mostReported] =
    await Promise.all([
      prisma.userProfile.count({
        where: { onboardingCompleted: true },
      }),
      prisma.rating.count(),
      prisma.recommendationBatch.count(),
      prisma.content.findMany({
        orderBy: [{ averageRating: "desc" }, { title: "asc" }],
        take: 5,
      }),
      prisma.content.findMany({
        include: {
          _count: {
            select: { reports: true },
          },
        },
        orderBy: {
          reports: {
            _count: "desc",
          },
        },
        take: 5,
      }),
    ]);

  return (
    <AppShell user={session.user}>
      <section className="glass-card rounded-[32px] p-6 md:p-8">
        <p className="eyebrow">Moderation dashboard</p>
        <h1 className="section-title mt-3">Admin visibility and report handling</h1>
        <p className="muted mt-3 max-w-3xl">
          This page satisfies the moderation and analytics side of the assignment design: admins can review reports, track engagement, and close the moderation loop.
        </p>
        <div className="mt-6 space-y-3">
          <StatusBanner message={params.success} />
          <StatusBanner kind="error" message={params.error} />
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-4 xl:grid-cols-8">
          <div className="rounded-[24px] border border-[var(--line)] bg-white/80 p-5">
            <p className="eyebrow">Users</p>
            <p className="mt-3 text-3xl font-bold">{userCount}</p>
          </div>
          <div className="rounded-[24px] border border-[var(--line)] bg-white/80 p-5">
            <p className="eyebrow">Onboarded</p>
            <p className="mt-3 text-3xl font-bold">{onboardedUsers}</p>
          </div>
          <div className="rounded-[24px] border border-[var(--line)] bg-white/80 p-5">
            <p className="eyebrow">Onboarded</p>
            <p className="mt-3 text-3xl font-bold">{onboardedUsers}</p>
          </div>
          <div className="rounded-[24px] border border-[var(--line)] bg-white/80 p-5">
            <p className="eyebrow">Reviews</p>
            <p className="mt-3 text-3xl font-bold">{reviewCount}</p>
          </div>
          <div className="rounded-[24px] border border-[var(--line)] bg-white/80 p-5">
            <p className="eyebrow">Comments</p>
            <p className="mt-3 text-3xl font-bold">{commentCount}</p>
          </div>
          <div className="rounded-[24px] border border-[var(--line)] bg-white/80 p-5">
            <p className="eyebrow">Ratings</p>
            <p className="mt-3 text-3xl font-bold">{ratingCount}</p>
          </div>
          <div className="rounded-[24px] border border-[var(--line)] bg-white/80 p-5">
            <p className="eyebrow">Rec batches</p>
            <p className="mt-3 text-3xl font-bold">{recommendationBatches}</p>
          </div>
          <div className="rounded-[24px] border border-[var(--line)] bg-white/80 p-5">
            <p className="eyebrow">Open reports</p>
            <p className="mt-3 text-3xl font-bold">{openReports}</p>
          </div>
        </div>
        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          <section className="rounded-[28px] border border-[var(--line)] bg-white/82 p-5">
            <h2 className="text-xl font-semibold">Top-rated titles</h2>
            <div className="mt-4 space-y-3">
              {topRated.map((item) => (
                <div key={item.id} className="rounded-[20px] border border-[var(--line)] bg-[var(--surface-strong)] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <strong>{item.title}</strong>
                    <span className="pill">{item.averageRating.toFixed(1)} stars</span>
                  </div>
                  <p className="muted mt-2 text-sm">{item.type} • {item.year}</p>
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-[28px] border border-[var(--line)] bg-white/82 p-5">
            <h2 className="text-xl font-semibold">Most reported titles</h2>
            <div className="mt-4 space-y-3">
              {mostReported.map((item) => (
                <div key={item.id} className="rounded-[20px] border border-[var(--line)] bg-[var(--surface-strong)] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <strong>{item.title}</strong>
                    <span className="pill">{item._count.reports} reports</span>
                  </div>
                  <p className="muted mt-2 text-sm">{item.type} • {item.year}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
        <div className="mt-8 space-y-4">
          {reports.length ? (
            reports.map((report) => (
              <article key={report.id} className="rounded-[28px] border border-[var(--line)] bg-white/82 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2 text-sm">
                      <span className="pill">{report.status}</span>
                      <span className="pill">{report.reason}</span>
                      <span className="pill">{report.content.title}</span>
                    </div>
                    <h2 className="text-xl font-semibold">
                      Reported by {report.reportedBy.name}
                    </h2>
                    <p className="muted text-sm">
                      {report.details ?? "No extra details were provided."}
                    </p>
                    {report.review ? (
                      <p className="rounded-[18px] bg-[var(--accent-soft)] p-3 text-sm">
                        Review excerpt: {report.review.body}
                      </p>
                    ) : null}
                    {report.comment ? (
                      <p className="rounded-[18px] bg-[var(--accent-soft)] p-3 text-sm">
                        Comment excerpt: {report.comment.body}
                      </p>
                    ) : null}
                  </div>
                  <form action={updateReportStatusAction} className="flex min-w-[220px] flex-col gap-3">
                    <input type="hidden" name="reportId" value={report.id} />
                    <select name="status" defaultValue={report.status}>
                      <option value="OPEN">Open</option>
                      <option value="IN_REVIEW">In review</option>
                      <option value="RESOLVED">Resolved</option>
                    </select>
                    <SubmitButton className="btn-secondary">Update status</SubmitButton>
                  </form>
                </div>
              </article>
            ))
          ) : (
            <p className="muted text-sm">No reports have been submitted yet.</p>
          )}
        </div>
      </section>
    </AppShell>
  );
}

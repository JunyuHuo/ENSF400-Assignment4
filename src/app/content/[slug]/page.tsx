import { notFound } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { AppShell } from "@/components/app-shell";
import { StatusBanner } from "@/components/status-banner";
import { SubmitButton } from "@/components/submit-button";
import { REPORT_REASONS } from "@/lib/constants";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatGenres } from "@/lib/utils";
import {
  submitCommentAction,
  submitRatingAction,
  submitReportAction,
  submitReviewAction,
} from "@/server/actions";

export default async function ContentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const session = await requireUser();
  const { slug } = await params;
  const query = await searchParams;

  const content = await prisma.content.findUnique({
    where: { slug },
    include: {
      ratings: true,
      reviews: {
        include: {
          user: true,
        },
        orderBy: { updatedAt: "desc" },
      },
      comments: {
        include: {
          user: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!content) {
    notFound();
  }

  const existingRating = content.ratings.find((rating) => rating.userId === session.user.id);
  const existingReview = content.reviews.find((review) => review.userId === session.user.id);

  return (
    <AppShell user={session.user}>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="glass-card rounded-[32px] p-6 md:p-8">
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="pill">{content.type}</span>
            <span className="pill">{content.year}</span>
            <span className="pill">{content.runtime}</span>
            <span className="pill">{content.maturityRating}</span>
            <span className="pill">{content.averageRating.toFixed(1)} average stars</span>
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight">{content.title}</h1>
          <p className="muted mt-3">
            {formatGenres(content.genres)} • {content.pacing} pacing • Moods: {content.moods.join(", ")}
          </p>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--muted)]">{content.summary}</p>
          <div className="mt-6 space-y-3">
            <StatusBanner message={query.success} />
            <StatusBanner kind="error" message={query.error} />
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <form action={submitRatingAction} className="rounded-[28px] border border-[var(--line)] bg-white/82 p-5">
              <h2 className="text-xl font-semibold">Rate this title</h2>
              <p className="muted mt-2 text-sm">Submit a 1-5 star score to influence future recommendations.</p>
              <input type="hidden" name="contentId" value={content.id} />
              <input type="hidden" name="slug" value={content.slug} />
              <select className="mt-4" name="score" defaultValue={String(existingRating?.score ?? 5)}>
                {[1, 2, 3, 4, 5].map((score) => (
                  <option key={score} value={score}>
                    {score} star{score > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
              <SubmitButton className="btn-primary mt-4 w-full">Save rating</SubmitButton>
            </form>
            <form action={submitReportAction} className="rounded-[28px] border border-[var(--line)] bg-white/82 p-5">
              <h2 className="text-xl font-semibold">Report content</h2>
              <p className="muted mt-2 text-sm">Logged-in users can flag questionable or inappropriate material for moderators.</p>
              <input type="hidden" name="contentId" value={content.id} />
              <input type="hidden" name="slug" value={content.slug} />
              <select className="mt-4" name="reason" defaultValue={REPORT_REASONS[0]}>
                {REPORT_REASONS.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
              <textarea className="mt-4" name="details" maxLength={250} placeholder="Optional details for the moderation team" />
              <SubmitButton className="btn-secondary mt-4 w-full">Submit report</SubmitButton>
            </form>
          </div>
          <form action={submitReviewAction} className="mt-6 rounded-[28px] border border-[var(--line)] bg-white/82 p-5">
            <h2 className="text-xl font-semibold">Write or update your review</h2>
            <p className="muted mt-2 text-sm">Reviews are capped at 500 words and feed the interaction history requirement.</p>
            <input type="hidden" name="contentId" value={content.id} />
            <input type="hidden" name="slug" value={content.slug} />
            <textarea
              className="mt-4"
              name="body"
              maxLength={3000}
              defaultValue={existingReview?.body ?? ""}
              placeholder="What worked for you, what didn't, and who would enjoy it?"
            />
            <SubmitButton className="btn-primary mt-4">Save review</SubmitButton>
          </form>
        </section>
        <aside className="space-y-6">
          <section className="glass-card rounded-[32px] p-6">
            <h2 className="text-2xl font-semibold">Comments</h2>
            <form action={submitCommentAction} className="mt-4 space-y-4">
              <input type="hidden" name="contentId" value={content.id} />
              <input type="hidden" name="slug" value={content.slug} />
              <textarea name="body" maxLength={200} placeholder="Leave a short comment for other viewers." />
              <SubmitButton className="btn-ghost">Post comment</SubmitButton>
            </form>
            <div className="mt-6 space-y-4">
              {content.comments.length ? (
                content.comments.map((comment) => (
                  <article key={comment.id} className="rounded-[24px] border border-[var(--line)] bg-white/80 p-4">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <strong>{comment.user.name}</strong>
                      <span className="muted">
                        {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{comment.body}</p>
                    <form action={submitReportAction} className="mt-4 space-y-3">
                      <input type="hidden" name="contentId" value={content.id} />
                      <input type="hidden" name="slug" value={content.slug} />
                      <input type="hidden" name="commentId" value={comment.id} />
                      <input type="hidden" name="reason" value="Inappropriate language" />
                      <SubmitButton className="btn-ghost w-full">Report comment</SubmitButton>
                    </form>
                  </article>
                ))
              ) : (
                <p className="muted text-sm">No comments yet.</p>
              )}
            </div>
          </section>
          <section className="glass-card rounded-[32px] p-6">
            <h2 className="text-2xl font-semibold">Community reviews</h2>
            <div className="mt-4 space-y-4">
              {content.reviews.length ? (
                content.reviews.map((review) => (
                  <article key={review.id} className="rounded-[24px] border border-[var(--line)] bg-white/80 p-4">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <strong>{review.user.name}</strong>
                      <span className="muted">
                        {formatDistanceToNow(review.updatedAt, { addSuffix: true })}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{review.body}</p>
                    <form action={submitReportAction} className="mt-4 space-y-3">
                      <input type="hidden" name="contentId" value={content.id} />
                      <input type="hidden" name="slug" value={content.slug} />
                      <input type="hidden" name="reviewId" value={review.id} />
                      <input type="hidden" name="reason" value="Spoilers without warning" />
                      <SubmitButton className="btn-ghost w-full">Report review</SubmitButton>
                    </form>
                  </article>
                ))
              ) : (
                <p className="muted text-sm">No reviews yet.</p>
              )}
            </div>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}

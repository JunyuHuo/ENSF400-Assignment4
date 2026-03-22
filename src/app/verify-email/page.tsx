import { verifyEmailAction } from "@/server/actions";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  await verifyEmailAction(params.token ?? "");
  return null;
}

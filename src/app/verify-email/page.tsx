import { verifyEmailAction } from "@/server/actions";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;

  if (!params.token) {
    await verifyEmailAction("");
  }

  await verifyEmailAction(params.token ?? "");

  return null;
}

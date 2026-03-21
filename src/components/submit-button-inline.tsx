"use client";

import { useFormStatus } from "react-dom";

export function SubmitButtonInline({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`btn-primary-cinematic ${className} ${pending ? "opacity-80 cursor-default" : ""}`}
    >
      {pending ? "Working..." : children}
    </button>
  );
}

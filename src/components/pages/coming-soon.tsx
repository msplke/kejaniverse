"use client";

import { useRouter } from "next/navigation";

import { Button } from "~/components/ui/button";

export function ComingSoon() {
  const router = useRouter();

  const handleRedirect = () => {
    if (
      document.referrer &&
      new URL(document.referrer).origin === window.location.origin
    ) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center">
      <h1 className="mb-4 text-4xl font-bold">Coming Soon</h1>
      <p className="mb-6 text-lg">
        We&apos;re working hard to bring you something amazing. Stay tuned!
      </p>
      <Button onClick={handleRedirect} className="px-6 py-3">
        Go Back
      </Button>
    </div>
  );
}

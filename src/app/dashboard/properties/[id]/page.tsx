"use client";

import { useRouter } from "next/router";

export default function Page() {
  const router = useRouter();

  return <div>id: {router.query.id}</div>;
}

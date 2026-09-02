"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function PrivateFeedbackRedirect() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();

  useEffect(() => {
    if (slug) {
      router.replace(`/r/${slug}`);
    }
  }, [slug, router]);

  return null;
}

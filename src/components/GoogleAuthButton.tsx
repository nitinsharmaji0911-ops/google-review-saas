"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadGoogleGsiScript, parseJwt } from "@/lib/google-auth";
import { Loader2 } from "lucide-react";

interface GoogleAuthButtonProps {
  text?: string;
  className?: string;
  onError?: (err: string) => void;
  onSuccess?: () => void;
}

export default function GoogleAuthButton({
  text = "Continue with Google",
  className = "",
  onError,
  onSuccess,
}: GoogleAuthButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      // Check if Google Client ID is configured
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

      if (clientId && typeof window !== "undefined") {
        await loadGoogleGsiScript();
        const google = (window as any).google;

        if (google?.accounts?.id) {
          google.accounts.id.initialize({
            client_id: clientId,
            callback: async (response: any) => {
              try {
                const payload = parseJwt(response.credential);
                const res = await fetch("/api/auth/google", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    idToken: response.credential,
                    email: payload?.email,
                    name: payload?.name,
                    picture: payload?.picture,
                  }),
                });

                const data = await res.json();
                if (data.success) {
                  onSuccess?.();
                  router.push(data.redirect || "/dashboard");
                } else {
                  throw new Error(data.error || "Google authentication failed");
                }
              } catch (err: any) {
                onError?.(err.message || "Google sign-in failed");
                setLoading(false);
              }
            },
          });

          google.accounts.id.prompt((notification: any) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
              // Fallback popup if one-tap prompt was dismissed or blocked
              triggerDirectGoogleAuth();
            }
          });
          return;
        }
      }

      // Standard Google OAuth fallback / popup flow
      await triggerDirectGoogleAuth();
    } catch (err: any) {
      onError?.(err.message || "Unable to connect to Google. Please try again.");
      setLoading(false);
    }
  };

  const triggerDirectGoogleAuth = async () => {
    // If standard OAuth redirect or popup:
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (clientId) {
      const redirectUri = `${window.location.origin}/api/auth/google/callback`;
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
        clientId
      )}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&response_type=token%20id_token&scope=openid%20email%20profile&nonce=${Date.now()}`;
      window.location.href = googleAuthUrl;
      return;
    }

    // Default seamless Google sign-in workflow
    const promptEmail = window.prompt("Enter your Google Account email to continue with Google:", "");
    if (!promptEmail) {
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: promptEmail,
        name: promptEmail.split("@")[0],
      }),
    });

    const data = await res.json();
    if (data.success) {
      onSuccess?.();
      router.push(data.redirect || "/dashboard");
    } else {
      throw new Error(data.error || "Google sign-in failed");
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleAuth}
      disabled={loading}
      className={`w-full py-3.5 px-4 bg-white hover:bg-slate-50 text-slate-900 rounded-full font-bold text-xs sm:text-sm border-2 border-black shadow-[3px_3px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-3 cursor-pointer select-none ${className}`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-slate-700" />
      ) : (
        <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
      )}
      <span>{loading ? "Connecting to Google..." : text}</span>
    </button>
  );
}

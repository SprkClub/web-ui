"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function TwitterCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const errorParam = searchParams.get("error");
      const state = searchParams.get("state");

      // Handle OAuth errors
      if (errorParam) {
        setError(`Twitter OAuth error: ${errorParam}`);
        setTimeout(() => router.push("/"), 3000);
        return;
      }

      if (!code) {
        setError("No authorization code received");
        setTimeout(() => router.push("/"), 3000);
        return;
      }

      // Get code verifier from sessionStorage
      const codeVerifier = sessionStorage.getItem("twitter_code_verifier");
      const storedState = sessionStorage.getItem("twitter_oauth_state");

      // Verify state matches (CSRF protection)
      if (state !== storedState) {
        setError("State mismatch - possible CSRF attack");
        sessionStorage.removeItem("twitter_oauth_state");
        sessionStorage.removeItem("twitter_code_verifier");
        setTimeout(() => router.push("/"), 3000);
        return;
      }

      // Build the API callback URL with all query parameters
      const params = new URLSearchParams();
      params.set("code", code);
      params.set("state", state);
      if (codeVerifier) {
        params.set("code_verifier", codeVerifier);
      }

      try {
        // Call the API route to handle token exchange
        const response = await fetch(`/api/auth/twitter/callback?${params.toString()}`, {
          method: "GET",
          credentials: "include",
        });

        // Clean up sessionStorage
        sessionStorage.removeItem("twitter_oauth_state");
        sessionStorage.removeItem("twitter_code_verifier");

        if (response.ok) {
          // Redirect to home page - the API route should have set the cookie
          window.location.href = "/";
        } else {
          const errorData = await response.json().catch(() => ({}));
          setError(errorData.error || "Failed to complete login");
          setTimeout(() => router.push("/"), 3000);
        }
      } catch (err) {
        console.error("Callback error:", err);
        setError("Failed to complete login. Please try again.");
        sessionStorage.removeItem("twitter_oauth_state");
        sessionStorage.removeItem("twitter_code_verifier");
        setTimeout(() => router.push("/"), 3000);
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#050207]">
      <div className="text-center">
        {error ? (
          <>
            <div className="text-red-400 text-lg mb-4">{error}</div>
            <div className="text-white/60 text-sm">Redirecting to home...</div>
          </>
        ) : (
          <>
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4ed31] mb-4"></div>
            <div className="text-white text-lg">Completing Twitter login...</div>
          </>
        )}
      </div>
    </div>
  );
}

export default function TwitterCallback() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-[#050207]">
          <div className="text-white">Loading...</div>
        </div>
      }
    >
      <TwitterCallbackContent />
    </Suspense>
  );
}

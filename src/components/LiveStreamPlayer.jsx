"use client";

import { useState, useEffect, useRef } from "react";
import { Icons } from "@/lib/icons";

export default function LiveStreamPlayer({ channelName, uid, onViewersUpdate }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [viewers, setViewers] = useState(0);
  const remoteVideoRef = useRef(null);
  const clientRef = useRef(null);
  const remoteUsersRef = useRef({});

  const initAgora = async () => {
    if (typeof window === "undefined" || !window.AgoraRTC) {
      const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;
      window.AgoraRTC = AgoraRTC;
    }
  };

  useEffect(() => {
    if (!channelName) return;

    const joinChannel = async () => {
      try {
        // Get token first to check if Agora is configured
        const tokenResponse = await fetch(
          `/api/live/token?channelName=${channelName}&role=subscriber&uid=${uid || Date.now()}`
        );

        if (!tokenResponse.ok) {
          const errorData = await tokenResponse.json();
          if (errorData.error === 'Agora not configured') {
            console.warn('Agora not configured - showing placeholder');
            setIsPlaying(false); // Keep loading state to show message
            return;
          }
          throw new Error(errorData.error || 'Failed to get token');
        }

        const { token, appId, uid: userId, configured } = await tokenResponse.json();

        // Check if Agora is properly configured
        if (!appId || appId === 'mock_app_id' || configured === false) {
          console.warn('Agora not configured - showing placeholder');
          setIsPlaying(false);
          return;
        }

        await initAgora();
        const AgoraRTC = window.AgoraRTC;

        // Create client
        const client = AgoraRTC.createClient({ mode: "live", codec: "vp8" });
        clientRef.current = client;

        // Join channel
        await client.join(appId, channelName, token || null, userId || null);

        // Set client role to audience
        await client.setClientRole("audience");

        // Handle user published
        client.on("user-published", async (user, mediaType) => {
          await client.subscribe(user, mediaType);

          if (mediaType === "video") {
            const remoteVideoTrack = user.videoTrack;
            remoteUsersRef.current[user.uid] = remoteVideoTrack;
            
            if (remoteVideoRef.current && remoteVideoTrack) {
              remoteVideoTrack.play(remoteVideoRef.current);
              setIsPlaying(true);
            }
          }

          if (mediaType === "audio") {
            const remoteAudioTrack = user.audioTrack;
            remoteAudioTrack.play();
          }
        });

        // Handle user unpublished
        client.on("user-unpublished", (user) => {
          if (remoteUsersRef.current[user.uid]) {
        delete remoteUsersRef.current[user.uid];
          }
        });

        // Handle user joined/left for viewer count
        client.on("user-joined", () => {
          setViewers((prev) => prev + 1);
          onViewersUpdate?.(prev => prev + 1);
        });

        client.on("user-left", () => {
          setViewers((prev) => Math.max(0, prev - 1));
          onViewersUpdate?.(prev => Math.max(0, prev - 1));
        });

        // Get current user count (approximate)
        const stats = await client.getLocalVideoStats();
      } catch (error) {
        console.error("Error joining channel:", error);
      }
    };

    joinChannel();

    return () => {
      // Cleanup
      if (clientRef.current) {
        clientRef.current.leave();
        clientRef.current = null;
      }
      if (remoteVideoRef.current) {
        remoteVideoRef.current.innerHTML = "";
      }
      remoteUsersRef.current = {};
    };
  }, [channelName, uid]);

  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden">
      <div ref={remoteVideoRef} className="w-full h-full" />
      
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center max-w-md px-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
            <p className="text-white/70 text-sm mb-2">Connecting to stream...</p>
            <p className="text-white/40 text-xs">
              {typeof window !== "undefined" && !process.env.NEXT_PUBLIC_AGORA_APP_ID
                ? "Agora SDK not configured. Please configure AGORA_APP_ID and AGORA_APP_CERTIFICATE to enable live streaming."
                : "Waiting for stream to start..."}
            </p>
          </div>
        </div>
      )}

      {/* Live Badge */}
      {isPlaying && (
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <span className="px-3 py-1.5 bg-red-500 text-white text-sm font-bold rounded flex items-center gap-2">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            LIVE
          </span>
        </div>
      )}

      {/* Viewers Count */}
      {isPlaying && viewers > 0 && (
        <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-sm text-white text-sm rounded">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
          </svg>
          <span>{viewers}</span>
        </div>
      )}
    </div>
  );
}

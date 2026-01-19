"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { usePrivyAuth } from "@/hooks/usePrivyAuth";
import { Icons } from "@/lib/icons";

export default function GoLiveBroadcaster({ onStreamStarted, onStreamEnded }) {
  const router = useRouter();
  const { displayName, username, profileImage, isCreator } = usePrivyAuth();
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("none");
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  const localVideoRef = useRef(null);
  const screenVideoRef = useRef(null);
  const clientRef = useRef(null);
  const localAudioTrackRef = useRef(null);
  const localVideoTrackRef = useRef(null);
  const screenTrackRef = useRef(null);
  const channelNameRef = useRef(null);

  // Available video filters
  const filters = [
    { id: "none", name: "None", filter: null },
    { id: "blur", name: "Blur", filter: "blur(5px)" },
    { id: "grayscale", name: "Grayscale", filter: "grayscale(100%)" },
    { id: "sepia", name: "Sepia", filter: "sepia(100%)" },
    { id: "brightness", name: "Bright", filter: "brightness(1.5)" },
    { id: "contrast", name: "Contrast", filter: "contrast(1.5)" },
  ];

  // Initialize Agora client
  const initAgora = async () => {
    if (typeof window === "undefined" || !window.AgoraRTC) {
      // Dynamically import Agora SDK
      const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;
      window.AgoraRTC = AgoraRTC;
    }
  };

  const startStream = async () => {
    if (!title.trim()) {
      alert("Please enter a stream title");
      return;
    }

    if (!isCreator) {
      alert("Only verified creators can go live");
      return;
    }

    setIsLoading(true);

    try {
      await initAgora();

      const AgoraRTC = window.AgoraRTC;
      const channelName = `stream_${username || Date.now()}_${Math.random().toString(36).substring(7)}`;
      channelNameRef.current = channelName;

      // Get token from API
      const tokenResponse = await fetch(
        `/api/live/token?channelName=${channelName}&role=publisher&uid=${Date.now()}`
      );

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        if (errorData.error === 'Agora not configured') {
          alert('Agora SDK is not configured. Please set AGORA_APP_ID and AGORA_APP_CERTIFICATE environment variables to enable live streaming.');
          setIsLoading(false);
          return;
        }
        throw new Error(errorData.error || 'Failed to get token');
      }

      const { token, appId, uid, configured } = await tokenResponse.json();

      // Check if Agora is properly configured
      if (!appId || appId === 'mock_app_id' || configured === false) {
        alert('Agora SDK is not configured. Please set AGORA_APP_ID and AGORA_APP_CERTIFICATE environment variables to enable live streaming.');
        setIsLoading(false);
        return;
      }

      // Create Agora client
      const client = AgoraRTC.createClient({ mode: "live", codec: "vp8" });
      clientRef.current = client;

      // Join channel
      await client.join(appId, channelName, token || null, uid || null);

      // Get user media
      const tracks = await AgoraRTC.createMicrophoneAndCameraTracks(
        {},
        {
          encoderConfig: {
            width: { min: 640, ideal: 1280, max: 1920 },
            height: { min: 360, ideal: 720, max: 1080 },
            frameRate: { min: 15, ideal: 30, max: 60 },
          },
        }
      );

      localAudioTrackRef.current = tracks[0];
      localVideoTrackRef.current = tracks[1];

      // Apply filter
      if (selectedFilter !== "none" && localVideoTrackRef.current) {
        const filterEffect = filters.find((f) => f.id === selectedFilter);
        if (filterEffect?.filter) {
          localVideoTrackRef.current.setBeautyEffect(true);
        }
      }

      // Set client role to host (broadcaster)
      await client.setClientRole("host");

      // Publish tracks
      await client.publish([tracks[0], tracks[1]]);

      // Display local video
      if (localVideoRef.current) {
        tracks[1].play(localVideoRef.current);
      }

      setIsLive(true);
      setIsLoading(false);

      // Notify parent component
      onStreamStarted?.({
        channelName,
        title,
        startedAt: new Date().toISOString(),
      });

      // Navigate to stream page after a short delay
      setTimeout(() => {
        router.push(`/live/${channelName}`);
      }, 2000);
    } catch (error) {
      console.error("Error starting stream:", error);
      alert("Failed to start stream. Please check your camera and microphone permissions.");
      setIsLoading(false);
    }
  };

  const stopStream = async () => {
    setIsLoading(true);

    try {
      // Stop and close tracks
      if (localAudioTrackRef.current) {
        localAudioTrackRef.current.stop();
        localAudioTrackRef.current.close();
        localAudioTrackRef.current = null;
      }

      if (localVideoTrackRef.current) {
        localVideoTrackRef.current.stop();
        localVideoTrackRef.current.close();
        localVideoTrackRef.current = null;
      }

      if (screenTrackRef.current) {
        screenTrackRef.current.stop();
        screenTrackRef.current.close();
        screenTrackRef.current = null;
      }

      // Leave channel
      if (clientRef.current) {
        await clientRef.current.leave();
        clientRef.current = null;
      }

      // Clear video elements
      if (localVideoRef.current) {
        localVideoRef.current.innerHTML = "";
      }
      if (screenVideoRef.current) {
        screenVideoRef.current.innerHTML = "";
      }

      setIsLive(false);
      setIsLoading(false);
      setTitle("");
      setIsScreenSharing(false);
      setIsMuted(false);
      setIsVideoEnabled(true);

      onStreamEnded?.();
    } catch (error) {
      console.error("Error stopping stream:", error);
      setIsLoading(false);
    }
  };

  const toggleScreenShare = async () => {
    if (!isLive || !clientRef.current) return;

    try {
      if (!isScreenSharing) {
        // Start screen sharing
        const screenTrack = await window.AgoraRTC.createScreenVideoTrack(
          {},
          "auto"
        );
        screenTrackRef.current = screenTrack;

        // Unpublish current video track
        if (localVideoTrackRef.current) {
          await clientRef.current.unpublish([localVideoTrackRef.current]);
        }

        // Publish screen track
        await clientRef.current.publish([screenTrack]);

        // Display screen share
        if (screenVideoRef.current) {
          screenTrack.play(screenVideoRef.current);
        }

        setIsScreenSharing(true);
      } else {
        // Stop screen sharing
        if (screenTrackRef.current) {
          await clientRef.current.unpublish([screenTrackRef.current]);
          screenTrackRef.current.stop();
          screenTrackRef.current.close();
          screenTrackRef.current = null;
        }

        // Publish video track again
        if (localVideoTrackRef.current) {
          await clientRef.current.publish([localVideoTrackRef.current]);
          if (localVideoRef.current) {
            localVideoTrackRef.current.innerHTML = "";
            localVideoTrackRef.current.appendChild(
              localVideoTrackRef.current.cloneNode(true)
            );
          }
        }

        if (screenVideoRef.current) {
          screenVideoRef.current.innerHTML = "";
        }

        setIsScreenSharing(false);
      }
    } catch (error) {
      console.error("Error toggling screen share:", error);
      alert("Failed to toggle screen sharing");
    }
  };

  const toggleMute = () => {
    if (!localAudioTrackRef.current) return;
    localAudioTrackRef.current.setEnabled(!isMuted);
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    if (!localVideoTrackRef.current) return;
    localVideoTrackRef.current.setEnabled(!isVideoEnabled);
    setIsVideoEnabled(!isVideoEnabled);
  };

  const changeFilter = (filterId) => {
    setSelectedFilter(filterId);
    // Note: Advanced filter effects would need Agora's beauty effect plugin
    // For now, we apply CSS filters as a fallback
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isLive) {
        stopStream();
      }
    };
  }, []);

  if (!isCreator) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-orange-500/20 flex items-center justify-center mb-4">
          <Icons.Live size={32} className="text-orange-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          Creator Access Required
        </h3>
        <p className="text-white/60 text-sm">
          Only verified creators can go live. Apply to become a creator to start streaming.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
      {!isLive ? (
        // Setup View
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
              <Icons.Live size={20} className="text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Go Live</h2>
              <p className="text-white/50 text-sm">Start broadcasting to your audience</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Stream Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your stream title..."
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-[#d4ed31]/50 focus:outline-none"
              maxLength={100}
            />
            <p className="text-xs text-white/40 mt-1">{title.length}/100</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Video Filter
            </label>
            <div className="flex gap-2 flex-wrap">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => changeFilter(filter.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    selectedFilter === filter.id
                      ? "bg-[#d4ed31] text-[#050207]"
                      : "bg-white/5 text-white/70 hover:bg-white/10 border border-white/10"
                  }`}
                >
                  {filter.name}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={startStream}
            disabled={isLoading || !title.trim()}
            className="w-full rounded-xl bg-red-500 py-3 font-semibold text-white hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <span className="w-3 h-3 bg-white rounded-full animate-pulse" />
                Go Live
              </>
            )}
          </button>
        </div>
      ) : (
        // Live View
        <div className="relative">
          <div className="relative aspect-video bg-black">
            <div
              ref={localVideoRef}
              className="w-full h-full"
              style={{
                filter: filters.find((f) => f.id === selectedFilter)?.filter || "none",
              }}
            />
            {isScreenSharing && (
              <div
                ref={screenVideoRef}
                className="absolute inset-0 w-full h-full"
              />
            )}

            {/* Live Badge */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="px-3 py-1.5 bg-red-500 text-white text-sm font-bold rounded flex items-center gap-2">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                LIVE
              </span>
              <span className="px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs rounded">
                {title}
              </span>
            </div>

            {/* Controls Overlay */}
            <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-3 px-4">
              <button
                onClick={toggleMute}
                className={`p-3 rounded-full backdrop-blur-sm transition ${
                  isMuted
                    ? "bg-red-500/80 text-white"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                <Icons.Volume size={20} />
              </button>

              <button
                onClick={toggleVideo}
                className={`p-3 rounded-full backdrop-blur-sm transition ${
                  !isVideoEnabled
                    ? "bg-red-500/80 text-white"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                <Icons.Video size={20} />
              </button>

              <button
                onClick={toggleScreenShare}
                className={`p-3 rounded-full backdrop-blur-sm transition ${
                  isScreenSharing
                    ? "bg-[#d4ed31]/80 text-[#050207]"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                <Icons.Share size={20} />
              </button>

              <button
                onClick={stopStream}
                disabled={isLoading}
                className="px-6 py-3 rounded-full bg-red-500 text-white font-semibold hover:bg-red-600 transition disabled:opacity-50"
              >
                {isLoading ? "Ending..." : "End Stream"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

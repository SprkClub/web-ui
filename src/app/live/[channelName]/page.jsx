"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import LiveStreamPlayer from "@/components/LiveStreamPlayer";
import GoldenCheckmark from "@/components/GoldenCheckmark";
import { Icons } from "@/lib/icons";
import { usePrivyAuth } from "@/hooks/usePrivyAuth";

const navItems = [
  { label: "Home", icon: Icons.Home, href: "/" },
  { label: "Search", icon: Icons.Search, href: "/explore" },
  { label: "Trending Tokens", icon: Icons.TrendingUp, href: "/trends-ranking" },
  { label: "Top Creators", icon: Icons.Medal, href: "/top-creators" },
  { label: "Live", icon: Icons.Live, href: "/live" },
  { label: "Profile", icon: Icons.User, href: "/profile" },
];

export default function LiveStreamPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, displayName, username, profileImage } = usePrivyAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [viewers, setViewers] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [streamInfo, setStreamInfo] = useState(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const channelName = params?.channelName;

  // Mock stream info - replace with API call
  useEffect(() => {
    if (channelName) {
      // In production, fetch stream info from API
      setStreamInfo({
        title: "LIVE STREAM - " + channelName,
        creator: {
          name: "Creator Name",
          username: "creator",
          profileImage: null,
          isCreator: true,
          tokenTicker: "$CREATOR",
        },
        startedAt: new Date().toISOString(),
        marketCap: "$25.2K",
        ath: "$966.3K",
      });
    }
  }, [channelName]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !isAuthenticated) return;

    const message = {
      id: Date.now(),
      user: displayName || username,
      text: newMessage,
      timestamp: new Date().toISOString(),
    };

    setChatMessages((prev) => [...prev, message]);
    setNewMessage("");
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const getStreamUrl = () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/live/${channelName}`;
    }
    return "";
  };

  const handleShare = async (platform) => {
    const url = getStreamUrl();
    const title = streamInfo?.title || "Live Stream";
    const text = `Check out this live stream: ${title}`;

    try {
      switch (platform) {
        case "copy":
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setShowShareMenu(false);
          setTimeout(() => setCopied(false), 2000);
          break;

        case "twitter":
          const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
          window.open(twitterUrl, "_blank", "width=550,height=420");
          setShowShareMenu(false);
          break;

        case "native":
          if (navigator.share) {
            await navigator.share({
              title: title,
              text: text,
              url: url,
            });
            setShowShareMenu(false);
          } else {
            // Fallback to copy
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setShowShareMenu(false);
            setTimeout(() => setCopied(false), 2000);
          }
          break;

        default:
          break;
      }
    } catch (error) {
      console.error("Error sharing:", error);
      // Fallback to copy
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setShowShareMenu(false);
        setTimeout(() => setCopied(false), 2000);
      } catch (copyError) {
        console.error("Error copying to clipboard:", copyError);
      }
    }
  };

  if (!channelName) {
    return (
      <div className="min-h-screen bg-[#050207] flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Stream Not Found</h1>
          <p className="text-white/50 mb-4">The stream you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push("/live")}
            className="px-6 py-3 rounded-xl bg-[#d4ed31] text-[#050207] font-semibold hover:bg-[#eaff5f] transition"
          >
            Go to Live Streams
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-screen bg-[#050207] text-white overflow-hidden">
      {/* Background orbs */}
      <div className="orb absolute -left-32 top-10 h-72 w-72 rounded-full bg-[#d4ed31]/50 hidden lg:block" />
      <div className="orb absolute bottom-0 right-10 h-96 w-96 rounded-full bg-[#4c5259] hidden lg:block" />

      {/* Main container */}
      <div className="relative mx-auto flex w-full max-w-7xl h-full flex-col lg:flex-row gap-4 lg:gap-5 px-3 sm:px-4 lg:px-6 py-4 lg:py-5 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          items={navItems}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((prev) => !prev)}
        />

        {/* Main Content */}
        <div className="flex flex-1 flex-col gap-4 min-h-0 h-full overflow-hidden">
          {/* Stream Player */}
          <div className="flex-shrink-0">
            <LiveStreamPlayer
              channelName={channelName}
              uid={Date.now()}
              onViewersUpdate={setViewers}
            />
          </div>

          {/* Stream Info */}
          {streamInfo && (
            <div className="flex-shrink-0 bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-[#d4ed31]/20 flex items-center justify-center overflow-hidden">
                  {streamInfo.creator.profileImage ? (
                    <img
                      src={streamInfo.creator.profileImage}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-bold text-[#d4ed31]">
                      {streamInfo.creator.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-white text-lg mb-1">{streamInfo.title}</h2>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white/60 text-sm">
                      {streamInfo.creator.name}
                    </span>
                    {streamInfo.creator.isCreator && <GoldenCheckmark size={16} />}
                    {streamInfo.creator.tokenTicker && (
                      <span className="px-2 py-0.5 text-xs bg-[#d4ed31]/20 text-[#d4ed31] rounded font-medium">
                        {streamInfo.creator.tokenTicker}
                      </span>
                    )}
                    <span className="text-white/40 text-xs">
                      Started {formatTimeAgo(streamInfo.startedAt)}
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="px-4 py-2 rounded-xl bg-[#d4ed31]/20 text-[#d4ed31] hover:bg-[#d4ed31]/30 transition text-sm font-medium flex items-center gap-2"
                  >
                    {copied ? (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <Icons.Share size={16} />
                        Share
                      </>
                    )}
                  </button>

                  {/* Share Menu Dropdown */}
                  {showShareMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowShareMenu(false)}
                      />
                      <div className="absolute right-0 top-full mt-2 w-48 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-xl z-20 overflow-hidden">
                        <button
                          onClick={() => handleShare("native")}
                          className="w-full px-4 py-3 text-left text-white hover:bg-white/5 transition flex items-center gap-3 text-sm"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                          Share via...
                        </button>
                        <button
                          onClick={() => handleShare("copy")}
                          className="w-full px-4 py-3 text-left text-white hover:bg-white/5 transition flex items-center gap-3 text-sm border-t border-white/10"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copy link
                        </button>
                        <button
                          onClick={() => handleShare("twitter")}
                          className="w-full px-4 py-3 text-left text-white hover:bg-white/5 transition flex items-center gap-3 text-sm border-t border-white/10"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                          </svg>
                          Share on X
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-4 pt-3 border-t border-white/10">
                <div>
                  <p className="text-xs text-white/50 mb-1">Market Cap</p>
                  <p className="text-white font-semibold">{streamInfo.marketCap}</p>
                </div>
                <div>
                  <p className="text-xs text-white/50 mb-1">ATH</p>
                  <p className="text-white font-semibold">{streamInfo.ath}</p>
                </div>
              </div>
            </div>
          )}

          {/* Chat and Trading Section */}
          <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0 overflow-hidden">
            {/* Chat */}
            <div className="flex flex-col w-full lg:w-80 flex-shrink-0 bg-white/5 border border-white/10 rounded-2xl overflow-hidden min-h-0 h-full lg:h-auto">
              <div className="flex-shrink-0 p-4 border-b border-white/10">
                <h3 className="font-semibold text-white">Live Chat</h3>
                <p className="text-xs text-white/50 mt-1">{viewers} members</p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 no-scrollbar">
                {chatMessages.length === 0 ? (
                  <div className="text-center py-8 text-white/40 text-sm">
                    <p>New messages will appear here</p>
                    {!isAuthenticated && (
                      <p className="mt-2 text-xs">Log in to send messages</p>
                    )}
                  </div>
                ) : (
                  chatMessages.map((msg) => (
                    <div key={msg.id} className="text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-white">{msg.user}</span>
                        <span className="text-white/40 text-xs">
                          {formatTimeAgo(msg.timestamp)}
                        </span>
                      </div>
                      <p className="text-white/80">{msg.text}</p>
                    </div>
                  ))
                )}
              </div>

              {isAuthenticated ? (
                <div className="flex-shrink-0 p-4 border-t border-white/10">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSendMessage();
                        }
                      }}
                      placeholder="Type a message..."
                      className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-white/40 focus:border-[#d4ed31]/50 focus:outline-none text-sm"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="px-4 py-2 rounded-lg bg-[#d4ed31] text-[#050207] font-medium hover:bg-[#eaff5f] transition flex-shrink-0"
                    >
                      Send
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-shrink-0 p-4 border-t border-white/10">
                  <button
                    onClick={() => router.push("/wallet-login")}
                    className="w-full py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 transition text-sm"
                  >
                    Log in to send messages
                  </button>
                </div>
              )}
            </div>

            {/* Trading Interface */}
            <div className="flex flex-col w-full lg:w-80 flex-shrink-0 bg-white/5 border border-white/10 rounded-2xl overflow-hidden min-h-0 h-full lg:h-auto">
              <div className="flex-shrink-0 p-4 border-b border-white/10">
                <h3 className="font-semibold text-white">Trade</h3>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 no-scrollbar">
                <div className="flex gap-2">
                  <button className="flex-1 px-3 py-2 rounded-lg bg-[#d4ed31]/20 text-[#d4ed31] font-medium text-sm">
                    Buy
                  </button>
                  <button className="flex-1 px-3 py-2 rounded-lg bg-white/5 text-white/70 font-medium text-sm hover:bg-white/10 transition">
                    Sell
                  </button>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs text-white/50">Amount (SOL)</label>
                    <button className="text-xs text-[#d4ed31] hover:underline">Set max slippage</button>
                  </div>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-[#d4ed31]/50 focus:outline-none"
                  />
                  <div className="flex gap-2 mt-2">
                    {["Reset", "0.1", "0.5", "1", "Max"].map((amount) => (
                      <button
                        key={amount}
                        className="flex-1 px-2 py-1.5 rounded-lg bg-white/5 text-white/70 text-xs hover:bg-white/10 transition"
                      >
                        {amount} {amount !== "Reset" && amount !== "Max" ? "SOL" : ""}
                      </button>
                    ))}
                  </div>
                </div>

                {isAuthenticated ? (
                  <button className="w-full py-3 rounded-lg bg-[#d4ed31] text-[#050207] font-semibold hover:bg-[#eaff5f] transition">
                    Buy {streamInfo?.creator.tokenTicker || "TOKEN"}
                  </button>
                ) : (
                  <button
                    onClick={() => router.push("/wallet-login")}
                    className="w-full py-3 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 transition text-sm"
                  >
                    Log in to buy
                  </button>
                )}

                <div className="pt-4 border-t border-white/10 space-y-3">
                  <div>
                    <p className="text-xs text-white/50 mb-1">Position</p>
                    <p className="text-white font-semibold">$0.00 0 {streamInfo?.creator.tokenTicker || "TOKEN"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/50 mb-1">Profit/Loss</p>
                    <p className="text-green-400 font-semibold">+$0.00</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

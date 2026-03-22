import { useRef, useState } from "react";
import type { Session } from "../db";

interface SessionCardProps {
  session: Session;
  onSelect: (session: Session) => void;
  onDelete: (id: number) => void;
}

function timeAgo(date: Date | null): string {
  if (!date) return "Never";
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function SessionCard({ session, onSelect, onDelete }: SessionCardProps) {
  const words = session.text.split(/\s+/).filter(Boolean).length;
  const avgWpm =
    session.wpm_history.length > 0
      ? Math.round(
          session.wpm_history.reduce((sum, e) => sum + e.wpm, 0) /
            session.wpm_history.length
        )
      : null;

  const [swipeX, setSwipeX] = useState(0);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const swiping = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    swiping.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    // Only horizontal swipe
    if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
      swiping.current = true;
      setSwipeX(Math.min(0, dx)); // Only swipe left
    }
  };

  const handleTouchEnd = () => {
    touchStartRef.current = null;
    if (swipeX < -100) {
      // Delete threshold
      if (session.id !== undefined) onDelete(session.id);
    }
    setSwipeX(0);
    setTimeout(() => { swiping.current = false; }, 50);
  };

  const handleClick = () => {
    if (!swiping.current) onSelect(session);
  };

  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Delete background */}
      <div
        className="absolute inset-0 flex items-center justify-end px-6"
        style={{
          background: swipeX < -50 ? "rgba(239,68,68,0.3)" : "transparent",
          transition: swipeX === 0 ? "background 0.2s" : "none",
        }}
      >
        {swipeX < -50 && (
          <span className="text-red-400 text-xs font-bold">Delete</span>
        )}
      </div>

      {/* Card content */}
      <div
        className="group flex items-center gap-4 px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors relative"
        style={{
          transform: `translateX(${swipeX}px)`,
          transition: swipeX === 0 ? "transform 0.2s ease-out" : "none",
          background: "#000",
        }}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-text font-bold truncate">{session.title}</p>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/40 uppercase shrink-0">
              {session.mode}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-white/30 mt-1">
            <span>{words} words</span>
            {avgWpm && <span>{avgWpm} avg WPM</span>}
            <span>{session.practice_count}x practised</span>
            <span>{timeAgo(session.last_practised_at)}</span>
          </div>
          {session.tags.length > 0 && (
            <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
              {session.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: "0.625rem",
                    padding: "4px 10px",
                    borderRadius: 999,
                    background: "rgba(255,215,0,0.1)",
                    color: "rgba(255,215,0,0.5)",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (session.id !== undefined) onDelete(session.id);
          }}
          className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 transition-all shrink-0"
          aria-label="Delete session"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>
    </div>
  );
}

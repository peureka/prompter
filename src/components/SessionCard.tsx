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

  return (
    <div
      className="group flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
      onClick={() => onSelect(session)}
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
  );
}

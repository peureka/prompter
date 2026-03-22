import { useLiveQuery } from "dexie-react-hooks";
import { db, type Session } from "../db";
import { Layout } from "./Layout";
import { WpmChart } from "./WpmChart";

interface SessionDetailProps {
  sessionId: number;
  onBack: () => void;
  onStart: (session: Session, mode: "scroll" | "flash") => void;
}

export function SessionDetail({ sessionId, onBack, onStart }: SessionDetailProps) {
  const session = useLiveQuery(() => db.sessions.get(sessionId), [sessionId]);

  if (!session) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full text-white/30">
          Session not found
        </div>
      </Layout>
    );
  }

  const words = session.text.split(/\s+/).filter(Boolean).length;
  const avgWpm =
    session.wpm_history.length > 0
      ? Math.round(
          session.wpm_history.reduce((s, e) => s + e.wpm, 0) /
            session.wpm_history.length
        )
      : null;

  return (
    <Layout>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          paddingTop: 48,
          paddingBottom: 32,
          gap: 24,
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button
            onClick={onBack}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.4)",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontFamily: "inherit",
              padding: "4px 8px",
            }}
          >
            &larr; Back
          </button>
          <h1 style={{ color: "#FFD700", fontSize: "1.125rem", fontWeight: 700 }}>
            Session Details
          </h1>
          <div style={{ width: 56 }} />
        </div>

        {/* Title + Meta */}
        <div>
          <h2 className="text-text text-xl font-bold mb-2">{session.title}</h2>
          <div className="flex items-center gap-3 text-xs text-white/30">
            <span>{words} words</span>
            <span className="uppercase">Last: {session.mode}</span>
            <span>{session.practice_count}x practised</span>
            {avgWpm && <span>{avgWpm} avg WPM</span>}
          </div>
          {session.tags.length > 0 && (
            <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
              {session.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: "0.6875rem",
                    padding: "5px 12px",
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

        {/* WPM Chart */}
        <div>
          <h3 className="text-white/60 text-sm font-bold mb-3">WPM Progress</h3>
          {session.wpm_history.length > 0 ? (
            <WpmChart entries={session.wpm_history} width={360} height={200} />
          ) : (
            <p className="text-white/20 text-sm">
              No practice data yet. Complete a session to see your progress.
            </p>
          )}
        </div>

        {/* Legend */}
        {session.wpm_history.length > 0 && (
          <div className="flex gap-4 text-xs text-white/30">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block" /> Good
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" /> Too slow
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> Too fast
            </span>
          </div>
        )}

        {/* Text preview */}
        <div className="flex-1 overflow-y-auto hide-scrollbar">
          <h3 className="text-white/60 text-sm font-bold mb-2">Text</h3>
          <p className="text-white/30 text-xs leading-relaxed whitespace-pre-wrap">
            {session.text.slice(0, 500)}
            {session.text.length > 500 ? "..." : ""}
          </p>
        </div>

        {/* Mode buttons */}
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => onStart(session, "scroll")}
            style={{
              flex: 1,
              padding: "16px 0",
              borderRadius: 10,
              background: "#FFD700",
              color: "#000",
              fontWeight: 700,
              fontSize: "1rem",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Scroll
          </button>
          <button
            onClick={() => onStart(session, "flash")}
            style={{
              flex: 1,
              padding: "16px 0",
              borderRadius: 10,
              background: "rgba(255,215,0,0.15)",
              color: "#FFD700",
              fontWeight: 700,
              fontSize: "1rem",
              border: "1px solid rgba(255,215,0,0.3)",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Flash
          </button>
        </div>
      </div>
    </Layout>
  );
}

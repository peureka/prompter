import { useState, useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type Session } from "../db";
import { Layout } from "./Layout";
import { SessionCard } from "./SessionCard";
import { GlobalStats } from "./GlobalStats";

interface HomeProps {
  onNewSession: () => void;
  onSelectSession: (session: Session) => void;
}

export function Home({ onNewSession, onSelectSession }: HomeProps) {
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState<string | null>(null);

  const sessions = useLiveQuery(
    () => db.sessions.orderBy("last_practised_at").reverse().toArray(),
    []
  );

  const allTags = useMemo(() => {
    if (!sessions) return [];
    const tags = new Set<string>();
    sessions.forEach((s) => s.tags.forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  }, [sessions]);

  const filtered = useMemo(() => {
    if (!sessions) return [];
    return sessions.filter((s) => {
      if (search && !s.title.toLowerCase().includes(search.toLowerCase()))
        return false;
      if (tagFilter && !s.tags.includes(tagFilter)) return false;
      return true;
    });
  }, [sessions, search, tagFilter]);

  const handleDelete = async (id: number) => {
    await db.sessions.delete(id);
  };

  return (
    <Layout>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          paddingTop: 48,
          paddingBottom: 32,
          gap: 28,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h1
            style={{
              color: "#FFD700",
              fontSize: "1.875rem",
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            Prompter
          </h1>
          <button
            onClick={onNewSession}
            style={{
              flexShrink: 0,
              padding: "12px 28px",
              borderRadius: 10,
              background: "#FFD700",
              color: "#000",
              fontWeight: 700,
              fontSize: "0.875rem",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            + New
          </button>
        </div>

        {/* Search */}
        {sessions && sessions.length > 0 && (
          <>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sessions..."
              className="bg-transparent border border-white/15 rounded-lg px-4 py-3 text-text text-sm placeholder:text-white/20 outline-none focus:border-text/50 transition-colors"
            />

            {allTags.length > 0 && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  onClick={() => setTagFilter(null)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 999,
                    fontSize: "0.75rem",
                    fontFamily: "inherit",
                    border: "none",
                    cursor: "pointer",
                    background: tagFilter === null ? "#FFD700" : "rgba(255,255,255,0.08)",
                    color: tagFilter === null ? "#000" : "rgba(255,255,255,0.4)",
                    fontWeight: tagFilter === null ? 700 : 400,
                  }}
                >
                  All
                </button>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() =>
                      setTagFilter(tagFilter === tag ? null : tag)
                    }
                    style={{
                      padding: "8px 16px",
                      borderRadius: 999,
                      fontSize: "0.75rem",
                      fontFamily: "inherit",
                      border: "none",
                      cursor: "pointer",
                      background: tagFilter === tag ? "#FFD700" : "rgba(255,255,255,0.08)",
                      color: tagFilter === tag ? "#000" : "rgba(255,255,255,0.4)",
                      fontWeight: tagFilter === tag ? 700 : 400,
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* Global stats */}
        {sessions && sessions.some((s) => s.wpm_history.length > 0) && (
          <GlobalStats />
        )}

        {/* Session list */}
        <div className="flex-1 overflow-y-auto hide-scrollbar">
          {filtered.length > 0 ? (
            filtered.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onSelect={onSelectSession}
                onDelete={handleDelete}
              />
            ))
          ) : sessions && sessions.length > 0 ? (
            <p className="text-white/20 text-sm text-center mt-8">
              No matching sessions
            </p>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <p className="text-white/30 text-sm">No saved sessions yet</p>
              <p className="text-white/20 text-xs">
                Tap "+ New" to get started
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

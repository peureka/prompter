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
      <div className="flex flex-col h-full p-6 gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-text text-2xl font-bold">Prompter</h1>
          <button
            onClick={onNewSession}
            className="px-4 py-2 rounded-lg bg-text text-bg font-bold text-sm hover:opacity-90 transition-opacity"
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
              className="bg-transparent border border-white/15 rounded-lg px-4 py-2 text-text text-sm placeholder:text-white/20 outline-none focus:border-text/50 transition-colors"
            />

            {/* Tag filters */}
            {allTags.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setTagFilter(null)}
                  className={`px-3 py-1 rounded-full text-xs transition-colors ${
                    tagFilter === null
                      ? "bg-text text-bg"
                      : "bg-white/8 text-white/40 hover:text-white"
                  }`}
                >
                  All
                </button>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() =>
                      setTagFilter(tagFilter === tag ? null : tag)
                    }
                    className={`px-3 py-1 rounded-full text-xs transition-colors ${
                      tagFilter === tag
                        ? "bg-text text-bg"
                        : "bg-white/8 text-white/40 hover:text-white"
                    }`}
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
        <div className="flex-1 overflow-y-auto -mx-2 hide-scrollbar">
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
            <div className="flex flex-col items-center justify-center h-full gap-2">
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

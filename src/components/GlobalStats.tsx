import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db";
import { WpmChart } from "./WpmChart";

export function GlobalStats() {
  const sessions = useLiveQuery(() => db.sessions.toArray(), []);

  const stats = useMemo(() => {
    if (!sessions || sessions.length === 0) return null;

    const allEntries = sessions.flatMap((s) => s.wpm_history);
    if (allEntries.length === 0) return null;

    const scrollEntries = allEntries.filter((e) => e.mode === "scroll");
    const flashEntries = allEntries.filter((e) => e.mode === "flash");

    const avgWpm = (entries: typeof allEntries) =>
      entries.length > 0
        ? Math.round(entries.reduce((s, e) => s + e.wpm, 0) / entries.length)
        : null;

    const totalPracticeMs = sessions.reduce((sum, s) => {
      return sum + s.wpm_history.reduce((es, e) => es + (e.wpm > 0 ? 60000 / e.wpm * s.text.split(/\s+/).length : 0), 0);
    }, 0);

    // Trend: compare last 5 entries to previous 5
    const sorted = [...allEntries].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    let trend: "up" | "down" | "flat" = "flat";
    if (sorted.length >= 4) {
      const mid = Math.floor(sorted.length / 2);
      const firstHalf = sorted.slice(0, mid);
      const secondHalf = sorted.slice(mid);
      const avgFirst = firstHalf.reduce((s, e) => s + e.wpm, 0) / firstHalf.length;
      const avgSecond = secondHalf.reduce((s, e) => s + e.wpm, 0) / secondHalf.length;
      if (avgSecond > avgFirst + 5) trend = "up";
      else if (avgSecond < avgFirst - 5) trend = "down";
    }

    return {
      totalSessions: sessions.length,
      totalPractices: sessions.reduce((s, sess) => s + sess.practice_count, 0),
      avgScrollWpm: avgWpm(scrollEntries),
      avgFlashWpm: avgWpm(flashEntries),
      totalPracticeMinutes: Math.round(totalPracticeMs / 60000),
      trend,
      allEntries: sorted,
    };
  }, [sessions]);

  if (!stats) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <h2 className="text-text font-bold text-lg">Progress</h2>
        {stats.trend === "up" && <span className="text-green-400 text-sm">↑</span>}
        {stats.trend === "down" && <span className="text-red-400 text-sm">↓</span>}
      </div>

      <div className="flex gap-6 text-center">
        <div>
          <p className="text-xl font-bold text-text">{stats.totalPractices}</p>
          <p className="text-white/40 text-xs">Sessions</p>
        </div>
        {stats.avgScrollWpm && (
          <div>
            <p className="text-xl font-bold text-text">{stats.avgScrollWpm}</p>
            <p className="text-white/40 text-xs">Scroll WPM</p>
          </div>
        )}
        {stats.avgFlashWpm && (
          <div>
            <p className="text-xl font-bold text-text">{stats.avgFlashWpm}</p>
            <p className="text-white/40 text-xs">Flash WPM</p>
          </div>
        )}
      </div>

      <WpmChart entries={stats.allEntries} width={360} height={180} />

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
    </div>
  );
}

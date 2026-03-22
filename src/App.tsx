import { useCallback, useState } from "react";
import { db, type Session, type WpmEntry } from "./db";
import { Home } from "./components/Home";
import { TextInput } from "./components/TextInput";
import { ScrollMode } from "./components/ScrollMode";
import { FlashMode } from "./components/FlashMode";
import { SessionDetail } from "./components/SessionDetail";
import { SCROLL_WPM_DEFAULT, FONT_SIZE_DEFAULT } from "./lib/constants";

interface ActiveSession {
  id: number;
  text: string;
  mode: "scroll" | "flash";
  speed_wpm: number;
  font_size: number;
  tags: string[];
}

function App() {
  const [view, setView] = useState<"home" | "input" | "scroll" | "flash" | "detail">(
    "home"
  );
  const [active, setActive] = useState<ActiveSession | null>(null);
  const [detailSessionId, setDetailSessionId] = useState<number | null>(null);

  const handleStart = useCallback(
    async (text: string, title: string, mode: "scroll" | "flash", tags: string[]) => {
      const id = await db.sessions.add({
        title,
        text,
        mode,
        speed_wpm: SCROLL_WPM_DEFAULT,
        font_size: FONT_SIZE_DEFAULT,
        created_at: new Date(),
        last_practised_at: new Date(),
        practice_count: 1,
        tags,
        wpm_history: [],
      });
      setActive({
        id: id as number,
        text,
        mode,
        speed_wpm: SCROLL_WPM_DEFAULT,
        font_size: FONT_SIZE_DEFAULT,
        tags,
      });
      setView(mode);
    },
    []
  );

  const handleSelectSession = useCallback(async (session: Session) => {
    if (session.id === undefined) return;
    setDetailSessionId(session.id);
    setView("detail");
  }, []);

  const handleStartFromDetail = useCallback(async (session: Session) => {
    if (session.id === undefined) return;
    await db.sessions.update(session.id, {
      last_practised_at: new Date(),
      practice_count: session.practice_count + 1,
    });
    setActive({
      id: session.id,
      text: session.text,
      mode: session.mode,
      speed_wpm: session.speed_wpm,
      font_size: session.font_size,
      tags: session.tags,
    });
    setView(session.mode);
  }, []);

  const handleSettingsChange = useCallback(
    async (wpm: number, fontSizeIndex: number) => {
      if (!active) return;
      await db.sessions.update(active.id, {
        speed_wpm: wpm,
        font_size: fontSizeIndex,
      });
    },
    [active]
  );

  const handleFlashRate = useCallback(
    async (rating: "slow" | "good" | "fast", wpm: number) => {
      if (!active) return;
      const session = await db.sessions.get(active.id);
      if (!session) return;
      const entry: WpmEntry = {
        date: new Date().toISOString(),
        wpm,
        mode: "flash",
        comfort: rating,
      };
      await db.sessions.update(active.id, {
        wpm_history: [...session.wpm_history, entry],
      });
    },
    [active]
  );

  const handleScrollComplete = useCallback(
    async (wpm: number, comfort: "slow" | "good" | "fast") => {
      if (!active) return;
      const session = await db.sessions.get(active.id);
      if (!session) return;
      const entry: WpmEntry = {
        date: new Date().toISOString(),
        wpm,
        mode: "scroll",
        comfort,
      };
      await db.sessions.update(active.id, {
        wpm_history: [...session.wpm_history, entry],
      });
    },
    [active]
  );

  const handleExit = useCallback(() => {
    setView("home");
    setActive(null);
  }, []);

  return (
    <>
      {view === "home" && (
        <Home
          onNewSession={() => setView("input")}
          onSelectSession={handleSelectSession}
        />
      )}
      {view === "detail" && detailSessionId !== null && (
        <SessionDetail
          sessionId={detailSessionId}
          onBack={() => setView("home")}
          onStart={handleStartFromDetail}
        />
      )}
      {view === "input" && (
        <TextInput onStart={handleStart} onBack={() => setView("home")} />
      )}
      {view === "scroll" && active && (
        <ScrollMode
          text={active.text}
          onExit={handleExit}
          onComplete={handleScrollComplete}
          initialWpm={active.speed_wpm}
          initialFontSize={active.font_size}
          onSettingsChange={handleSettingsChange}
        />
      )}
      {view === "flash" && active && (
        <FlashMode
          text={active.text}
          onExit={handleExit}
          onRate={handleFlashRate}
          initialWpm={active.speed_wpm}
          initialFontSize={active.font_size}
          onSettingsChange={handleSettingsChange}
        />
      )}
    </>
  );
}

export default App;

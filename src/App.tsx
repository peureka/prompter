import { useCallback, useState } from "react";
import { db, type Session, type WpmEntry } from "./db";
import { Home } from "./components/Home";
import { TextInput } from "./components/TextInput";
import { ScrollMode } from "./components/ScrollMode";
import { FlashMode } from "./components/FlashMode";
import { SCROLL_WPM_DEFAULT, FONT_SIZE_DEFAULT } from "./lib/constants";

function App() {
  const [view, setView] = useState<"home" | "input" | "scroll" | "flash">(
    "home"
  );
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [activeText, setActiveText] = useState("");

  const handleStart = useCallback(
    async (text: string, title: string, mode: "scroll" | "flash") => {
      const id = await db.sessions.add({
        title,
        text,
        mode,
        speed_wpm: SCROLL_WPM_DEFAULT,
        font_size: FONT_SIZE_DEFAULT,
        created_at: new Date(),
        last_practised_at: new Date(),
        practice_count: 1,
        tags: [],
        wpm_history: [],
      });
      setActiveSessionId(id as number);
      setActiveText(text);
      setView(mode);
    },
    []
  );

  const handleSelectSession = useCallback(
    async (session: Session) => {
      if (session.id === undefined) return;
      await db.sessions.update(session.id, {
        last_practised_at: new Date(),
        practice_count: session.practice_count + 1,
      });
      setActiveSessionId(session.id);
      setActiveText(session.text);
      setView(session.mode);
    },
    []
  );

  const handleFlashRate = useCallback(
    async (rating: "slow" | "good" | "fast", wpm: number) => {
      if (activeSessionId === null) return;
      const session = await db.sessions.get(activeSessionId);
      if (!session) return;
      const entry: WpmEntry = {
        date: new Date().toISOString(),
        wpm,
        mode: "flash",
        comfort: rating,
      };
      await db.sessions.update(activeSessionId, {
        wpm_history: [...session.wpm_history, entry],
      });
    },
    [activeSessionId]
  );

  const handleScrollComplete = useCallback(
    async (wpm: number, comfort: "slow" | "good" | "fast") => {
      if (activeSessionId === null) return;
      const session = await db.sessions.get(activeSessionId);
      if (!session) return;
      const entry: WpmEntry = {
        date: new Date().toISOString(),
        wpm,
        mode: "scroll",
        comfort,
      };
      await db.sessions.update(activeSessionId, {
        wpm_history: [...session.wpm_history, entry],
      });
    },
    [activeSessionId]
  );

  const handleExit = useCallback(() => {
    setView("home");
    setActiveSessionId(null);
  }, []);

  return (
    <>
      {view === "home" && (
        <Home
          onNewSession={() => setView("input")}
          onSelectSession={handleSelectSession}
        />
      )}
      {view === "input" && (
        <TextInput onStart={handleStart} onBack={() => setView("home")} />
      )}
      {view === "scroll" && activeText && (
        <ScrollMode text={activeText} onExit={handleExit} onComplete={handleScrollComplete} />
      )}
      {view === "flash" && activeText && (
        <FlashMode
          text={activeText}
          onExit={handleExit}
          onRate={handleFlashRate}
        />
      )}
    </>
  );
}

export default App;

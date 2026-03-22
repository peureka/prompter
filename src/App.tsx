import { useCallback, useState } from "react";
import { Home } from "./components/Home";
import { TextInput } from "./components/TextInput";
import { ScrollMode } from "./components/ScrollMode";
import { FlashMode } from "./components/FlashMode";

interface SessionData {
  text: string;
  title: string;
  mode: "scroll" | "flash";
}

function App() {
  const [view, setView] = useState<"home" | "input" | "scroll" | "flash">(
    "home"
  );
  const [session, setSession] = useState<SessionData | null>(null);

  const handleStart = useCallback(
    (text: string, title: string, mode: "scroll" | "flash") => {
      setSession({ text, title, mode });
      setView(mode);
    },
    []
  );

  return (
    <>
      {view === "home" && (
        <Home onNewSession={() => setView("input")} />
      )}
      {view === "input" && (
        <TextInput
          onStart={handleStart}
          onBack={() => setView("home")}
        />
      )}
      {view === "scroll" && session && (
        <ScrollMode text={session.text} onExit={() => setView("home")} />
      )}
      {view === "flash" && session && (
        <FlashMode text={session.text} onExit={() => setView("home")} />
      )}
    </>
  );
}

export default App;

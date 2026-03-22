import { useState } from "react";
import { ScrollMode } from "./components/ScrollMode";

const SAMPLE_TEXT = `The art of public speaking is not about perfection. It is about connection. When you stand before an audience, they are not looking for flawless delivery. They are looking for authenticity.

Every great speaker started exactly where you are now. Uncertain. Nervous. Wondering if the words would come out right. The secret they all discovered is the same one you will find: practice transforms anxiety into energy.

//pause

The words on this screen are your anchor. Let them guide your eyes and your voice will follow. Do not rush. Do not hesitate. Find the rhythm that feels natural to you and let it carry you forward.

Breathe between paragraphs. Let silence do its work. A pause is not empty space — it is emphasis. It tells your audience that what comes next matters.

//pause

You are not reading. You are delivering. There is a difference. Reading is mechanical. Delivery is alive. It has pace, it has tone, it has intention behind every phrase.

Trust the process. Trust the practice. Trust yourself.`;

function App() {
  const [view, setView] = useState<"home" | "input" | "scroll" | "flash" | "stats">("scroll");

  return (
    <>
      {view === "scroll" && (
        <ScrollMode text={SAMPLE_TEXT} onExit={() => setView("home")} />
      )}
      {view === "home" && (
        <div className="w-full h-full flex items-center justify-center">
          <button
            onClick={() => setView("scroll")}
            className="px-8 py-4 rounded-lg bg-text text-bg font-bold text-xl"
          >
            Start Scroll Mode
          </button>
        </div>
      )}
    </>
  );
}

export default App;

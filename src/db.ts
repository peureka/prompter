import Dexie, { type EntityTable } from "dexie";

export interface WpmEntry {
  date: string;
  wpm: number;
  mode: "scroll" | "flash";
  comfort: "slow" | "good" | "fast";
}

export interface Session {
  id?: number;
  title: string;
  text: string;
  mode: "scroll" | "flash";
  speed_wpm: number;
  font_size: number;
  created_at: Date;
  last_practised_at: Date | null;
  practice_count: number;
  tags: string[];
  wpm_history: WpmEntry[];
}

const db = new Dexie("prompter") as Dexie & {
  sessions: EntityTable<Session, "id">;
};

db.version(1).stores({
  sessions: "++id, title, mode, last_practised_at, *tags",
});

export { db };

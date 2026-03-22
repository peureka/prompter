import { Layout } from "./Layout";

interface HomeProps {
  onNewSession: () => void;
}

export function Home({ onNewSession }: HomeProps) {
  return (
    <Layout>
      <div className="flex flex-col h-full items-center justify-center gap-8 p-6">
        <div className="text-center">
          <h1 className="text-text text-4xl font-bold mb-2">Prompter</h1>
          <p className="text-white/40 text-sm">
            Teleprompter for practising and delivering spoken content
          </p>
        </div>

        <button
          onClick={onNewSession}
          className="px-8 py-4 rounded-lg bg-text text-bg font-bold text-xl hover:opacity-90 transition-opacity"
        >
          New Session
        </button>

        <p className="text-white/20 text-xs">No saved sessions yet</p>
      </div>
    </Layout>
  );
}

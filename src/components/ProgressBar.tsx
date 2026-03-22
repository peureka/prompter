interface ProgressBarProps {
  progress: number;
}

export function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="fixed bottom-0 left-0 w-full h-[2px] z-40">
      <div
        className="h-full bg-text transition-[width] duration-100"
        style={{ width: `${Math.min(progress * 100, 100)}%` }}
      />
    </div>
  );
}

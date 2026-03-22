import type { ReactNode } from "react";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="w-full h-full flex flex-col items-center bg-bg">
      <div className="w-full max-w-[800px] h-full relative px-6 md:px-10">
        {children}
      </div>
    </div>
  );
}

import type { ReactNode } from "react";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="w-full h-full flex flex-col items-center bg-bg px-6 md:px-10">
      <div className="w-full max-w-[800px] h-full relative">
        {children}
      </div>
    </div>
  );
}

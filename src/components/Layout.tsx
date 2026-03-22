import type { ReactNode } from "react";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: "#000",
        padding: "0 clamp(24px, 5vw, 48px)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 720,
          height: "100%",
          position: "relative",
        }}
      >
        {children}
      </div>
    </div>
  );
}

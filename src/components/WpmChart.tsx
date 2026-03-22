import { useEffect, useRef } from "react";
import type { WpmEntry } from "../db";

interface WpmChartProps {
  entries: WpmEntry[];
  width?: number;
  height?: number;
}

const COMFORT_COLORS: Record<string, string> = {
  slow: "#FBBF24",
  good: "#34D399",
  fast: "#F87171",
};

export function WpmChart({ entries, width = 400, height = 200 }: WpmChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || entries.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Clear
    ctx.clearRect(0, 0, width, height);

    const padding = { top: 20, right: 20, bottom: 30, left: 45 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const wpms = entries.map((e) => e.wpm);
    const minWpm = Math.max(0, Math.min(...wpms) - 20);
    const maxWpm = Math.max(...wpms) + 20;
    const wpmRange = maxWpm - minWpm || 1;

    const xStep = entries.length > 1 ? chartW / (entries.length - 1) : chartW / 2;

    // Grid lines
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    const gridLines = 4;
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (chartH / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      // Y-axis labels
      const wpmVal = Math.round(maxWpm - (wpmRange / gridLines) * i);
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.font = "10px monospace";
      ctx.textAlign = "right";
      ctx.fillText(`${wpmVal}`, padding.left - 8, y + 4);
    }

    // Line
    ctx.beginPath();
    ctx.strokeStyle = "#FFD700";
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";

    entries.forEach((entry, i) => {
      const x = padding.left + (entries.length > 1 ? i * xStep : chartW / 2);
      const y = padding.top + chartH - ((entry.wpm - minWpm) / wpmRange) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Dots
    entries.forEach((entry, i) => {
      const x = padding.left + (entries.length > 1 ? i * xStep : chartW / 2);
      const y = padding.top + chartH - ((entry.wpm - minWpm) / wpmRange) * chartH;

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = COMFORT_COLORS[entry.comfort] || "#FFD700";
      ctx.fill();
    });

    // X-axis dates (show first, middle, last)
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.font = "10px monospace";
    ctx.textAlign = "center";
    const dateIndices = entries.length <= 3
      ? entries.map((_, i) => i)
      : [0, Math.floor(entries.length / 2), entries.length - 1];

    dateIndices.forEach((i) => {
      const x = padding.left + (entries.length > 1 ? i * xStep : chartW / 2);
      const date = new Date(entries[i].date);
      const label = `${date.getMonth() + 1}/${date.getDate()}`;
      ctx.fillText(label, x, height - 8);
    });
  }, [entries, width, height]);

  if (entries.length === 0) {
    return (
      <div className="flex items-center justify-center text-white/20 text-sm" style={{ width, height }}>
        No data yet
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      style={{ width, height }}
      className="block"
    />
  );
}

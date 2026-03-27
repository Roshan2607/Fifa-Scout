"use client";

import { motion } from "framer-motion";

interface StatInputProps {
  label: string;
  name: string;
  value: number;
  onChange: (name: string, value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export function StatInput({ label, name, value, onChange, min = 0, max = 99, step = 1 }: StatInputProps) {
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  const barColor =
    pct >= 80 ? "#00e5a0" :
    pct >= 55 ? "#0ea5e9" :
    pct >= 35 ? "#fbbf24" : "#ff4d6d";

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-2">
        <label htmlFor={name} style={{
          fontFamily: "var(--font-display)", fontSize: 10, fontWeight: 600,
          letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "var(--text-2)",
        }}>
          {label.replace(/_/g, " ")}
        </label>
        <motion.span
          key={value}
          initial={{ scale: 1.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.15 }}
          style={{
            fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600,
            color: barColor, minWidth: 28, textAlign: "right" as const,
          }}
        >
          {value}
        </motion.span>
      </div>

      {/* Track + thumb overlaid together */}
      <div className="relative" style={{ height: 16 }}>
        {/* Background track */}
        <div style={{
          position: "absolute", top: "50%", left: 0, right: 0,
          height: 3, borderRadius: 99, background: "rgba(255,255,255,0.06)",
          transform: "translateY(-50%)", pointerEvents: "none",
        }} />
        {/* Filled track */}
        <div style={{
          position: "absolute", top: "50%", left: 0,
          height: 3, borderRadius: 99, background: barColor,
          boxShadow: `0 0 8px ${barColor}88`,
          width: `${pct}%`,
          transform: "translateY(-50%)",
          transition: "width 0.1s ease, background 0.2s ease",
          pointerEvents: "none",
        }} />
        {/* Range input — transparent track, only thumb visible */}
        <input
          id={name}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(name, Number(e.target.value))}
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            WebkitAppearance: "none", appearance: "none" as const,
            background: "transparent",
            cursor: "pointer", outline: "none", margin: 0, padding: 0,
          }}
        />
      </div>

      <style>{`
        #${name}::-webkit-slider-runnable-track {
          background: transparent;
          height: 16px;
        }
        #${name}::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #080f1c;
          border: 2px solid ${barColor};
          box-shadow: 0 0 10px ${barColor}bb;
          cursor: pointer;
          margin-top: 0px;
          transition: transform 0.15s, box-shadow 0.15s;
        }
        #${name}::-webkit-slider-thumb:hover {
          transform: scale(1.3);
          box-shadow: 0 0 20px ${barColor};
        }
        #${name}::-moz-range-track {
          background: transparent;
          height: 16px;
        }
        #${name}::-moz-range-thumb {
          width: 16px; height: 16px;
          border-radius: 50%;
          background: #080f1c;
          border: 2px solid ${barColor};
          box-shadow: 0 0 10px ${barColor}bb;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
  color?: string;
}

export function MetricCard({ label, value, sub, accent, color }: MetricCardProps) {
  const c = color ?? (accent ? "var(--accent)" : "var(--text)");
  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      style={accent ? { borderColor: "rgba(0,229,160,0.2)", boxShadow: "0 0 30px rgba(0,229,160,0.07)" } : {}}
    >
      <p className="label mb-2">{label}</p>
      <p style={{
        fontFamily: "var(--font-display)", fontSize: "1.9rem", fontWeight: 800,
        letterSpacing: "0.01em", lineHeight: 1, color: c,
        textShadow: accent ? `0 0 30px ${c}55` : "none",
      }}>
        {value}
      </p>
      {sub && (
        <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-3)", marginTop: 6, letterSpacing: "0.06em" }}>
          {sub}
        </p>
      )}
    </motion.div>
  );
}
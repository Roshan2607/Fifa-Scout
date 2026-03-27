"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface StatCardProps {
  label: string;
  name: string;
  value: number;
  onChange: (name: string, value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

const getColor = (pct: number) =>
  pct >= 80 ? "#00e5a0" : pct >= 55 ? "#0ea5e9" : pct >= 35 ? "#fbbf24" : "#ff4d6d";

export function StatCard({ label, name, value, onChange, min = 0, max = 99, step = 1 }: StatCardProps) {
  const pct   = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  const color = getColor(pct);
  const [decHover, setDecHover] = useState(false);
  const [incHover, setIncHover] = useState(false);

  const dec = () => onChange(name, Math.max(min, +(value - step).toFixed(2)));
  const inc = () => onChange(name, Math.min(max, +(value + step).toFixed(2)));

  const btnStyle = (hovered: boolean) => ({
    width: 22, height: 22, borderRadius: 6,
    border: `1px solid ${hovered ? color : "var(--border)"}`,
    background: hovered ? color + "18" : "transparent",
    color: hovered ? color : "var(--text-3)",
    fontSize: 15, lineHeight: 1, cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "all 0.15s", fontWeight: 700, flexShrink: 0,
  });

  return (
    <div className="stat-card">
      <p style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-2)", lineHeight: 1 }}>
        {label.replace(/_/g, " ")}
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <button
          onClick={dec}
          onMouseEnter={() => setDecHover(true)}
          onMouseLeave={() => setDecHover(false)}
          style={btnStyle(decHover)}
        >−</button>

        <motion.span key={value}
          initial={{ scale: 1.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.12 }}
          style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 16, fontWeight: 600, color, minWidth: 28, textAlign: "center", lineHeight: 1 }}>
          {value}
        </motion.span>

        <button
          onClick={inc}
          onMouseEnter={() => setIncHover(true)}
          onMouseLeave={() => setIncHover(false)}
          style={btnStyle(incHover)}
        >+</button>
      </div>

      <div style={{ height: 2, borderRadius: 99, background: "var(--border)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 99, transition: "width 0.15s, background 0.2s", boxShadow: `0 0 6px ${color}66` }} />
      </div>
    </div>
  );
}
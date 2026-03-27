"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, User } from "lucide-react";
import type { PlayerStats } from "@/lib/api";

interface PlayerResult {
  player_id: number;
  short_name: string;
  long_name: string;
  overall: number;
  age: number;
  primary_position: string;
  club_name: string;
  league_name: string;
  [key: string]: number | string;
}

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface Props {
  onSelect: (stats: PlayerStats, name: string) => void;
  selectedName?: string;
}

export function PlayerSearch({ onSelect, selectedName }: Props) {
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState<PlayerResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen]       = useState(false);
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 0 });
  const timeoutRef            = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputWrapRef          = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (inputWrapRef.current && !inputWrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Reposition on scroll/resize
  useEffect(() => {
    if (!open) return;
    const update = () => {
      if (inputWrapRef.current) {
        const r = inputWrapRef.current.getBoundingClientRect();
        setDropPos({ top: r.bottom + 6, left: r.left, width: r.width });
      }
    };
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => { window.removeEventListener("scroll", update, true); window.removeEventListener("resize", update); };
  }, [open]);

  useEffect(() => {
    if (query.length < 2) { setResults([]); setOpen(false); return; }
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/api/players/search?q=${encodeURIComponent(query)}&limit=8`);
        const data = await res.json();
        setResults(data);
        if (inputWrapRef.current) {
          const r = inputWrapRef.current.getBoundingClientRect();
          setDropPos({ top: r.bottom + 6, left: r.left, width: r.width });
        }
        setOpen(true);
      } catch {} finally { setLoading(false); }
    }, 300);
  }, [query]);

  const handleSelect = (p: PlayerResult) => {
    const stats: PlayerStats = {
      age: Number(p.age), overall: Number(p.overall),
      potential: Number(p.potential ?? p.overall),
      international_reputation: Number(p.international_reputation ?? 1),
      pace: Number(p.pace ?? 50), shooting: Number(p.shooting ?? 50),
      passing: Number(p.passing ?? 50), dribbling: Number(p.dribbling ?? 50),
      defending: Number(p.defending ?? 50), physic: Number(p.physic ?? 50),
      movement_acceleration: Number(p.movement_acceleration ?? 50),
      movement_sprint_speed: Number(p.movement_sprint_speed ?? 50),
      movement_agility: Number(p.movement_agility ?? 50),
      movement_reactions: Number(p.movement_reactions ?? 50),
      movement_balance: Number(p.movement_balance ?? 50),
      power_stamina: Number(p.power_stamina ?? 50),
      power_strength: Number(p.power_strength ?? 50),
      power_jumping: Number(p.power_jumping ?? 50),
      power_shot_power: Number(p.power_shot_power ?? 50),
      power_long_shots: Number(p.power_long_shots ?? 50),
      mentality_vision: Number(p.mentality_vision ?? 50),
      mentality_composure: Number(p.mentality_composure ?? 50),
      mentality_positioning: Number(p.mentality_positioning ?? 50),
      mentality_aggression: Number(p.mentality_aggression ?? 50),
      mentality_interceptions: Number(p.mentality_interceptions ?? 50),
      mentality_penalties: Number(p.mentality_penalties ?? 50),
      skill_ball_control: Number(p.skill_ball_control ?? 50),
      skill_dribbling: Number(p.skill_dribbling ?? 50),
      skill_curve: Number(p.skill_curve ?? 50),
      skill_fk_accuracy: Number(p.skill_fk_accuracy ?? 50),
      skill_long_passing: Number(p.skill_long_passing ?? 50),
      attacking_crossing: Number(p.attacking_crossing ?? 50),
      attacking_finishing: Number(p.attacking_finishing ?? 50),
      attacking_heading_accuracy: Number(p.attacking_heading_accuracy ?? 50),
      attacking_short_passing: Number(p.attacking_short_passing ?? 50),
      attacking_volleys: Number(p.attacking_volleys ?? 50),
      defending_marking_awareness: Number(p.defending_marking_awareness ?? 50),
      defending_standing_tackle: Number(p.defending_standing_tackle ?? 50),
      defending_sliding_tackle: Number(p.defending_sliding_tackle ?? 50),
    };
    onSelect(stats, p.short_name);
    setQuery("");
    setOpen(false);
  };

  const clear = () => { setQuery(""); setResults([]); setOpen(false); onSelect({} as PlayerStats, ""); };
  const showSelected = selectedName && !query;

  const dropdown = mounted && open && results.length > 0 ? createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -6, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.15 }}
        style={{
          position: "fixed",
          top: dropPos.top,
          left: dropPos.left,
          width: dropPos.width,
          background: "var(--bg-card)",
          border: "1px solid var(--border-bright)",
          borderRadius: 10,
          overflow: "hidden",
          zIndex: 999999,
          boxShadow: "0 16px 48px rgba(0,0,0,0.35)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        {results.map((p, i) => (
          <motion.button key={p.player_id}
            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
            onClick={() => handleSelect(p)}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "transparent", border: "none", borderBottom: i < results.length - 1 ? "1px solid var(--border)" : "none", cursor: "pointer", textAlign: "left", transition: "background 0.15s" }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-hover)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <div style={{ width: 38, height: 38, borderRadius: 8, background: "var(--accent-dim)", border: "1px solid var(--accent)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 15, fontWeight: 800, color: "var(--accent)", lineHeight: 1 }}>{p.overall}</span>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, color: "var(--accent)", opacity: 0.7, letterSpacing: "0.05em" }}>OVR</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 14, fontWeight: 700, color: "var(--text)", letterSpacing: "0.02em", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.short_name}</p>
              <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "var(--text-3)", marginTop: 2, letterSpacing: "0.06em" }}>{p.primary_position} · {p.club_name}</p>
            </div>
            <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-3)", flexShrink: 0 }}>AGE {p.age}</span>
          </motion.button>
        ))}
      </motion.div>
    </AnimatePresence>,
    document.body
  ) : null;

  return (
    <>
      <div ref={inputWrapRef} style={{ position: "relative" }}>
        {showSelected
          ? <User size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--accent)", pointerEvents: "none" }} />
          : <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", pointerEvents: "none" }} />
        }

        {showSelected ? (
          <div className="input" style={{ paddingLeft: 36, paddingRight: 36, display: "flex", alignItems: "center", cursor: "default", color: "var(--accent)", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 600, letterSpacing: "0.04em", fontSize: 14 }}>
            {selectedName}
          </div>
        ) : (
          <input
            type="text"
            placeholder="Search player to auto-fill stats..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setOpen(true)}
            className="input"
            style={{ paddingLeft: 36, paddingRight: 36 }}
            autoComplete="off"
          />
        )}

        {(query || selectedName) && (
          <button onClick={clear} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", display: "flex", padding: 4 }}>
            <X size={13} />
          </button>
        )}
      </div>

      {loading && !open && (
        <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "var(--text-3)", marginTop: 6, letterSpacing: "0.06em" }}>Searching...</p>
      )}

      {dropdown}
    </>
  );
}
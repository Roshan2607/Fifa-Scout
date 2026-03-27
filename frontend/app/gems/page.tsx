"use client";

import { useState } from "react";
import CountUp from "react-countup";
import { motion, AnimatePresence } from "framer-motion";
import { api, type PlayerStats, type GreatnessResponse } from "@/lib/api";
import { POSITION_PRESETS } from "@/lib/presets";
import { StatCard } from "@/components/ui/StatCard";
import { PlayerSearch } from "@/components/ui/PlayerSearch";
import { PlayerRadar3D } from "@/components/charts/PlayerRadar3D";
import { Zap, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";

const POSITIONS   = Object.keys(POSITION_PRESETS);
const CORE_STATS  = ["pace","shooting","passing","dribbling","defending","physic"] as const;
const EXTRA_STATS = ["movement_acceleration","movement_sprint_speed","power_stamina","power_strength","mentality_vision","mentality_composure","skill_ball_control","attacking_finishing"] as const;

export default function GemsPage() {
  const [stats, setStats]       = useState<PlayerStats>({ ...POSITION_PRESETS.CAM, age: 21, overall: 72, potential: 84 });
  const [deltas, setDeltas]     = useState({ delta_overall: 0, delta_power_strength: 0, delta_skill_ball_control: 0, delta_attacking_finishing: 0 });
  const [result, setResult]     = useState<GreatnessResponse | null>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [advanced, setAdvanced] = useState(false);
  const [selectedName, setSelectedName] = useState("");

  const set  = (name: string, v: number) => setStats(s => ({ ...s, [name]: v }));
  const setD = (name: string, v: number) => setDeltas(d => ({ ...d, [name]: v }));

  const handleSubmit = async () => {
    setLoading(true); setError(null);
    try {
      setResult(await api.predictGreatness(stats, deltas.delta_overall, deltas.delta_power_strength, deltas.delta_skill_ball_control, deltas.delta_attacking_finishing));
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Error"); }
    finally { setLoading(false); }
  };

  const radarData = CORE_STATS.map(s => ({ stat: s.charAt(0).toUpperCase() + s.slice(1), value: (stats as Record<string,number>)[s] ?? 0 }));
  const upside = result ? result.predicted_peak_overall - stats.overall : 0;

  return (
    <div className="max-w-5xl">
      <div className="flex items-center gap-3 mb-2">
        <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--accent-dim)", border: "1px solid var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Zap size={15} color="var(--accent)" />
        </div>
        <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "1.7rem", fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase" }}>Who'll Be Great?</h1>
      </div>
      <p className="mb-6" style={{ color: "var(--text-2)", fontSize: 13 }}>XGBoost regressor — predicts peak overall from composite ability scores and career momentum.</p>

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 space-y-4">
          <div className="card" style={{ overflow: "visible", position: "relative", zIndex: 1000 }}>
            <p className="label mb-3">Auto-fill from player</p>
            <PlayerSearch selectedName={selectedName} onSelect={(s, n) => { setStats(s); setSelectedName(n); }} />
          </div>

          <div className="card">
            <p className="label mb-3">Position template</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {POSITIONS.map(pos => (
                <button key={pos} onClick={() => { setStats({ ...POSITION_PRESETS[pos] }); setSelectedName(""); }}
                  style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg-card-2)", fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", color: "var(--text-2)", cursor: "pointer", transition: "all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-2)"; }}>
                  {pos}
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <p className="label mb-4">Core</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 14 }}>
              <StatCard label="Age"      name="age"       value={stats.age}       onChange={set} min={15} max={45} />
              <StatCard label="Overall"  name="overall"   value={stats.overall}   onChange={set} min={40} max={99} />
              <StatCard label="Potential" name="potential" value={stats.potential} onChange={set} min={40} max={99} />
              <StatCard label="Int. Rep" name="international_reputation" value={stats.international_reputation ?? 1} onChange={set} min={1} max={5} />
            </div>
            <p className="label mb-3">Stat block</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {CORE_STATS.map(s => <StatCard key={s} label={s} name={s} value={(stats as Record<string,number>)[s] ?? 50} onChange={set} />)}
            </div>
          </div>

          <div className="card">
            <p className="label mb-1">Career Momentum</p>
            <p style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 14, fontFamily: "'JetBrains Mono',monospace" }}>Δ vs previous FIFA version — 0 for new players</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
              <StatCard label="Δ Overall"      name="delta_overall"             value={deltas.delta_overall}             onChange={setD} min={-10} max={10} />
              <StatCard label="Δ Strength"     name="delta_power_strength"      value={deltas.delta_power_strength}      onChange={setD} min={-10} max={10} />
              <StatCard label="Δ Ball Control" name="delta_skill_ball_control"  value={deltas.delta_skill_ball_control}  onChange={setD} min={-10} max={10} />
              <StatCard label="Δ Finishing"    name="delta_attacking_finishing" value={deltas.delta_attacking_finishing} onChange={setD} min={-10} max={10} />
            </div>
          </div>

          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <button onClick={() => setAdvanced(v => !v)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", background: "transparent", border: "none", cursor: "pointer" }}>
              <span className="label">Advanced Stats</span>
              {advanced ? <ChevronUp size={14} color="var(--text-3)" /> : <ChevronDown size={14} color="var(--text-3)" />}
            </button>
            <AnimatePresence>
              {advanced && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} style={{ overflow: "hidden" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, padding: "0 20px 20px" }}>
                    {EXTRA_STATS.map(s => <StatCard key={s} label={s} name={s} value={(stats as Record<string,number>)[s] ?? 50} onChange={set} />)}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button onClick={handleSubmit} disabled={loading}
            style={{ width: "100%", padding: "13px 0", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "var(--accent)", color: "#020a0f", fontFamily: "'Barlow Condensed',sans-serif", fontSize: 14, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1 }}>
            {loading ? "Predicting..." : <><span>Predict Peak Overall</span><ArrowRight size={16} /></>}
          </button>
          {error && <p style={{ color: "var(--red)", fontSize: 12, textAlign: "center", fontFamily: "'JetBrains Mono',monospace" }}>{error}</p>}
        </div>

        <div className="space-y-4">
          <div className="card" style={{ padding: "0.75rem" }}><PlayerRadar3D data={radarData} /></div>
          <AnimatePresence>
            {result && (
              <>
                <motion.div className="card card-accent" initial={{ opacity: 0, y: 16, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.4, ease: [0.22,1,0.36,1] }}>
                  <p className="label mb-2">Predicted Peak</p>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "3rem", fontWeight: 800, lineHeight: 1, color: "var(--accent)", textShadow: "0 0 40px rgba(0,229,160,0.35)" }}>
                    <CountUp end={result.predicted_peak_overall} duration={1.2} decimals={1} />
                  </div>
                  <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "var(--text-3)", marginTop: 6 }}>Range {result.confidence_interval[0]} – {result.confidence_interval[1]}</p>
                </motion.div>
                <motion.div className="card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                  <p className="label mb-2">Upside</p>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "2rem", fontWeight: 800, lineHeight: 1, color: upside >= 0 ? "var(--accent)" : "var(--red)" }}>
                    {upside >= 0 ? "+" : ""}<CountUp end={upside} duration={1} decimals={1} />
                  </div>
                  <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "var(--text-3)", marginTop: 6 }}>Above current overall</p>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
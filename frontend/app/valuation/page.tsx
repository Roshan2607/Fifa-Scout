"use client";

import { useState } from "react";
import CountUp from "react-countup";
import { motion, AnimatePresence } from "framer-motion";
import { api, type PlayerStats, type ValuationResponse } from "@/lib/api";
import { POSITION_PRESETS } from "@/lib/presets";
import { StatCard } from "@/components/ui/StatCard";
import { PlayerSearch } from "@/components/ui/PlayerSearch";
import { PlayerRadar3D } from "@/components/charts/PlayerRadar3D";
import { DollarSign, ArrowRight } from "lucide-react";

const POSITIONS  = Object.keys(POSITION_PRESETS);
const CORE_STATS = ["pace","shooting","passing","dribbling","defending","physic"] as const;

export default function ValuationPage() {
  const [stats, setStats]     = useState<PlayerStats>({ ...POSITION_PRESETS.CAM, age: 22, overall: 76, potential: 85 });
  const [momentum, setMomentum] = useState(1);
  const [result, setResult]   = useState<ValuationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState("");

  const set = (name: string, v: number) => setStats(s => ({ ...s, [name]: v }));

  const handleSubmit = async () => {
    setLoading(true); setError(null);
    try { setResult(await api.predictValuation(stats, momentum)); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : "Error"); }
    finally { setLoading(false); }
  };

  const radarData = CORE_STATS.map(s => ({ stat: s.charAt(0).toUpperCase() + s.slice(1), value: (stats as Record<string,number>)[s] ?? 0 }));
  const valueM = result ? result.predicted_value_eur / 1_000_000 : 0;

  return (
    <div className="max-w-5xl">
      <div className="flex items-center gap-3 mb-2">
        <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--accent-dim)", border: "1px solid var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <DollarSign size={15} color="var(--accent)" />
        </div>
        <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "1.7rem", fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase" }}>Player Value</h1>
      </div>
      <p className="mb-6" style={{ color: "var(--text-2)", fontSize: 13 }}>XGBoost trained on log₁p(value_eur) — predicts market value from age, composite scores and momentum.</p>

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
            <p className="label mb-4">Profile</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 14 }}>
              <StatCard label="Age"       name="age"       value={stats.age}       onChange={set} min={15} max={45} />
              <StatCard label="Overall"   name="overall"   value={stats.overall}   onChange={set} min={40} max={99} />
              <StatCard label="Potential" name="potential" value={stats.potential} onChange={set} min={40} max={99} />
              <StatCard label="Int. Rep"  name="international_reputation" value={stats.international_reputation ?? 1} onChange={set} min={1} max={5} />
            </div>
            <p className="label mb-3">Stat block</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 14 }}>
              {CORE_STATS.map(s => <StatCard key={s} label={s} name={s} value={(stats as Record<string,number>)[s] ?? 50} onChange={set} />)}
            </div>
            <p className="label mb-3">Momentum</p>
            <div style={{ maxWidth: 120 }}>
              <StatCard label="Momentum" name="momentum" value={momentum} onChange={(_, v) => setMomentum(v)} min={-5} max={10} />
            </div>
          </div>

          <button onClick={handleSubmit} disabled={loading}
            style={{ width: "100%", padding: "13px 0", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "var(--accent)", color: "#020a0f", fontFamily: "'Barlow Condensed',sans-serif", fontSize: 14, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1 }}>
            {loading ? "Valuing..." : <><span>Predict Market Value</span><ArrowRight size={16} /></>}
          </button>
          {error && <p style={{ color: "var(--red)", fontSize: 12, textAlign: "center", fontFamily: "'JetBrains Mono',monospace" }}>{error}</p>}
        </div>

        <div className="space-y-4">
          <div className="card" style={{ padding: "0.75rem" }}><PlayerRadar3D data={radarData} color="#0ea5e9" /></div>
          <AnimatePresence>
            {result && (
              <>
                <motion.div className="card card-accent" initial={{ opacity: 0, y: 16, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.4, ease: [0.22,1,0.36,1] }}>
                  <p className="label mb-2">Market Value</p>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "2.6rem", fontWeight: 800, lineHeight: 1, color: "var(--accent)", textShadow: "0 0 40px rgba(0,229,160,0.35)" }}>
                    €<CountUp end={valueM} duration={1.4} decimals={1} />M
                  </div>
                  <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "var(--accent)", marginTop: 6, opacity: 0.7 }}>{result.value_band}</p>
                </motion.div>
                {result.comparable_players.length > 0 && (
                  <motion.div className="card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <p className="label mb-3">Comparable Players</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {result.comparable_players.map((name, i) => (
                        <motion.div key={name} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.07 }}
                          style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 22, height: 22, borderRadius: 6, background: "var(--accent-dim)", border: "1px solid var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontFamily: "'JetBrains Mono',monospace", color: "var(--accent)", fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                          <span style={{ fontSize: 13, color: "var(--text)" }}>{name}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
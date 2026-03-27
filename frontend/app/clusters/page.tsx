"use client";

import { useState, useEffect } from "react";
import CountUp from "react-countup";
import { motion, AnimatePresence } from "framer-motion";
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { api, type PlayerStats, type ClusterResponse, type ClusterMapPoint } from "@/lib/api";
import { POSITION_PRESETS } from "@/lib/presets";
import { StatCard } from "@/components/ui/StatCard";
import { PlayerSearch } from "@/components/ui/PlayerSearch";
import { PlayerRadar3D } from "@/components/charts/PlayerRadar3D";
import { GitBranch, ArrowRight, Trophy, TrendingDown, Users, Map } from "lucide-react";

const POSITIONS  = Object.keys(POSITION_PRESETS);
const CORE_STATS = ["pace","shooting","passing","dribbling","defending","physic"] as const;

const CLUSTER_COLORS: Record<number, string> = {
  0: "#00e5a0", 1: "#0ea5e9", 2: "#a78bfa", 3: "#fb923c",
  4: "#f472b6", 5: "#facc15", 6: "#34d399", 7: "#60a5fa",
  8: "#c084fc", 9: "#f87171",
};

const CLUSTER_LABELS: Record<number, string> = {
  0: "Pacey Wideman", 1: "Deep-Lying Playmaker", 2: "Box-to-Box Midfielder",
  3: "Target Striker", 4: "Ball-Playing Defender", 5: "Pressing Forward",
  6: "Goalkeeper", 7: "Complete Forward", 8: "Defensive Midfielder", 9: "Creative Attacker",
};

// Why this cluster? Short explanation per archetype
const CLUSTER_WHY: Record<number, string> = {
  0: "High pace + wide play stats. Model detects explosive wide movement profile.",
  1: "Strong passing + vision with low attacking output. Classic deep creator.",
  2: "Balanced stamina, passing and defensive work rate. Engine of midfield.",
  3: "High physic + heading + finishing. Dominant aerial threat up front.",
  4: "Strong defending with above-average passing. Ball-playing centre-back.",
  5: "High aggression + pressing stats. Relentless forward pressure role.",
  6: "Low field stats, high composure and reactions. Clear goalkeeper profile.",
  7: "Top-tier across pace, shooting, dribbling. Fully rounded attacking player.",
  8: "High interceptions + defensive work rate with low attacking contribution.",
  9: "Peak dribbling + vision + low defending. Pure creative attacking output.",
};

export default function ClustersPage() {
  const [stats, setStats]     = useState<PlayerStats>({ ...POSITION_PRESETS.ST });
  const [result, setResult]   = useState<ClusterResponse | null>(null);
  const [mapData, setMapData] = useState<ClusterMapPoint[]>([]);
  const [mapLoading, setMapLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState("");
  const [hoveredPlayer, setHoveredPlayer] = useState<ClusterMapPoint | null>(null);

  const set = (name: string, v: number) => setStats(s => ({ ...s, [name]: v }));

  const handleSubmit = async () => {
    setLoading(true); setError(null);
    try { setResult(await api.predictCluster(stats)); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : "Error"); }
    finally { setLoading(false); }
  };

  const loadMap = async () => {
    if (mapData.length > 0) return;
    setMapLoading(true);
    try { setMapData(await api.getClusterMap()); }
    catch {} finally { setMapLoading(false); }
  };

  const clusterColor = result ? (CLUSTER_COLORS[result.cluster_id] ?? "#00e5a0") : "#00e5a0";
  const radarData = CORE_STATS.map(s => ({ stat: s.charAt(0).toUpperCase() + s.slice(1), value: (stats as Record<string,number>)[s] ?? 0 }));

  // Sample map data for performance (max 800 points)
  const sampledMap = mapData.length > 800 ? mapData.filter((_, i) => i % Math.ceil(mapData.length / 800) === 0) : mapData;

  return (
    <div className="max-w-5xl">
      <div className="flex items-center gap-3 mb-2">
        <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--accent-dim)", border: "1px solid var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <GitBranch size={15} color="var(--accent)" />
        </div>
        <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "1.7rem", fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase" }}>Budget Gems</h1>
      </div>
      <p className="mb-6" style={{ color: "var(--text-2)", fontSize: 13 }}>K-Means clustering — groups players by statistical archetype, flags undervalued ones within each tier.</p>

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
            <p className="label mb-4">Stats</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 14 }}>
              <StatCard label="Age"      name="age"      value={stats.age}      onChange={set} min={15} max={45} />
              <StatCard label="Overall"  name="overall"  value={stats.overall}  onChange={set} min={40} max={99} />
              <StatCard label="Potential" name="potential" value={stats.potential} onChange={set} min={40} max={99} />
              <StatCard label="Int. Rep" name="international_reputation" value={stats.international_reputation ?? 1} onChange={set} min={1} max={5} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {CORE_STATS.map(s => <StatCard key={s} label={s} name={s} value={(stats as Record<string,number>)[s] ?? 50} onChange={set} />)}
            </div>
          </div>

          <button onClick={handleSubmit} disabled={loading}
            style={{ width: "100%", padding: "13px 0", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "var(--accent)", color: "#020a0f", fontFamily: "'Barlow Condensed',sans-serif", fontSize: 14, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1 }}>
            {loading ? "Clustering..." : <><span>Find My Cluster</span><ArrowRight size={16} /></>}
          </button>
          {error && <p style={{ color: "var(--red)", fontSize: 12, textAlign: "center", fontFamily: "'JetBrains Mono',monospace" }}>{error}</p>}

          {/* Cluster map */}
          <div className="card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Map size={13} color="var(--text-3)" />
                <p className="label">Player Cluster Map</p>
              </div>
              {mapData.length === 0 && (
                <button onClick={loadMap} disabled={mapLoading}
                  style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid var(--accent)", background: "var(--accent-dim)", fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--accent)", cursor: "pointer" }}>
                  {mapLoading ? "Loading..." : "Load Map"}
                </button>
              )}
            </div>

            {mapData.length > 0 ? (
              <>
                <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "var(--text-3)", marginBottom: 10, letterSpacing: "0.06em" }}>
                  UMAP 2D projection · {sampledMap.length} players · coloured by cluster
                </p>
                <ResponsiveContainer width="100%" height={280}>
                  <ScatterChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                    <XAxis dataKey="umap_x" type="number" domain={["auto","auto"]} tick={false} axisLine={false} tickLine={false} />
                    <YAxis dataKey="umap_y" type="number" domain={["auto","auto"]} tick={false} axisLine={false} tickLine={false} />
                    <Tooltip
                      cursor={false}
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const p = payload[0].payload as ClusterMapPoint;
                        return (
                          <div className="glass-dropdown" style={{ borderRadius: 8, padding: "8px 12px" }}>
                            <p style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13, fontWeight: 700, color: CLUSTER_COLORS[p.cluster] ?? "#fff" }}>{p.short_name}</p>
                            <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "var(--text-3)", marginTop: 2 }}>OVR {p.overall} · {CLUSTER_LABELS[p.cluster]}</p>
                            <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "var(--text-3)", marginTop: 1 }}>x: {p.umap_x?.toFixed(2)} · y: {p.umap_y?.toFixed(2)}</p>
                            {p.is_bargain && <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "var(--accent)", marginTop: 2 }}>🏷️ BARGAIN · €{((p.value_gap ?? 0) / 1_000_000).toFixed(1)}M below median</p>}
                          </div>
                        );
                      }}
                    />
                    <Scatter data={sampledMap} isAnimationActive={false}>
                      {sampledMap.map((entry, i) => (
                        <Cell key={i} fill={CLUSTER_COLORS[entry.cluster] ?? "#888"} fillOpacity={entry.is_bargain ? 1 : 0.45} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
                {/* Legend */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                  {Object.entries(CLUSTER_LABELS).map(([id, label]) => (
                    <div key={id} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: CLUSTER_COLORS[Number(id)] }} />
                      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: "var(--text-3)", letterSpacing: "0.04em" }}>{label}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ height: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "var(--text-3)" }}>
                  {mapLoading ? "Loading cluster map..." : "Click Load Map to visualise all players"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          <div className="card" style={{ padding: "0.75rem" }}>
            <PlayerRadar3D data={radarData} color={clusterColor} />
          </div>

          <AnimatePresence>
            {result && (
              <>
                <motion.div className="card" style={{ borderColor: clusterColor + "44" }}
                  initial={{ opacity: 0, y: 16, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.4, ease: [0.22,1,0.36,1] }}>
                  <p className="label mb-2">Player Archetype</p>
                  <p style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "1.4rem", fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase", color: clusterColor, lineHeight: 1.2 }}>
                    {result.cluster_label}
                  </p>
                  <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "var(--text-3)", marginTop: 4, letterSpacing: "0.08em" }}>CLUSTER #{result.cluster_id}</p>
                  {/* Why explanation */}
                  <p style={{ fontSize: 12, color: "var(--text-2)", marginTop: 10, lineHeight: 1.5, borderTop: "1px solid var(--border)", paddingTop: 10 }}>
                    {CLUSTER_WHY[result.cluster_id]}
                  </p>
                </motion.div>

                <motion.div className="card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    {result.is_bargain ? <Trophy size={16} color="var(--accent)" /> : <TrendingDown size={16} color="var(--text-3)" />}
                    <p className="label">{result.is_bargain ? "Bargain Alert" : "Fair Value"}</p>
                  </div>
                  {result.is_bargain && result.value_gap_eur != null ? (
                    <>
                      <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "1.6rem", fontWeight: 800, color: "var(--accent)" }}>
                        €<CountUp end={result.value_gap_eur / 1_000_000} duration={1} decimals={1} />M
                      </div>
                      <p style={{ fontSize: 11, fontFamily: "'JetBrains Mono',monospace", color: "var(--text-3)", marginTop: 4 }}>below cluster median price</p>
                      <p style={{ fontSize: 12, color: "var(--text-2)", marginTop: 8, lineHeight: 1.5 }}>
                        Players in this cluster typically cost more — this one is underpriced for their statistical tier.
                      </p>
                    </>
                  ) : (
                    <p style={{ fontSize: 12, color: "var(--text-2)" }}>Priced in line with similar players in this cluster.</p>
                  )}
                </motion.div>

                {result.cluster_peers.length > 0 && (
                  <motion.div className="card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <Users size={13} color="var(--text-3)" />
                      <p className="label">Statistical Peers</p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {result.cluster_peers.map((name, i) => (
                        <motion.div key={name} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.22 + i * 0.06 }}
                          style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 22, height: 22, borderRadius: 6, background: clusterColor + "18", border: `1px solid ${clusterColor}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontFamily: "'JetBrains Mono',monospace", color: clusterColor, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                          <span style={{ fontSize: 13, color: "var(--text)" }}>{name}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </AnimatePresence>

          {!result && (
            <div className="card" style={{ borderStyle: "dashed", textAlign: "center" }}>
              <p style={{ padding: "2rem 0", fontSize: 11, color: "var(--text-3)", fontFamily: "'JetBrains Mono',monospace" }}>Set stats and<br />find your cluster</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
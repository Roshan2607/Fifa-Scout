"use client";

import { useState, useEffect } from "react";
import CountUp from "react-countup";
import { motion, AnimatePresence } from "framer-motion";
import { api, type PlayerStats, type ChemistryResponse, type Team } from "@/lib/api";
import { POSITION_PRESETS } from "@/lib/presets";
import { StatCard } from "@/components/ui/StatCard";
import { PlayerSearch } from "@/components/ui/PlayerSearch";
import { PlayerRadar3D } from "@/components/charts/PlayerRadar3D";
import { GitBranch, ArrowRight } from "lucide-react";

const POSITIONS  = Object.keys(POSITION_PRESETS);
const LEAGUE_FLAGS: Record<string, string> = {
  "Premier League": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "La Liga": "🇪🇸", "Bundesliga": "🇩🇪",
  "Serie A": "🇮🇹", "Ligue 1": "🇫🇷", "Eredivisie": "🇳🇱",
  "Primeira Liga": "🇵🇹", "MLS": "🇺🇸", "Saudi Pro League": "🇸🇦",
};

const FIT_COLORS: Record<string, string> = {
  "Strong Fit": "#00e5a0", "Moderate Fit": "#fbbf24", "Poor Fit": "#ff4d6d",
};

const FIT_WHY: Record<string, string> = {
  "Strong Fit":   "Player's composite scores closely match what this team's tactical profile demands. High probability based on similar player-team pairings in training data.",
  "Moderate Fit": "Some alignment with team tactics but gaps exist. Player may need positional adaptation or the team would need to adjust their style.",
  "Poor Fit":     "Statistical profile does not align with team's tactical DNA. Key attributes the team relies on are not strong suits of this player.",
};

async function fetchTeams(): Promise<Team[]> {
  for (const v of [23, 22, 21, 20, 19, 18, 17, 16, 15]) {
    try {
      const teams = await api.getTeams(v);
      if (teams.length > 0) return teams;
    } catch {}
  }
  return [];
}

export default function ChemistryPage() {
  const [stats, setStats]       = useState<PlayerStats>({ ...POSITION_PRESETS.CM });
  const [teams, setTeams]       = useState<Team[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);
  const [search, setSearch]     = useState("");
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [selectedTeamName, setSelectedTeamName] = useState("");
  const [result, setResult]     = useState<ChemistryResponse | null>(null);
  const [loading, setLoading]   = useState(false);
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [selectedPlayerName, setSelectedPlayerName] = useState("");

  useEffect(() => {
    fetchTeams().then(t => { setTeams(t); setFilteredTeams(t); setTeamsLoading(false); })
      .catch(() => setTeamsLoading(false));
  }, []);

  useEffect(() => {
    setFilteredTeams(!search.trim() ? teams : teams.filter(t =>
      t.team_name.toLowerCase().includes(search.toLowerCase()) ||
      t.league_name.toLowerCase().includes(search.toLowerCase())
    ));
  }, [search, teams]);

  const set = (name: string, v: number) => setStats(s => ({ ...s, [name]: v }));

  const selectTeam = (t: Team) => {
    setSelectedTeam(t.team_id);
    setSelectedTeamName(`${t.team_name} — ${t.league_name}`);
    setSearch("");
  };

  const handleSubmit = async () => {
    if (!selectedTeam) { setError("Select a team first."); return; }
    setLoading(true); setError(null);
    try { setResult(await api.predictChemistry(stats, selectedTeam)); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : "Error"); }
    finally { setLoading(false); }
  };

  const radarData = ["pace","shooting","passing","dribbling","defending","physic"]
    .map(s => ({ stat: s.charAt(0).toUpperCase() + s.slice(1), value: (stats as Record<string,number>)[s] ?? 0 }));

  const fitColor = result ? (FIT_COLORS[result.fit_label] ?? "#00e5a0") : "#00e5a0";
  const fitPct   = result ? Math.round(result.fit_probability * 100) : 0;

  return (
    <div className="max-w-5xl">
      <div className="flex items-center gap-3 mb-2">
        <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--accent-dim)", border: "1px solid var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <GitBranch size={15} color="var(--accent)" />
        </div>
        <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "1.7rem", fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase" }}>Chemistry Fit</h1>
      </div>
      <p className="mb-6" style={{ color: "var(--text-2)", fontSize: 13 }}>Random Forest trained on actual FIFA rosters — probability a player fits a team's tactical DNA.</p>

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 space-y-4">

          {/* Player search */}
          <div className="card" style={{ overflow: "visible", position: "relative", zIndex: 1000 }}>
            <p className="label mb-3">Auto-fill player stats</p>
            <PlayerSearch selectedName={selectedPlayerName} onSelect={(s, n) => { setStats(s); setSelectedPlayerName(n); }} />
          </div>

          {/* Position template */}
          <div className="card">
            <p className="label mb-3">Position template</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {POSITIONS.map(pos => (
                <button key={pos} onClick={() => { setStats({ ...POSITION_PRESETS[pos] }); setSelectedPlayerName(""); }}
                  style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg-card-2)", fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", color: "var(--text-2)", cursor: "pointer", transition: "all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-2)"; }}>
                  {pos}
                </button>
              ))}
            </div>
          </div>

          {/* Team search */}
          <div className="card" style={{ overflow: "visible", position: "relative", zIndex: 1000 }}>
            <p className="label mb-3">Select Team</p>
            {selectedTeamName && !search ? (
              <div style={{ position: "relative" }}>
                <div className="input" style={{ color: "var(--accent)", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 600, fontSize: 14, letterSpacing: "0.04em", cursor: "default", paddingRight: 36 }}>
                  {selectedTeamName}
                </div>
                <button onClick={() => { setSelectedTeam(null); setSelectedTeamName(""); }}
                  style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", display: "flex", padding: 4 }}>
                  ✕
                </button>
              </div>
            ) : (
              <div style={{ position: "relative" }}>
                <input type="text"
                  placeholder={teamsLoading ? "Loading teams..." : `Search ${teams.length} teams...`}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="input"
                  disabled={teamsLoading}
                  autoComplete="off"
                />
                <AnimatePresence>
                  {search.trim().length > 0 && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, background: "var(--bg-card)", border: "1px solid var(--border-bright)", borderRadius: 10, overflow: "hidden", zIndex: 9999, maxHeight: 220, overflowY: "auto", boxShadow: "0 16px 48px rgba(0,0,0,0.25)" }}>
                      {filteredTeams.length === 0 ? (
                        <p style={{ padding: "10px 16px", fontSize: 12, color: "var(--text-3)", fontFamily: "'JetBrains Mono',monospace" }}>No teams found</p>
                      ) : filteredTeams.slice(0, 50).map(t => (
                        <button key={t.team_id} onClick={() => selectTeam(t)}
                          style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", background: "transparent", border: "none", borderBottom: "1px solid var(--border)", cursor: "pointer", textAlign: "left", transition: "background 0.15s" }}
                          onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-hover)")}
                          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                        >
                          <span style={{ fontSize: 16 }}>{LEAGUE_FLAGS[t.league_name] ?? "🏟️"}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13, fontWeight: 700, color: "var(--text)", letterSpacing: "0.02em" }}>{t.team_name}</span>
                            <span style={{ marginLeft: 8, fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "var(--text-3)" }}>{t.league_name} · OVR {t.overall}</span>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="card">
            <p className="label mb-4">Player Stats</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {["pace","shooting","passing","dribbling","defending","physic",
                "power_stamina","power_strength","mentality_aggression"].map(s => (
                <StatCard key={s} label={s.replace(/_/g," ")} name={s}
                  value={(stats as Record<string,number>)[s] ?? 50} onChange={set} />
              ))}
            </div>
          </div>

          <button onClick={handleSubmit} disabled={loading || !selectedTeam}
            style={{ width: "100%", padding: "13px 0", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "var(--accent)", color: "#020a0f", fontFamily: "'Barlow Condensed',sans-serif", fontSize: 14, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", border: "none", cursor: !selectedTeam ? "not-allowed" : "pointer", opacity: loading || !selectedTeam ? 0.5 : 1 }}>
            {loading ? "Scoring..." : <><span>Score Chemistry</span><ArrowRight size={16} /></>}
          </button>
          {error && <p style={{ color: "var(--red)", fontSize: 12, textAlign: "center", fontFamily: "'JetBrains Mono',monospace" }}>{error}</p>}
        </div>

        {/* Right */}
        <div className="space-y-4">
          <div className="card" style={{ padding: "0.75rem" }}>
            <PlayerRadar3D data={radarData} color={fitColor} />
          </div>

          <AnimatePresence>
            {result && (
              <>
                {/* Big % */}
                <motion.div className="card" style={{ textAlign: "center", borderColor: fitColor + "44" }}
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: [0.22,1,0.36,1] }}>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "3.5rem", fontWeight: 800, lineHeight: 1, color: fitColor, textShadow: `0 0 40px ${fitColor}55` }}>
                    <CountUp end={fitPct} duration={1.2} suffix="%" />
                  </div>
                  <div style={{ display: "inline-block", marginTop: 8, padding: "3px 12px", borderRadius: 4, background: fitColor + "18", border: `1px solid ${fitColor}33`, fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: fitColor }}>
                    {result.fit_label}
                  </div>
                  {/* Why */}
                  <p style={{ fontSize: 12, color: "var(--text-2)", marginTop: 12, lineHeight: 1.5, textAlign: "left" }}>
                    {FIT_WHY[result.fit_label]}
                  </p>
                </motion.div>

                {/* Matching */}
                <motion.div className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <p className="label mb-3">Top Matching</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {result.top_matching_attributes.map((a, i) => (
                      <motion.div key={a} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.06 }}
                        style={{ padding: "7px 12px", borderRadius: 6, background: "rgba(0,229,160,0.07)", border: "1px solid rgba(0,229,160,0.15)", fontSize: 12, color: "var(--accent)", fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                        {a}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Gaps */}
                <motion.div className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <p className="label mb-3">Gaps to Fill</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {result.top_mismatching_attributes.map((a, i) => (
                      <motion.div key={a} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + i * 0.06 }}
                        style={{ padding: "7px 12px", borderRadius: 6, background: "rgba(255,77,109,0.07)", border: "1px solid rgba(255,77,109,0.15)", fontSize: 12, color: "var(--red)", fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                        {a}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {!result && (
            <div className="card" style={{ borderStyle: "dashed", textAlign: "center" }}>
              <p style={{ padding: "2rem 0", fontSize: 11, color: "var(--text-3)", fontFamily: "'JetBrains Mono',monospace" }}>
                Search a team +<br />score chemistry
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
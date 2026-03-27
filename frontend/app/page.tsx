"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import Link from "next/link";
import { Zap, GitBranch, Users, DollarSign, ArrowLeftRight, ArrowRight, Database, Cpu, Network } from "lucide-react";

// ── Scroll-triggered reveal wrapper ─────────────────────────────────────────
function Reveal({ children, delay = 0, direction = "up" }: {
  children: React.ReactNode; delay?: number; direction?: "up" | "left" | "right" | "scale"
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const variants = {
    up:    { hidden: { opacity: 0, y: 40 },       visible: { opacity: 1, y: 0 } },
    left:  { hidden: { opacity: 0, x: -40 },      visible: { opacity: 1, x: 0 } },
    right: { hidden: { opacity: 0, x: 40 },       visible: { opacity: 1, x: 0 } },
    scale: { hidden: { opacity: 0, scale: 0.88 }, visible: { opacity: 1, scale: 1 } },
  };

  return (
    <motion.div ref={ref}
      variants={variants[direction]}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ── Horizontal scroll marquee ────────────────────────────────────────────────
const MARQUEE_ITEMS = [
  "XGBoost Regressor", "K-Means Clustering", "Random Forest", "UMAP Projection",
  "Career Momentum", "Tactic Vectors", "Feature Engineering", "Log-Transform",
  "Delta Features", "Composite Scores", "Player-ID Split", "No Data Leakage",
];

function Marquee() {
  return (
    <div style={{ overflow: "hidden", width: "100%", padding: "12px 0", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", margin: "60px 0" }}>
      <motion.div
        style={{ display: "flex", gap: 32, width: "max-content" }}
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
          <span key={i} style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-3)", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 12 }}>
            {item}
            <span style={{ color: "var(--accent)", opacity: 0.4 }}>◆</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ── Big stat counter ─────────────────────────────────────────────────────────
function StatBadge({ value, label }: { value: string; label: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: [0.22,1,0.36,1] }}
      style={{ textAlign: "center" }}
    >
      <p style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "clamp(2rem,5vw,3.2rem)", fontWeight: 800, letterSpacing: "-0.01em", color: "var(--accent)", lineHeight: 1, textShadow: "0 0 40px rgba(0,229,160,0.3)" }}>{value}</p>
      <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "var(--text-3)", marginTop: 6, letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</p>
    </motion.div>
  );
}

// ── Model card ───────────────────────────────────────────────────────────────
const MODELS = [
  {
    href: "/gems", icon: Zap, num: "02", color: "#00e5a0",
    title: "Who'll Be Great?",
    algo: "XGBoost Regressor",
    desc: "Predicts a player's peak overall using age curve, composite ability scores and career momentum deltas across FIFA versions.",
    features: ["age + overall", "attack/defence/physical/mental score", "Δ overall, Δ strength, Δ ball control, Δ finishing"],
    insight: "Delta features across FIFA versions reveal trajectory — a rising 20-year-old scores higher than a declining 30-year-old with the same current rating.",
  },
  {
    href: "/clusters", icon: GitBranch, num: "03", color: "#0ea5e9",
    title: "Budget Gems",
    algo: "K-Means + UMAP",
    desc: "Groups players into 10 statistical archetypes. Flags players priced below their cluster median — undervalued for their tier.",
    features: ["15 granular stats", "StandardScaler normalisation", "UMAP 2D projection"],
    insight: "Unsupervised — no labels needed. Market mispricing is detected by comparing value_eur against cluster peers, not an arbitrary threshold.",
  },
  {
    href: "/chemistry", icon: Users, num: "04", color: "#a78bfa",
    title: "Chemistry Fit",
    algo: "Random Forest Classifier",
    desc: "Scores probability that a player fits a team's tactical DNA. Trained on actual FIFA rosters — the label is implicit in who already plays where.",
    features: ["attack/defence/physical/mental score", "17 normalised tactic vector columns", "tv_ prefix separates player vs team features"],
    insight: "No manual labelling needed. If a player plays for a team, they fit. The Random Forest learns what fit looks like from 385K+ team-player pairings.",
  },
  {
    href: "/valuation", icon: DollarSign, num: "05", color: "#fb923c",
    title: "Player Value",
    algo: "XGBoost Regressor",
    desc: "Predicts market value in euros. Trained on log₁p(value_eur) to handle extreme right-skew — Mbappe at €180M vs League Two at €50K.",
    features: ["age, overall, potential", "attack/defence/physical/mental score", "momentum (mean career delta)"],
    insight: "Log-transform prevents the loss function obsessing over superstars. Inverse expm1() at inference. Comparable players found by nearest value_eur distance.",
  },
];

// ── Pipeline step ────────────────────────────────────────────────────────────
const PIPELINE = [
  { icon: Database, label: "Load", desc: "Raw CSVs from FIFA 15–23. Two tables: 10K players, 385K team rows." },
  { icon: Cpu,      label: "Clean", desc: "Parse '89+3' position ratings, fill nulls with per-version median, extract primary_position." },
  { icon: Network,  label: "Engineer", desc: "Compute Δ stats per player_id, composite scores, momentum, normalised tactic vectors." },
  { icon: Database, label: "Export", desc: "Parquet files — 5× faster than CSV, dtypes preserved, loaded once at API startup." },
];

// ── Main page ────────────────────────────────────────────────────────────────
export default function OverviewPage() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -60]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);

  return (
    <div ref={containerRef} style={{ maxWidth: "100%" }}>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <motion.div style={{ y: heroY, opacity: heroOpacity }} className="mb-16">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "var(--accent)", letterSpacing: "0.15em", textTransform: "uppercase", display: "inline-block", padding: "4px 12px", borderRadius: 4, background: "var(--accent-dim)", border: "1px solid rgba(0,229,160,0.2)", marginBottom: 20 }}>
            ML Football Scouting Platform
          </span>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.08 }}
          style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "clamp(2.8rem,7vw,4.5rem)", fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase", lineHeight: 1.05, color: "var(--text)", marginBottom: 20 }}>
          Find the Next<br />
          <span style={{ color: "var(--accent)", textShadow: "0 0 60px rgba(0,229,160,0.25)" }}>Great Player</span><br />
          Before Anyone Else
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.16 }}
          style={{ fontSize: 15, color: "var(--text-2)", lineHeight: 1.7, maxWidth: 640, marginBottom: 32 }}>
          Four ML models trained on FIFA 15–23 multi-version data. Career trajectory, statistical clustering, tactical fit scoring, and market valuation — all from a single stat input.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.24 }}
          style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/gems">
            <motion.button whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
              style={{ padding: "12px 24px", borderRadius: 8, background: "var(--accent)", color: "#020a0f", fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 4px 24px rgba(0,229,160,0.25)" }}>
              Start Scouting <ArrowRight size={14} />
            </motion.button>
          </Link>
          <Link href="/compare">
            <motion.button whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
              style={{ padding: "12px 24px", borderRadius: 8, background: "transparent", color: "var(--text)", fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", border: "1px solid var(--border-bright)", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
              Compare Players <ArrowLeftRight size={14} />
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>

      {/* ── STATS ROW ──────────────────────────────────────────────────────── */}
      <Reveal direction="up">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "var(--border)", borderRadius: 12, overflow: "hidden", marginBottom: 0 }}>
          {[
            { value: "10K+",  label: "Players" },
            { value: "8",     label: "FIFA Versions" },
            { value: "4",     label: "ML Models" },
            { value: "385K",  label: "Team Rows" },
          ].map((s, i) => (
            <div key={i} style={{ background: "var(--bg-card)", padding: "24px 20px", textAlign: "center" }}>
              <StatBadge value={s.value} label={s.label} />
            </div>
          ))}
        </div>
      </Reveal>

      <Marquee />

      {/* ── PIPELINE ───────────────────────────────────────────────────────── */}
      <Reveal direction="up" delay={0.05}>
        <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "var(--accent)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>The Pipeline</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 64 }}>
          {PIPELINE.map((step, i) => (
            <Reveal key={step.label} direction="up" delay={i * 0.08}>
              <motion.div whileHover={{ y: -4, borderColor: "var(--accent)" }}
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, padding: "16px", cursor: "default", transition: "border-color 0.2s" }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--accent-dim)", border: "1px solid rgba(0,229,160,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                  <step.icon size={14} color="var(--accent)" />
                </div>
                <p style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text)", marginBottom: 6 }}>
                  <span style={{ color: "var(--text-3)", marginRight: 6, fontFamily: "'JetBrains Mono',monospace", fontSize: 9 }}>0{i+1}</span>
                  {step.label}
                </p>
                <p style={{ fontSize: 11.5, color: "var(--text-2)", lineHeight: 1.5 }}>{step.desc}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </Reveal>

      {/* ── KEY INSIGHT CALLOUT ─────────────────────────────────────────────── */}
      <Reveal direction="scale" delay={0.05}>
        <div style={{ background: "var(--bg-card)", border: "1px solid rgba(0,229,160,0.2)", borderRadius: 14, padding: "28px 32px", marginBottom: 64, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, var(--accent) 50%, transparent)" }} />
          <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "var(--accent)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>Critical Design Decision</p>
          <p style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "1.3rem", fontWeight: 700, color: "var(--text)", letterSpacing: "0.02em", lineHeight: 1.3, marginBottom: 10 }}>
            Split by player_id — not by row
          </p>
          <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.7, maxWidth: 640 }}>
            FIFA data has the same player across 8 versions. A row-level split would leak Messi's FIFA 19 stats into training while his FIFA 23 future sits in the test set — the model would effectively "cheat." Splitting by player_id ensures no player appears in both train and test across any model.
          </p>
          <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
            <span style={{ padding: "4px 10px", borderRadius: 4, background: "rgba(255,77,109,0.1)", border: "1px solid rgba(255,77,109,0.2)", fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "var(--red)", letterSpacing: "0.08em" }}>❌ train_test_split(df)</span>
            <span style={{ padding: "4px 10px", borderRadius: 4, background: "rgba(0,229,160,0.08)", border: "1px solid rgba(0,229,160,0.2)", fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "var(--accent)", letterSpacing: "0.08em" }}>✅ train_test_split(player_ids)</span>
          </div>
        </div>
      </Reveal>

      {/* ── MODEL CARDS ────────────────────────────────────────────────────── */}
      <Reveal direction="up">
        <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "var(--accent)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 20 }}>The Models</p>
      </Reveal>

      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 64 }}>
        {MODELS.map((m, i) => (
          <Reveal key={m.href} direction={i % 2 === 0 ? "left" : "right"} delay={0.05}>
            <Link href={m.href} style={{ textDecoration: "none" }}>
              <motion.div
                whileHover={{ y: -3, borderColor: m.color + "55" }}
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: "24px 28px", cursor: "pointer", transition: "border-color 0.2s", position: "relative", overflow: "hidden" }}
              >
                {/* Left accent bar */}
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: m.color, opacity: 0.6, borderRadius: "14px 0 0 14px" }} />

                <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                  {/* Icon + number */}
                  <div style={{ flexShrink: 0 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: m.color + "15", border: `1px solid ${m.color}33`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 6 }}>
                      <m.icon size={18} color={m.color} />
                    </div>
                    <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "var(--text-3)", letterSpacing: "0.1em", textAlign: "center" }}>P{m.num}</p>
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                      <p style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "1.2rem", fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--text)", lineHeight: 1 }}>{m.title}</p>
                      <span style={{ padding: "2px 8px", borderRadius: 4, background: m.color + "18", border: `1px solid ${m.color}33`, fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: m.color, letterSpacing: "0.06em" }}>{m.algo}</span>
                    </div>
                    <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6, marginBottom: 14 }}>{m.desc}</p>

                    <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                      {/* Features */}
                      <div style={{ flex: 1, minWidth: 160 }}>
                        <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: "var(--text-3)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Features</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                          {m.features.map(f => (
                            <div key={f} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <div style={{ width: 4, height: 4, borderRadius: "50%", background: m.color, flexShrink: 0 }} />
                              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "var(--text-2)" }}>{f}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Key insight */}
                      <div style={{ flex: 2, minWidth: 200, borderLeft: `1px solid ${m.color}22`, paddingLeft: 20 }}>
                        <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: m.color, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Key Insight</p>
                        <p style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.6 }}>{m.insight}</p>
                      </div>
                    </div>
                  </div>

                  {/* Arrow */}
                  <ArrowRight size={18} color="var(--text-3)" style={{ flexShrink: 0, marginTop: 4 }} />
                </div>
              </motion.div>
            </Link>
          </Reveal>
        ))}
      </div>

      {/* ── BOTTOM CTA ─────────────────────────────────────────────────────── */}
      <Reveal direction="scale" delay={0.05}>
        <div style={{ textAlign: "center", padding: "48px 32px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 60% at 50% 100%, rgba(0,229,160,0.06), transparent)", pointerEvents: "none" }} />
          <p style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "clamp(1.6rem,4vw,2.4rem)", fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--text)", marginBottom: 12 }}>
            Ready to Scout?
          </p>
          <p style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 28, maxWidth: 400, margin: "0 auto 28px" }}>
            Pick a model and start predicting. Search any FIFA player to auto-fill stats, or use position templates for new players.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            {MODELS.map(m => (
              <Link key={m.href} href={m.href}>
                <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }}
                  style={{ padding: "9px 18px", borderRadius: 8, background: m.color + "15", border: `1px solid ${m.color}33`, color: m.color, fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                  <m.icon size={13} /> {m.title}
                </motion.button>
              </Link>
            ))}
          </div>
        </div>
      </Reveal>

      <div style={{ height: 60 }} />
    </div>
  );
}
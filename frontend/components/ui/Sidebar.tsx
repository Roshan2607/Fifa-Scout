"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart2, Zap, GitBranch, Users, DollarSign, ArrowLeftRight, Sun, Moon, Coffee } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/components/ui/ThemeProvider";

const NAV = [
  { href: "/",          label: "Overview",        icon: BarChart2,      desc: "Dashboard"   },
  { href: "/gems",      label: "Who'll Be Great",  icon: Zap,            desc: "Greatness"   },
  { href: "/clusters",  label: "Budget Gems",      icon: GitBranch,      desc: "Clustering"  },
  { href: "/chemistry", label: "Chemistry Fit",    icon: Users,          desc: "Team Fit"    },
  { href: "/valuation", label: "Player Value",     icon: DollarSign,     desc: "Valuation"   }
];

const THEME_ICONS = { dark: Moon, light: Sun, cream: Coffee };
const THEME_LABELS = { dark: "Dark", light: "Light", cream: "Cream" };

export function Sidebar() {
  const path = usePathname();
  const { theme, cycle } = useTheme();
  const ThemeIcon = THEME_ICONS[theme];

  return (
    <aside style={{
      position: "fixed", top: 0, left: 0, height: "100vh", width: 224,
      display: "flex", flexDirection: "column",
      background: "var(--sidebar-bg)",
      backdropFilter: "blur(28px) saturate(200%)",
      WebkitBackdropFilter: "blur(28px) saturate(200%)",
      borderRight: "1px solid rgba(255,255,255,0.08)",
      boxShadow: "inset -1px 0 0 rgba(255,255,255,0.04), 4px 0 32px rgba(0,0,0,0.2)",
      zIndex: 50,
      transition: "background 0.3s",
    }}>
      {/* Top edge glow */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, var(--accent) 50%, transparent)", opacity: 0.3 }} />

      {/* Logo */}
      <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ position: "relative", width: 32, height: 32, flexShrink: 0 }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: 8, background: "var(--accent-dim)", border: "1px solid var(--accent)", opacity: 0.8 }} />
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 14, color: "var(--accent)", letterSpacing: "0.04em" }}>FI</span>
            </div>
            <div style={{ position: "absolute", inset: 0, borderRadius: 8, border: "1px solid var(--accent)", opacity: 0.2, animation: "ping 3s cubic-bezier(0,0,0.2,1) infinite" }} />
          </div>
          <div>
            <p style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 16, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text)", lineHeight: 1 }}>
              FIFU
            </p>
            <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: "var(--accent)", letterSpacing: "0.1em", marginTop: 2, opacity: 0.8 }}>
              ML SCOUT PLATFORM
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{ padding: "12px 8px 8px", flex: 1, overflowY: "auto" }}>
        <p style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-3)", padding: "0 8px", marginBottom: 8 }}>Navigation</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV.map(({ href, label, icon: Icon, desc }, i) => {
            const active = path === href;
            return (
              <Link key={href} href={href} style={{ textDecoration: "none" }}>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ x: 2 }}
                  style={{
                    position: "relative",
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "9px 10px", borderRadius: 8, cursor: "pointer",
                    background: active ? "var(--accent-dim)" : "transparent",
                    border: `1px solid ${active ? "var(--accent)" : "transparent"}`,
                    transition: "all 0.18s",
                  }}
                >
                  <AnimatePresence>
                    {active && (
                      <motion.div layoutId="activeBar"
                        style={{ position: "absolute", left: 0, top: 6, bottom: 6, width: 3, borderRadius: 99, background: "var(--accent)", boxShadow: "0 0 8px var(--accent)" }}
                        initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} exit={{ scaleY: 0 }}
                      />
                    )}
                  </AnimatePresence>
                  <Icon size={14} color={active ? "var(--accent)" : "var(--text-3)"} style={{ transition: "color 0.18s", flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: active ? 700 : 500, letterSpacing: "0.05em", textTransform: "uppercase", color: active ? "var(--text)" : "var(--text-2)", lineHeight: 1.2, transition: "color 0.18s" }}>{label}</p>
                    <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: active ? "var(--accent)" : "var(--text-3)", letterSpacing: "0.06em", marginTop: 1, transition: "color 0.18s" }}>{desc}</p>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer — theme toggle + status */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)" }}>
        {/* Theme toggle */}
        <button onClick={cycle}
          style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8, background: "var(--accent-dim)", border: "1px solid var(--accent)", cursor: "pointer", transition: "all 0.18s", marginBottom: 10 }}
          onMouseEnter={e => (e.currentTarget.style.background = "var(--accent)")}
          onMouseLeave={e => (e.currentTarget.style.background = "var(--accent-dim)")}
        >
          <ThemeIcon size={12} color="var(--accent)" />
          <p style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent)" }}>
            {THEME_LABELS[theme]} Mode
          </p>
          <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: "var(--accent)", opacity: 0.6, marginLeft: "auto" }}>
            CYCLE
          </p>
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", boxShadow: "0 0 6px var(--accent)", animation: "pulse 2s infinite" }} />
          <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: "var(--accent)", letterSpacing: "0.1em" }}>API LIVE</p>
        </div>
        <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: "var(--text-3)", letterSpacing: "0.05em" }}>FIFA 15–23 · 10K PLAYERS</p>
      </div>
    </aside>
  );
}
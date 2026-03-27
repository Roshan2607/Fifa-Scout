const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ── Types ────────────────────────────────────────────────────────────────────

export interface PlayerStats {
  age: number;
  overall: number;
  potential: number;
  international_reputation?: number;
  league_level?: number;
  pace?: number;
  shooting?: number;
  passing?: number;
  dribbling?: number;
  defending?: number;
  physic?: number;
  [key: string]: number | undefined;
}

export interface GreatnessResponse {
  predicted_peak_overall: number;
  confidence_interval: [number, number];
}

export interface ClusterResponse {
  cluster_id: number;
  cluster_label: string;
  is_bargain: boolean;
  value_gap_eur: number | null;
  umap_x: number;
  umap_y: number;
  cluster_peers: string[];
}

export interface ClusterMapPoint {
  player_id: number;
  short_name: string;
  overall: number;
  value_eur: number;
  cluster: number;
  umap_x: number;
  umap_y: number;
  is_bargain: boolean;
  value_gap: number;
}

export interface ChemistryResponse {
  fit_probability: number;
  fit_label: "Strong Fit" | "Moderate Fit" | "Poor Fit";
  top_matching_attributes: string[];
  top_mismatching_attributes: string[];
}

export interface Team {
  team_id: number;
  team_name: string;
  league_name: string;
  overall: number;
}

export interface ValuationResponse {
  predicted_value_eur: number;
  value_band: string;
  comparable_players: string[];
}

// ── Fetch helpers ────────────────────────────────────────────────────────────

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? `API error ${res.status}`);
  }
  return res.json();
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

// ── API calls ────────────────────────────────────────────────────────────────

export const api = {
  predictGreatness: (
    player: PlayerStats,
    delta_overall = 0,
    delta_power_strength = 0,
    delta_skill_ball_control = 0,
    delta_attacking_finishing = 0,
  ) =>
    post<GreatnessResponse>("/api/gems/predict", {
      player,
      delta_overall,
      delta_power_strength,
      delta_skill_ball_control,
      delta_attacking_finishing,
    }),

  predictCluster: (player: PlayerStats) =>
    post<ClusterResponse>("/api/clusters/predict", { player }),

  getClusterMap: (fifaVersion = 23) =>
    get<ClusterMapPoint[]>(`/api/clusters/map?fifa_version=${fifaVersion}`),

  predictChemistry: (player: PlayerStats, team_id: number) =>
    post<ChemistryResponse>("/api/chemistry/predict", { player, team_id }),

  getTeams: (fifaVersion = 23) =>
    get<Team[]>(`/api/chemistry/teams?fifa_version=${fifaVersion}`),

  predictValuation: (player: PlayerStats, momentum = 0) =>
    post<ValuationResponse>("/api/valuation/predict", { player, momentum }),
};
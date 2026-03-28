# ⚽ FIFA Scout — ML-Powered Player Intelligence Platform

> Predict. Discover. Decide. A full-stack machine learning platform for smarter football scouting.

---

## What Is This?

FIFA Scout is an end-to-end data science project built on the FIFA 15–23 dataset (110 attributes, thousands of players). It answers four questions every football scout asks:

| # | Question | Approach |
|---|----------|----------|
| 🌟 | **Who will be great?** | XGBoost predicts a player's peak overall from early career stats + trajectory |
| 💎 | **Who's undervalued?** | K-Means clustering finds elite-stat players priced like bargains |
| 🤝 | **Does this player fit my team?** | Random Forest classifies tactical compatibility using team DNA vectors |
| 💰 | **What is this player worth?** | XGBoost estimates market value in EUR from attributes alone |

---

## Stack

**ML** — XGBoost · Scikit-learn · K-Means · UMAP  
**Backend** — FastAPI · Joblib · Pandas  
**Frontend** — Next.js · Tailwind CSS  
**Data** — FIFA 15–23 Complete Player Dataset (Kaggle)

---

## Project Structure

```
fifa-scout/
├── backend/          # FastAPI app + ML routers
│   ├── main.py
│   ├── model_loader.py
│   ├── schemas.py
│   └── routers/
│       ├── gems.py        # Peak potential prediction
│       ├── clusters.py    # Budget gem discovery
│       ├── chemistry.py   # Team fit scoring
│       └── valuation.py   # Market value estimation
├── frontend/         # Next.js dashboard
├── models/saved/     # Trained .joblib model files
├── notebooks/        # EDA + per-problem training notebooks
├── pipeline/         # Data loading, cleaning, feature engineering
└── run_pipeline.py   # One-command data processing
```

---

## ML Details

### 🌟 Greatness Predictor
- **Model:** XGBoost Regressor
- **Target:** Peak overall a player ever reached (FIFA 15–23)
- **Key features:** Age, overall, composite scores, delta features (career momentum)
- **Split rule:** By `player_id` — never by row, to prevent data leakage

### 💎 Budget Gems (Clustering)
- **Model:** K-Means + UMAP
- **Approach:** Cluster players by normalised stat vectors, flag those priced below the 25th percentile of their cluster
- **Output:** `is_bargain` flag + value gap in EUR + 2D UMAP projection

### 🤝 Team Chemistry
- **Model:** Random Forest Classifier
- **Features:** Player composite scores + 17 team tactic vectors (`tv_*`)
- **Labels:** Positive = player plays for team, Negative = randomly sampled non-match
- **Output:** Fit probability → Strong / Moderate / Poor Fit

### 💰 Market Valuation
- **Model:** XGBoost Regressor
- **Target:** `log(value_eur)` — exponentiated at inference
- **Features:** Age, overall, potential, composite scores, momentum

---

## Running Locally

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Add your FIFA CSVs to data/raw/
# Download from: https://www.kaggle.com/datasets/stefanoleone992/fifa-23-complete-player-dataset

# 3. Run the data pipeline
python run_pipeline.py

# 4. Start the backend
uvicorn backend.main:app --reload

# 5. Start the frontend
cd frontend && npm install && npm run dev
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/gems` | Predict peak overall |
| POST | `/api/chemistry` | Score player-team fit |
| POST | `/api/valuation` | Estimate market value |
| GET | `/api/clusters` | Get budget gem clusters |

---

## Dataset

[FIFA 23 Complete Player Dataset](https://www.kaggle.com/datasets/stefanoleone992/fifa-23-complete-player-dataset) by Stefano Leone — FIFA 15 through 23, male players, 110 attributes per player per year.

---

*Built as a personal ML project. Not affiliated with EA Sports or FIFA.*

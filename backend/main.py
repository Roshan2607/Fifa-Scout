"""
main.py - FastAPI entrypoint for FIFU
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .model_loader import load_all_models
from .routers.gems import router as gems_router
from .routers.clusters import router as clusters_router
from .routers.chemistry import router as chemistry_router
from .routers.valuation import router as valuation_router
from .routers.search import router as search_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    load_all_models()
    yield

app = FastAPI(title="FIFU API", version="2.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://frontend:3000"],
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

app.include_router(gems_router,      prefix="/api/gems",      tags=["Greatness"])
app.include_router(clusters_router,  prefix="/api/clusters",  tags=["Clustering"])
app.include_router(chemistry_router, prefix="/api/chemistry", tags=["Chemistry"])
app.include_router(valuation_router, prefix="/api/valuation", tags=["Valuation"])
app.include_router(search_router,    prefix="/api/players",   tags=["Players"])

@app.get("/health")
def health():
    return {"status": "ok"}
"""
Smart Investment Advisor - Main FastAPI Application
Entry point for the backend server
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import gold_silver, prediction, sip, factors, analysis

app = FastAPI(
    title="Smart Investment Advisor API",
    description="Backend for Gold & Silver Investment Advisory Platform",
    version="1.0.0"
)


# CORS — allow your React frontend (Vite default port)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register route modules
app.include_router(gold_silver.router, prefix="/api/prices",    tags=["Prices"])
app.include_router(prediction.router,  prefix="/api/predict",   tags=["Prediction"])
app.include_router(factors.router,     prefix="/api/factors",   tags=["Factors"])
app.include_router(analysis.router,    prefix="/api/analysis",  tags=["Analysis"])
app.include_router(sip.router,         prefix="/api/sip",        tags=["SIP Calculator"])


@app.get("/")
def root():
    return {"message": "Smart Investment Advisor API is running 🚀"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}

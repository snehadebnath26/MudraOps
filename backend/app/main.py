from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI(
    title="MudrasAI Backend",
    description="Mudra recommendation and lookup API",
    version="0.1.0",
)

class RecommendationRequest(BaseModel):
    goal: str

class DetectRequest(BaseModel):
    gesture_hint: str = ""

class Mudra(BaseModel):
    name: str
    meaning: str
    benefits: List[str]

MUDRAS = [
    {
        "name": "Gyan Mudra",
        "meaning": "Gesture of knowledge",
        "benefits": [
            "Improves concentration",
            "Promotes calm and memory",
        ],
    },
    {
        "name": "Prana Mudra",
        "meaning": "Gesture of life force",
        "benefits": [
            "Increases energy",
            "Supports digestion",
        ],
    },
    {
        "name": "Apana Mudra",
        "meaning": "Gesture of elimination",
        "benefits": [
            "Cleanses the system",
            "Supports detoxification",
        ],
    },
    {
        "name": "Shuni Mudra",
        "meaning": "Gesture of patience",
        "benefits": [
            "Improves discipline",
            "Eases anxiety",
        ],
    },
]

RECOMMENDATION_MAP = {
    "stress": ["Gyan Mudra", "Shuni Mudra"],
    "focus": ["Gyan Mudra", "Prana Mudra"],
    "energy": ["Prana Mudra", "Apana Mudra"],
    "digestion": ["Prana Mudra", "Apana Mudra"],
    "sleep": ["Gyan Mudra", "Shuni Mudra"],
}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "app": "MudrasAI Backend",
        "message": "Use /mudras, /recommend, or /detect. API docs are at /docs.",
    }

@app.get("/favicon.ico")
def favicon():
    return {"detail": "No favicon provided"}

@app.get("/mudras", response_model=List[Mudra])
def list_mudras():
    return MUDRAS

@app.post("/recommend", response_model=List[Mudra])
def recommend_mudras(request: RecommendationRequest):
    key = request.goal.strip().lower()
    names = RECOMMENDATION_MAP.get(key)
    if not names:
        raise HTTPException(status_code=404, detail="No recommendations found for that goal")
    return [mudra for mudra in MUDRAS if mudra["name"] in names]

@app.post("/detect")
def detect_mudra(request: DetectRequest):
    text = request.gesture_hint.strip().lower()
    if "knowledge" in text or "brain" in text or "focus" in text:
        return {"mudra": "Gyan Mudra", "confidence": 0.9}
    if "energy" in text or "life" in text:
        return {"mudra": "Prana Mudra", "confidence": 0.9}
    if "detox" in text or "digest" in text:
        return {"mudra": "Apana Mudra", "confidence": 0.9}
    if "patience" in text or "calm" in text:
        return {"mudra": "Shuni Mudra", "confidence": 0.9}
    raise HTTPException(status_code=400, detail="Unable to detect mudra from hint")

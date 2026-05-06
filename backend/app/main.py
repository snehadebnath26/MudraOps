from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime
import json

app = FastAPI(
    title="MudrasAI Backend",
    description="Advanced Mudra recommendation and meditation tracking API",
    version="1.0.0",
)

class RecommendationRequest(BaseModel):
    goal: str
    mood: Optional[str] = None

class DetectRequest(BaseModel):
    gesture_hint: str = ""

class MeditationSession(BaseModel):
    duration_minutes: int
    mudra_name: str
    mood_before: str
    mood_after: str
    timestamp: str

class Mudra(BaseModel):
    name: str
    meaning: str
    benefits: List[str]
    duration_minutes: int = 10
    difficulty: str = "beginner"
    chakra: Optional[str] = None
    instructions: Optional[str] = None

MUDRAS = [
    {
        "name": "Gyan Mudra",
        "meaning": "Gesture of knowledge",
        "benefits": ["Improves concentration", "Promotes calm and memory", "Enhances intuition"],
        "duration_minutes": 10,
        "difficulty": "beginner",
        "chakra": "Crown",
        "instructions": "Touch thumb and index finger, keep other fingers extended"
    },
    {
        "name": "Prana Mudra",
        "meaning": "Gesture of life force",
        "benefits": ["Increases energy", "Supports digestion", "Boosts immunity"],
        "duration_minutes": 5,
        "difficulty": "beginner",
        "chakra": "Root",
        "instructions": "Touch thumb, ring, and pinky finger together"
    },
    {
        "name": "Apana Mudra",
        "meaning": "Gesture of elimination",
        "benefits": ["Cleanses the system", "Supports detoxification", "Aids digestion"],
        "duration_minutes": 15,
        "difficulty": "beginner",
        "chakra": "Sacral",
        "instructions": "Touch thumb with middle and ring finger"
    },
    {
        "name": "Shuni Mudra",
        "meaning": "Gesture of patience",
        "benefits": ["Improves discipline", "Eases anxiety", "Reduces stress"],
        "duration_minutes": 12,
        "difficulty": "beginner",
        "chakra": "Root",
        "instructions": "Touch thumb with middle finger, keep others extended"
    },
    {
        "name": "Vayu Mudra",
        "meaning": "Gesture of air",
        "benefits": ["Relieves anxiety", "Reduces trembling", "Improves focus"],
        "duration_minutes": 8,
        "difficulty": "intermediate",
        "chakra": "Heart",
        "instructions": "Fold index finger, touch thumb tip with it"
    },
    {
        "name": "Akash Mudra",
        "meaning": "Gesture of space",
        "benefits": ["Reduces ear problems", "Clears communication", "Opens throat chakra"],
        "duration_minutes": 10,
        "difficulty": "intermediate",
        "chakra": "Throat",
        "instructions": "Touch thumb and middle finger together"
    },
    {
        "name": "Surya Mudra",
        "meaning": "Gesture of sun",
        "benefits": ["Increases metabolism", "Boosts body heat", "Reduces cold"],
        "duration_minutes": 5,
        "difficulty": "intermediate",
        "chakra": "Solar Plexus",
        "instructions": "Fold ring finger, press with thumb"
    },
    {
        "name": "Ushas Mudra",
        "meaning": "Gesture of dawn",
        "benefits": ["Increases alertness", "Improves mood", "Enhances energy"],
        "duration_minutes": 5,
        "difficulty": "beginner",
        "chakra": "Solar Plexus",
        "instructions": "Interlock fingers with thumb on top"
    },
    {
        "name": "Bhairav Mudra",
        "meaning": "Gesture of courage",
        "benefits": ["Builds confidence", "Reduces fear", "Enhances willpower"],
        "duration_minutes": 15,
        "difficulty": "advanced",
        "chakra": "Root",
        "instructions": "Sit comfortably, left hand on right palm"
    },
    {
        "name": "Kali Mudra",
        "meaning": "Gesture of transformation",
        "benefits": ["Releases tension", "Transforms energy", "Emotional cleansing"],
        "duration_minutes": 20,
        "difficulty": "advanced",
        "chakra": "Heart",
        "instructions": "Clasp hands with right thumb underneath"
    },
]

# Enhanced recommendation map
RECOMMENDATION_MAP = {
    "stress": ["Gyan Mudra", "Shuni Mudra", "Vayu Mudra"],
    "focus": ["Gyan Mudra", "Prana Mudra", "Akash Mudra"],
    "energy": ["Prana Mudra", "Surya Mudra", "Ushas Mudra"],
    "digestion": ["Prana Mudra", "Apana Mudra"],
    "sleep": ["Gyan Mudra", "Shuni Mudra"],
    "anxiety": ["Vayu Mudra", "Shuni Mudra"],
    "confidence": ["Bhairav Mudra", "Surya Mudra"],
    "creativity": ["Kali Mudra", "Akash Mudra"],
}

# Mood to recommendations
MOOD_MAP = {
    "calm": ["Gyan Mudra", "Shuni Mudra"],
    "energetic": ["Prana Mudra", "Surya Mudra"],
    "stressed": ["Vayu Mudra", "Apana Mudra"],
    "focused": ["Gyan Mudra", "Akash Mudra"],
    "tired": ["Surya Mudra", "Ushas Mudra"]
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
        "version": "1.0.0",
        "message": "Use /mudras, /recommend, /detect, or /stats. API docs are at /docs.",
    }

@app.get("/favicon.ico")
def favicon():
    return {"detail": "No favicon provided"}

@app.get("/mudras", response_model=List[Mudra])
def list_mudras(difficulty: Optional[str] = None):
    """Get all mudras, optionally filtered by difficulty level"""
    mudras = MUDRAS
    if difficulty:
        mudras = [m for m in mudras if m["difficulty"].lower() == difficulty.lower()]
    return mudras

@app.get("/mudras/search")
def search_mudras(query: str):
    """Search mudras by name or benefit"""
    query = query.lower()
    results = []
    for mudra in MUDRAS:
        if query in mudra["name"].lower():
            results.append(mudra)
        elif any(query in benefit.lower() for benefit in mudra["benefits"]):
            results.append(mudra)
    return results

@app.get("/chakras")
def get_chakras():
    """Get all chakras and associated mudras"""
    chakras = {}
    for mudra in MUDRAS:
        if mudra.get("chakra"):
            if mudra["chakra"] not in chakras:
                chakras[mudra["chakra"]] = []
            chakras[mudra["chakra"]].append(mudra["name"])
    return chakras

@app.post("/recommend", response_model=List[Mudra])
def recommend_mudras(request: RecommendationRequest):
    """Get mudra recommendations based on goal and optional mood"""
    key = request.goal.strip().lower()
    mood = request.mood.strip().lower() if request.mood else None
    
    names = RECOMMENDATION_MAP.get(key, [])
    if mood:
        mood_names = MOOD_MAP.get(mood, [])
        # Combine and deduplicate recommendations
        names = list(set(names + mood_names))
    
    if not names:
        raise HTTPException(status_code=404, detail="No recommendations found for that goal")
    return [mudra for mudra in MUDRAS if mudra["name"] in names]

@app.post("/recommend/advanced")
def advanced_recommend(goal: str, mood: str, difficulty: Optional[str] = None):
    """Advanced recommendation with difficulty level filtering"""
    recommendations = recommend_mudras(RecommendationRequest(goal=goal, mood=mood))
    
    if difficulty:
        recommendations = [m for m in recommendations if m["difficulty"] == difficulty]
    
    return recommendations

@app.post("/detect")
def detect_mudra(request: DetectRequest):
    """Detect mudra based on gesture description"""
    text = request.gesture_hint.strip().lower()
    
    keywords = {
        "Gyan Mudra": ["knowledge", "brain", "focus", "intelligence"],
        "Prana Mudra": ["energy", "power", "life", "vitality"],
        "Apana Mudra": ["detox", "cleanse", "elimination"],
        "Shuni Mudra": ["patience", "discipline", "calm"],
        "Vayu Mudra": ["air", "anxiety", "relief"],
        "Akash Mudra": ["space", "communication", "throat"],
        "Surya Mudra": ["sun", "heat", "energy", "warm"],
        "Ushas Mudra": ["dawn", "morning", "alertness"],
    }
    
    matches = {}
    for mudra, keywords_list in keywords.items():
        count = sum(1 for kw in keywords_list if kw in text)
        if count > 0:
            matches[mudra] = count
    
    if matches:
        mudra_name = max(matches, key=matches.get)
        return {
            "mudra": mudra_name,
            "confidence": matches[mudra_name],
            "details": next((m for m in MUDRAS if m["name"] == mudra_name), None)
        }
    
    return {
        "mudra": "Gyan Mudra",
        "confidence": 0.5,
        "message": "Could not determine mudra, recommending Gyan Mudra",
        "details": MUDRAS[0]
    }

@app.get("/stats/daily")
def get_daily_stats():
    """Get general statistics about mudra practice"""
    return {
        "total_mudras": len(MUDRAS),
        "beginner_mudras": len([m for m in MUDRAS if m["difficulty"] == "beginner"]),
        "intermediate_mudras": len([m for m in MUDRAS if m["difficulty"] == "intermediate"]),
        "advanced_mudras": len([m for m in MUDRAS if m["difficulty"] == "advanced"]),
        "total_chakras": len(set(m.get("chakra") for m in MUDRAS if m.get("chakra"))),
        "api_version": "1.0.0"
    }

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}
        return {"mudra": "Gyan Mudra", "confidence": 0.9}
    if "energy" in text or "life" in text:
        return {"mudra": "Prana Mudra", "confidence": 0.9}
    if "detox" in text or "digest" in text:
        return {"mudra": "Apana Mudra", "confidence": 0.9}
    if "patience" in text or "calm" in text:
        return {"mudra": "Shuni Mudra", "confidence": 0.9}
    raise HTTPException(status_code=400, detail="Unable to detect mudra from hint")

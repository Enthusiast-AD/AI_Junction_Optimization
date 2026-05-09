from simulation.models import CongestionPrediction
from config import settings
from datetime import datetime
import json

async def generate_prediction(history_data: list) -> CongestionPrediction:
    import google.generativeai as genai
    
    if not settings.GOOGLE_AI_API_KEY or "placeholder" in settings.GOOGLE_AI_API_KEY:
        # Return fallback prediction if no key
        return CongestionPrediction(
            generated_at=datetime.utcnow(),
            congestion_risk="low",
            predicted_peak_lane="north",
            predicted_peak_in_minutes=15,
            recommendation="Monitor traffic.",
            summary="No API key provided, returning static prediction.",
            model_used="static-fallback"
        )
        
    genai.configure(api_key=settings.GOOGLE_AI_API_KEY)
    model = genai.GenerativeModel(settings.GEMINI_MODEL)
    
    prompt = f"""
    You are a traffic analyst. Analyze this 30-minute traffic history and predict congestion.
    History (vehicle counts per lane, every 5s): {json.dumps(history_data[:10])} # truncated for mockup
    Return JSON: {{
      "congestion_risk": "low|medium|high",
      "predicted_peak_lane": "north|south|east|west",
      "predicted_peak_in_minutes": int,
      "recommendation": "string",
      "summary": "string"  
    }}
    """
    
    response = await model.generate_content_async(prompt)
    # parsing logic left basic for hackathon structure
    try:
        content = response.text.replace("```json", "").replace("```", "").strip()
        parsed = json.loads(content)
        return CongestionPrediction(
            generated_at=datetime.utcnow(),
            congestion_risk=parsed.get("congestion_risk", "low"),
            predicted_peak_lane=parsed.get("predicted_peak_lane", "north"),
            predicted_peak_in_minutes=parsed.get("predicted_peak_in_minutes", 10),
            recommendation=parsed.get("recommendation", ""),
            summary=parsed.get("summary", ""),
            model_used=settings.GEMINI_MODEL
        )
    except Exception as e:
         return CongestionPrediction(
            generated_at=datetime.utcnow(),
            congestion_risk="medium",
            predicted_peak_lane="north",
            predicted_peak_in_minutes=5,
            recommendation="Parse failed",
            summary=str(e),
            model_used=settings.GEMINI_MODEL
        )

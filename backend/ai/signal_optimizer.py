from simulation.models import JunctionState, AIDecision
from config import settings
import json
import time

decision_cache = {}

def _greedy_fallback(state: JunctionState) -> AIDecision:
    """Density-weighted greedy: pick lane with most vehicles"""
    best_lane = max(state.lanes.keys(), key=lambda l: state.lanes[l].vehicle_count)
    density = state.lanes[best_lane].vehicle_count
    duration = min(15 + density * 1.5, 60)  # 15-60 seconds
    return AIDecision(
        recommended_phase=best_lane,
        duration_seconds=int(duration),
        reason=f"Greedy: {best_lane} lane has highest density ({density} vehicles)",
        confidence=0.7,
        model_used="rule-based-greedy",
        latency_ms=0
    )

async def _call_groq(state: JunctionState) -> AIDecision:
    # Placeholder for actual Groq API call
    from groq import AsyncGroq
    import os
    
    if not settings.GROQ_API_KEY or "placeholder" in settings.GROQ_API_KEY:
        raise Exception("Groq API Key not configured")
        
    client = AsyncGroq(api_key=settings.GROQ_API_KEY)
    
    prompt = f"""
    You are a traffic signal controller AI. Always respond with valid JSON only. No explanation outside the JSON.

    User: Junction state:
    - North lane: {state.lanes['north'].vehicle_count} vehicles ({state.lanes['north'].density_percent}% density)
    - South lane: {state.lanes['south'].vehicle_count} vehicles ({state.lanes['south'].density_percent}% density)
    - East lane:  {state.lanes['east'].vehicle_count} vehicles ({state.lanes['east'].density_percent}% density)
    - West lane:  {state.lanes['west'].vehicle_count} vehicles ({state.lanes['west'].density_percent}% density)
    - Current green phase: {state.current_phase} (active for {state.phase_elapsed_seconds}s)
    - Emergency vehicle: {state.emergency_active}
    
    Decide the next signal phase. Respond with JSON:
    {{"phase": "north|south|east|west", "duration_seconds": <15-60>, "reason": "<one sentence>"}}
    """
    
    start_time = time.time()
    chat_completion = await client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": "You are a traffic signal controller. Always respond with valid JSON only."
            },
            {
                "role": "user",
                "content": prompt,
            }
        ],
        model=settings.GROQ_PRIMARY_MODEL,
        temperature=0.1,
    )
    latency = int((time.time() - start_time) * 1000)
    
    response_content = chat_completion.choices[0].message.content
    parsed = json.loads(response_content)
    
    return AIDecision(
        recommended_phase=parsed["phase"],
        duration_seconds=parsed["duration_seconds"],
        reason=parsed["reason"],
        confidence=0.9,
        model_used=settings.GROQ_PRIMARY_MODEL,
        latency_ms=latency
    )

async def _call_openrouter(state: JunctionState) -> AIDecision:
    # Placeholder for Openrouter fallback
    raise Exception("Openrouter not implemented")

async def get_signal_decision(state: JunctionState) -> AIDecision:
    if state.emergency_active and state.emergency_direction:
        return AIDecision(
            recommended_phase=state.emergency_direction,
            duration_seconds=120,
            reason="Emergency Override",
            confidence=1.0,
            model_used="system-override",
            latency_ms=0
        )
        
    counts_tuple = tuple((k, v.vehicle_count) for k, v in state.lanes.items())
    cache_key = hash(counts_tuple)
    
    if cached := decision_cache.get(cache_key):
        return cached

    try:
        decision = await _call_groq(state)
        decision_cache[cache_key] = decision
        return decision
    except Exception as e:
        print(f"Groq failed: {e}")
        pass
        
    # Try openrouter
    
    return _greedy_fallback(state)

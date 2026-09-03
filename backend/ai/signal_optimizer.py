from simulation.models import JunctionState, AIDecision
from config import settings
import json
import time

decision_cache = {}

def _greedy_fallback(state: JunctionState) -> AIDecision:
    """Density & Wait-time weighted greedy logic to prevent starvation."""
    def calculate_score(lane_name):
        lane = state.lanes[lane_name]
        # Multiply vehicles by wait time factor to prevent starvation
        score = lane.vehicle_count * (1 + (lane.avg_wait_seconds / 20.0))
        if lane_name == state.current_phase:
            score *= 0.1 # heavily penalize current phase
        return score
        
    best_lane = max(state.lanes.keys(), key=calculate_score)
    density = state.lanes[best_lane].vehicle_count
    wait_time = state.lanes[best_lane].avg_wait_seconds
    duration = min(15 + density * 1.5 + (wait_time * 0.2), 60)  # 15-60 seconds
    return AIDecision(
        recommended_phase=best_lane,
        duration_seconds=int(duration),
        reason=f"Greedy Fallback: {best_lane} lane scored highest (Density: {density}, Wait: {int(wait_time)}s) to prevent starvation.",
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
    - North lane: {state.lanes['north'].vehicle_count} vehicles ({state.lanes['north'].density_percent}% density, {int(state.lanes['north'].avg_wait_seconds)}s wait)
    - South lane: {state.lanes['south'].vehicle_count} vehicles ({state.lanes['south'].density_percent}% density, {int(state.lanes['south'].avg_wait_seconds)}s wait)
    - East lane:  {state.lanes['east'].vehicle_count} vehicles ({state.lanes['east'].density_percent}% density, {int(state.lanes['east'].avg_wait_seconds)}s wait)
    - West lane:  {state.lanes['west'].vehicle_count} vehicles ({state.lanes['west'].density_percent}% density, {int(state.lanes['west'].avg_wait_seconds)}s wait)
    - Current green phase: {state.current_phase} (active for {state.phase_elapsed_seconds}s)
    - Emergency vehicle: {state.emergency_active}
    
    CRITICAL: You MUST select the lane with high density that has been waiting the longest to prevent starvation. You MUST NOT select the current green phase ({state.current_phase}) again unless all other lanes are empty.
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
    content = response_content.replace("```json", "").replace("```", "").strip()
    parsed = json.loads(content)
    
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
        
    try:
        decision = await _call_groq(state)
        return decision
    except Exception as e:
        print(f"Groq failed: {e}")
        pass
        
    return _greedy_fallback(state)

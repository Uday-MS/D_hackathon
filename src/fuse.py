import json, os
from math import ceil
from src.forecast import get_demo_forecast
from src.quake_feed import get_demo_quakes
from src.social_classifier import score_messages

def compute_risk_from_demo(lat, lon, messages):
    # load demo weather
    wf = get_demo_forecast(lat, lon)
    rain = wf.get('forecast_next_12h',{}).get('total_rain_mm', 0)
    # segmentation percent: for demo, use 0.45 or bump if quake nearby
    seg_percent = 0.45
    # social score: average of message scores
    social_scores = score_messages(messages) if messages else []
    social_score = sum(social_scores)/len(social_scores) if social_scores else 0.2
    # quake impact: if any quake mag > 4.5 within sample -> small bump
    quakes = get_demo_quakes()
    quake_impact = 0.0
    for q in quakes:
        if q.get('mag',0) >= 4.5:
            quake_impact = 0.15
            break
    # simple weighted fusion
    w_seg, w_rain, w_social, w_quake = 0.40, 0.30, 0.20, 0.10
    normalized_rain = min(rain/60.0, 1.0)
    score = w_seg*seg_percent + w_rain*normalized_rain + w_social*social_score + w_quake*quake_impact
    risk = int(round(score * 100))
    level = "Safe" if risk < 31 else "Caution" if risk < 61 else "Danger"
    reasons = [f"Satellite water coverage: {int(seg_percent*100)}%", f"Rain next 12h: {rain} mm", f"Social reports: {len(messages)}", f"Quake impact: {int(quake_impact*100)}%"]
    overlay_url = "/api/overlay/mask_overlay_1.png"
    shelter = {"name":"Government School Shelter","lat":12.97185,"lon":77.64110,"distance_km":1.2, "capacity":300}
    return {"risk_score": risk, "level": level, "reasons": reasons, "overlay_url": overlay_url, "recommended_action":"Move to nearest shelter", "shelter_suggestions":[shelter]}

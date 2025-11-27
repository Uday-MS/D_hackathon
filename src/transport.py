def get_route_info(origin, destination):
    """Return fake route info because ORS/OSRM not used."""
    return {
        "distance_km": 2.4,
        "duration_min": 7,
        "mode": "car"
    }

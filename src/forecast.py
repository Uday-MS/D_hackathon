import json, os

def get_demo_forecast(lat, lon):
    path = os.path.join('data','weather_sample.json')
    with open(path) as f: j=json.load(f)
    return j

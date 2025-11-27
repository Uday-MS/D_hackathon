import json, os
def get_demo_quakes():
    path = os.path.join('data','quake_sample.json')
    with open(path) as f: j=json.load(f)
    return j.get('recent_quakes', [])

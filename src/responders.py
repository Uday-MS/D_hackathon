import csv, os
from src.utils import haversine

RESP_FILE = os.path.join('data','responders.csv')

def load_responders():
    rows=[]
    with open(RESP_FILE) as f:
        rdr = csv.DictReader(f)
        for r in rdr:
            r['lat']=float(r['lat']); r['lon']=float(r['lon']); r['priority']=int(r.get('priority',5))
            rows.append(r)
    return rows

def find_nearest_responders(lat, lon, top_k=3):
    rs = load_responders()
    for r in rs:
        r['dist_km'] = haversine(lat, lon, r['lat'], r['lon'])
    rs_sorted = sorted(rs, key=lambda x: (x['priority'], x['dist_km']))
    return rs_sorted[:top_k]

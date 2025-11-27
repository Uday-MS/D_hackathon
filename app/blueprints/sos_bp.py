from flask import Blueprint, request, jsonify
from src.responders import find_nearest_responders
from src.twilio_client import send_sms
import os, time, json, uuid

bp = Blueprint('sos', __name__)
LOGFILE = os.path.join('logs','sos_log.json')

def append_log(entry):
    try:
        with open(LOGFILE,'a') as f:
            f.write(json.dumps(entry)+"\n")
    except Exception as e:
        print("log error", e)

@bp.route('/send_sos', methods=['POST'])
def send_sos():
    body = request.get_json() or {}
    lat = body.get('lat'); lon = body.get('lon'); name = body.get('name','Unknown'); contact = body.get('contact','')
    if lat is None or lon is None:
        return jsonify({'error':'lat/lon required'}),400
    responders = find_nearest_responders(lat, lon, top_k=3)
    sos_id = str(uuid.uuid4())[:8]
    sent=[]
    for r in responders:
        msg = f"SOS: urgent rescue required\nLocation: https://www.google.com/maps/search/?api=1&query={lat},{lon}\nReporter: {name}\nContact: {contact}\nID:{sos_id}"
        res = send_sms(r['phone'], msg)
        sent.append({'responder': r, 'result': res})
    entry = {'sos_id':sos_id, 'lat':lat, 'lon':lon, 'sent': sent, 'ts': int(time.time())}
    append_log(entry)
    return jsonify({'sos_id':sos_id, 'sent': sent})

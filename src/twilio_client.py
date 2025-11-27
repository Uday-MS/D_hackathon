import os
SIMULATE = True  # Keep True for hackathon. Set False and fill env vars for real SMS.
def send_sms(to, message):
    if SIMULATE:
        print("[SIMULATED SMS] To:",to,"Msg:",message[:120])
        return {'status':'simulated','to':to}
    from twilio.rest import Client
    sid = os.getenv('TWILIO_SID'); auth = os.getenv('TWILIO_AUTH'); frm = os.getenv('TWILIO_FROM')
    client = Client(sid, auth)
    m = client.messages.create(body=message, from_=frm, to=to)
    return {'status': m.status, 'sid': m.sid}

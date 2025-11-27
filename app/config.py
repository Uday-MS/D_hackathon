import os
class Config:
    OPENWEATHER_KEY = os.getenv('OPENWEATHER_KEY')
    ORS_KEY = os.getenv('ORS_KEY')
    TWILIO_SID = os.getenv('TWILIO_SID')
    TWILIO_AUTH = os.getenv('TWILIO_AUTH')
    TWILIO_FROM = os.getenv('TWILIO_FROM')
    DEMO_MODE = os.getenv('DEMO_MODE','1') == '1'

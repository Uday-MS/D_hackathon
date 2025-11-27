from flask import Blueprint, jsonify
import json, os
bp = Blueprint('forecast', __name__)
@bp.route('/forecast_demo')
def forecast_demo():
    path = os.path.join('data','weather_sample.json')
    with open(path) as f: j=json.load(f)
    return jsonify(j)

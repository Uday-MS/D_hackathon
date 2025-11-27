from flask import Blueprint, jsonify
import json, os
bp = Blueprint('quakes', __name__)

@bp.route('/recent_quakes')
def recent_quakes():
    path = os.path.join('data','quake_sample.json')
    with open(path) as f: j=json.load(f)
    return jsonify(j)

from flask import Blueprint, request, jsonify
from src.fuse import compute_risk_from_demo
bp = Blueprint('predict', __name__)

@bp.route('/predict', methods=['POST'])
def predict():
    data = request.get_json() or {}
    lat = data.get('lat'); lon = data.get('lon'); messages = data.get('messages',[])
    res = compute_risk_from_demo(lat, lon, messages)
    return jsonify(res)

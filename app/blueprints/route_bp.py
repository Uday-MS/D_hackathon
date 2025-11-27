from flask import Blueprint, jsonify, request
bp = Blueprint('route', __name__)

@bp.route('/get_route', methods=['POST'])
def get_route():
    # For hackathon demo we return a Google Maps link.
    data = request.get_json() or {}
    origin = data.get('origin'); dest = data.get('destination')
    if not origin or not dest: return jsonify({'error':'origin/destination required'}),400
    gurl = f"https://www.google.com/maps/dir/?api=1&origin={origin[0]},{origin[1]}&destination={dest[0]},{dest[1]}&travelmode=driving"
    return jsonify({'maps_url':gurl})

from flask import Blueprint, jsonify
bp = Blueprint('admin', __name__)

@bp.route('/status')
def status():
    return jsonify({'status':'ok','demo':True})

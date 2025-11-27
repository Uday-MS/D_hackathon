from flask import Blueprint, jsonify
import csv, os
bp = Blueprint('shelters', __name__)
DATA_FILE = os.path.join('data','safe_places.csv')

@bp.route('/get_shelters', methods=['GET'])
def get_shelters():
    rows=[]
    with open(DATA_FILE) as f:
        rdr = csv.DictReader(f)
        for r in rdr:
            r['lat']=float(r['lat']); r['lon']=float(r['lon']); rows.append(r)
    return jsonify(rows)

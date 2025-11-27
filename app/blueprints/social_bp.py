from flask import Blueprint, jsonify, request
from src.social_classifier import SocialClassifier
import csv, os

bp = Blueprint('social', __name__)
SC = SocialClassifier()

@bp.route('/get_samples')
def get_samples():
    rows=[]
    with open(os.path.join('data','social_samples.csv')) as f:
        rdr = csv.DictReader(f)
        for r in rdr: rows.append(r)
    return jsonify(rows)

@bp.route('/classify', methods=['POST'])
def classify():
    msgs = (request.get_json() or {}).get('messages',[])
    scores = SC.score_messages(msgs)
    return jsonify({'scores':scores})

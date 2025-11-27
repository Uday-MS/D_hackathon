from flask import Blueprint, send_from_directory, abort
import os
bp = Blueprint('seg', __name__)

@bp.route('/overlay/<filename>')
def overlay(filename):
    base = os.path.join('data','sample_satellite')
    safe = os.path.normpath(os.path.join(base, filename))
    if not safe.startswith(os.path.abspath(base)): abort(403)
    if not os.path.exists(safe): abort(404)
    return send_from_directory(base, filename)

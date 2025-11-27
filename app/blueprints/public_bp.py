from flask import Blueprint, render_template

bp = Blueprint('public', __name__)

@bp.route('/')
def index():
    return render_template('index.html')

@bp.route('/shelters')
def shelters_page():
    return render_template('shelters.html')

@bp.route('/admin')
def admin_page():
    return render_template('admin.html')

@bp.route('/logs')
def logs_page():
    return render_template('logs.html')

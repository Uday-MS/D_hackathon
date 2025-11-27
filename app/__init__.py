import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()  # load .env if present

def create_app():
    app = Flask(__name__, template_folder='templates', static_folder='static')
    app.config.from_mapping(
        SECRET_KEY=os.getenv('SECRET_KEY','dev'),
        DEMO_MODE = os.getenv('DEMO_MODE','1') == '1'
    )
    CORS(app)

    # register blueprints
    from app.blueprints.public_bp import bp as public_bp
    from app.blueprints.predict_bp import bp as predict_bp
    from app.blueprints.shelters_bp import bp as shelters_bp
    from app.blueprints.sos_bp import bp as sos_bp
    from app.blueprints.quakes_bp import bp as quakes_bp
    from app.blueprints.forecast_bp import bp as forecast_bp
    from app.blueprints.social_bp import bp as social_bp
    from app.blueprints.seg_bp import bp as seg_bp
    from app.blueprints.admin_bp import bp as admin_bp
    from app.blueprints.route_bp import bp as route_bp

    app.register_blueprint(public_bp)
    app.register_blueprint(predict_bp, url_prefix='/api')
    app.register_blueprint(shelters_bp, url_prefix='/api')
    app.register_blueprint(sos_bp, url_prefix='/api')
    app.register_blueprint(quakes_bp, url_prefix='/api')
    app.register_blueprint(forecast_bp, url_prefix='/api')
    app.register_blueprint(social_bp, url_prefix='/api')
    app.register_blueprint(seg_bp, url_prefix='/api')
    app.register_blueprint(admin_bp, url_prefix='/api')
    app.register_blueprint(route_bp, url_prefix='/api')

    return app

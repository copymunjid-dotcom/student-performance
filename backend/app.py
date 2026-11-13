"""
Student Performance Prediction Dashboard Using AI
Backend Application Entry Point
"""

import os
from flask import Flask, jsonify
from flask_cors import CORS
from database import init_db
from routes.api import api_bp

def create_app():
    app = Flask(__name__)
    # Enable CORS for React frontend on any local port (5173, 3000, etc.)
    CORS(app, resources={r"/*": {"origins": "*"}})

    # Initialize Database and pre-seed with sample student dataset
    init_db()

    # Register API routes
    app.register_blueprint(api_bp)

    @app.route('/')
    def root():
        return jsonify({
            'name': 'Student Performance Prediction Dashboard API',
            'status': 'running',
            'docs': {
                'health': '/health',
                'dashboard_stats': '/dashboard/stats',
                'students': '/students',
                'predict': 'POST /predict',
                'risk_analysis': '/risk-analysis',
                'reports': '/reports',
                'model_metrics': '/model-metrics'
            }
        })

    return app

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"Starting Flask server on http://127.0.0.1:{port} ...")
    app = create_app()
    app.run(host='0.0.0.0', port=port, debug=True)

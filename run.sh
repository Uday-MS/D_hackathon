#!/usr/bin/env bash
<<<<<<< HEAD
set -e
=======
# quick runner: create venv if not exists, install, run
>>>>>>> 844f813a (frontend)
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
export FLASK_APP=run.py
export FLASK_ENV=development
python run.py

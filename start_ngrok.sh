#!/usr/bin/env bash
<<<<<<< HEAD
if ! command -v ngrok &> /dev/null; then
  echo "ngrok not found. Install it from https://ngrok.com and add to PATH."
=======
# run ngrok to expose local port 5000
# requires ngrok installed and authtoken set if needed
if ! command -v ngrok &> /dev/null; then
  echo "ngrok not found. Install ngrok or skip this step."
>>>>>>> 844f813a (frontend)
  exit 1
fi
ngrok http 5000

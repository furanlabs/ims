#!/bin/bash

# Force kill anything using port 8000
kill -9 $(lsof -t -i:8000)

# Activate virtual environment
source venv/bin/activate

# Go to backend directory
cd backend/ || exit

# Start Uvicorn
uvicorn main:app --reload

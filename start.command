#!/bin/bash
# Start Backend
osascript -e 'tell app "Terminal" to do script "cd ~/kushagra-ats && source venv/bin/activate && uvicorn backend.main:app --reload"'

# Start Frontend
osascript -e 'tell app "Terminal" to do script "cd ~/kushagra-ats/frontend && DISABLE_ESLINT_PLUGIN=true npm start"'

# Open browser after 5 seconds
sleep 5
open http://localhost:3000

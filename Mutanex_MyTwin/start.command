#!/bin/bash
cd "$(dirname "$0")"
if [ -f "../package.json" ] && command -v npm >/dev/null 2>&1; then
  cd ..
  (sleep 2 && open http://localhost:3000) &
  npm run dev
else
  (sleep 1 && open http://localhost:3000) &
  PORT=3000 python3 server.py || PORT=3000 python server.py
fi

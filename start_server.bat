@echo off
echo Starting Mutanex My Twin Full-Stack Server on http://localhost:3000 ...
if not exist node_modules (
  echo Installing dependencies...
  call npm install
)
start "" http://localhost:3000
call npm run dev
pause

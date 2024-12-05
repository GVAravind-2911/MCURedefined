# Start the backend server in a new PowerShell window
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd backend; python main.py"

# Start the frontend app in a new PowerShell window
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

# Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd frontend; npm run serverstart"

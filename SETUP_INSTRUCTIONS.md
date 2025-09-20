# Frontend Setup Instructions for Mac

## Quick Setup Steps

1. **Prerequisites**
   - Install Node.js (version 14 or higher): https://nodejs.org/
   - Install Git (optional): https://git-scm.com/

2. **Transfer the Project**
   - Copy the entire `frontend` folder to your Mac
   - Make sure ALL folders are included (especially `src`, `public`, and configuration files)

3. **Install Dependencies**
   ```bash
   cd frontend
   npm install --legacy-peer-deps
   ```

4. **Run the Application**
   ```bash
   npm start
   ```
   The app will open automatically at http://localhost:3001

## Files to Transfer (IMPORTANT - Don't miss any!)

### Root Files (in frontend/)
- package.json
- package-lock.json (if exists)
- .env
- .gitignore
- SETUP_INSTRUCTIONS.md (this file)

### Folders
- `/src` - Contains all React source code
  - App.js
  - App.css
  - index.js
  - `/components` - All React components
    - DarkShipMap.js
    - Dashboard.js
    - ImageViewer.js
    - ShipCard.js

- `/public` - Static files
  - index.html
  - `/data` - Data files for the app
  - `/images` - Image assets

- `/node_modules` - (OPTIONAL - can skip and reinstall on Mac)

## Troubleshooting

### If npm install fails:
```bash
npm cache clean --force
npm install --legacy-peer-deps
```

### If port 3001 is already in use:
Edit the `.env` file and change:
```
PORT=3002
```
(or any other available port)

### If the app shows errors about missing data:
Make sure the `/public/data` folder contains:
- arctic_dark_ships.json (or similar data files)

## Notes
- The app uses React 18 with Leaflet for mapping
- Development server includes hot-reload (changes appear instantly)
- ESLint warnings are normal and don't affect functionality
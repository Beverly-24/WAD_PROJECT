# Farm Produce & Livestock Tracker

A full-stack project with:
- Frontend: HTML, CSS, JavaScript (modern, inspired by CropTracker-style UI)
- Backend: Node.js + Express (REST API)
- Database: MySQL (schema provided)

## How to run

1. Install Node.js and MySQL.
2. Create the database:
   - `mysql -u root -p < database/database.sql`
3. Update backend MySQL connection credentials in `server.js`.
4. Install dependencies and run:
   ```bash
   cd backend
   npm install
   node server.js
   ```
5. Open the `frontend` HTML files directly in a browser (or serve them with a static server).

Files included:
- frontend/ (index.html, crops.html, livestock.html, buyers.html, dashboard.html, assets/)
- backend/ (server.js, package.json)
- database/database.sql


# Farmer Survey Collection Application (AgriData)

A full-stack, Progressive Web App (PWA) designed for field survey agents to collect agricultural data. It features secure JWT authentication, GPS location capture, file & audio uploads, offline persistence, and a comprehensive Admin Analytics Dashboard.

## Features
- **PWA Ready**: Works offline on low-network sites, storing data locally until network returns.
- **Admin Dashboard**: Visualize surveys with Leaflet JS Maps and Chart.js graphs.
- **Data Export**: Export total aggregated surveys into CSV formats.
- **GPS Capture**: Integrated HTML5 Geolocation API.
- **Media Upload**: Built-in support for uploading Farmer Images and Audio notes.

## Tech Stack
**Frontend:** HTML5, CSS3 (Glassmorphism), Bootstrap 5, Vanilla JS
**Backend:** Node.js, Express.js
**Database:** MySQL
**Auth:** JWT & bcrypt

## Installation Guide

### 1. Requirements
- Node.js (v14 or higher)
- MySQL Server (XAMPP/WAMP or local MySQL service)

### 2. Database Setup
1. Ensure your MySQL server is running.
2. Edit the `.env` file with your MySQL root credentials if you do not use empty password (`DB_PASSWORD=`).
3. Import the schema defined in `database/schema.sql` by running either:
   ```bash
   node database/initDb.js
   ```
   **OR**, manually import `database/schema.sql` into MySQL using phpMyAdmin or CLI.

### 3. Install Dependencies
```bash
npm install
```

### 4. Run the Application
```bash
node server.js
```
*The server will start on `http://localhost:3000`*

### 5. Access Credentials
An initial Admin account has been seeded into your database upon creation:
- **Primary Admin:** `nlr@kisaankrushi.com` / `aadhaya@2023`
- **CTO Admin:** `cto.kisaankrushi@gmail.com` / `123456789`

You can use the admin dashboard (`http://localhost:3000/admin-dashboard.html`) to create surveyor/user accounts.

---
Produced automatically as per production-ready requirements.

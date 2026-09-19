# EventIQ — Event Booking System (Web Development Capstone)

A full-stack Event Booking System built with **HTML/CSS/JS** (frontend) and **Node.js + Express + MongoDB** (backend). Users can browse events, book tickets, and organizers can create/manage events with a full analytics dashboard.

Covers all 5 capstone modules: User Authentication, Event Management, Ticket Booking, Dashboard & Analytics, and Notifications/Reports.

---

## 1. Project Structure

```
event-booking-system/
├── backend/
│   ├── config/db.js              # MongoDB connection
│   ├── middleware/
│   │   ├── auth.js               # JWT protect + role authorize
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Event.js
│   │   └── Booking.js
│   ├── routes/
│   │   ├── authRoutes.js         # Module 1
│   │   ├── eventRoutes.js        # Module 2
│   │   ├── bookingRoutes.js      # Module 3 & 5
│   │   └── dashboardRoutes.js    # Module 4
│   ├── seed.js                   # Demo data loader
│   ├── server.js
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── css/style.css
    ├── js/
    │   ├── api.js                # API client + auth helpers
    │   ├── navbar.js              # Shared navbar/footer
    │   ├── home.js / events.js / event-detail.js
    │   ├── auth.js / dashboard.js / my-bookings.js
    ├── index.html                # Home (hero + rails)
    ├── events.html                # Browse/search/filter
    ├── event-detail.html          # Booking page
    ├── booking-confirmation.html
    ├── my-bookings.html
    ├── dashboard.html             # Organizer studio
    ├── login.html / register.html
```

---

## 2. Prerequisites

Install these first:
- **Node.js** (v18+) — https://nodejs.org
- **MongoDB Atlas account** (free tier) — https://www.mongodb.com/cloud/atlas
- **Git** — https://git-scm.com
- **VS Code** (recommended editor)
- A **GitHub account**

---

## 3. Backend Setup (Local)

```bash
cd backend
npm install
```

Create your real `.env` file:
```bash
cp .env.example .env
```

Edit `.env` and fill in:
```
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/eventbooking
JWT_SECRET=any_long_random_string_here
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5500
```

### Get your MongoDB URI (MongoDB Atlas — free)
1. Go to https://cloud.mongodb.com and create a free cluster (M0).
2. Click **Database Access** → Add a database user (note username/password).
3. Click **Network Access** → Add IP Address → **Allow Access from Anywhere** (0.0.0.0/0) for development.
4. Click **Connect** → **Drivers** → copy the connection string, replace `<username>` and `<password>`, and paste it into `MONGO_URI`.

### Run the backend
```bash
npm run dev
```
You should see:
```
MongoDB Connected: cluster0-xxxxx.mongodb.net
Server running in development mode on port 5000
```

### (Optional) Load demo data
```bash
node seed.js
```
This creates 6 sample events and a demo organizer login:
```
Email: organizer@demo.com
Password: password123
```

Test the API is alive: open `http://localhost:5000/api/health` in your browser.

---

## 4. Frontend Setup (Local)

The frontend is plain HTML/CSS/JS — no build step needed. You just need a local server (opening the file directly with `file://` will break `fetch` calls in some browsers).

**Option A — VS Code Live Server extension (easiest)**
1. Install the "Live Server" extension in VS Code.
2. Right-click `frontend/index.html` → "Open with Live Server".
3. It opens at `http://127.0.0.1:5500` by default.

**Option B — Node's http-server**
```bash
cd frontend
npx http-server -p 5500
```

Make sure `backend/.env`'s `CLIENT_URL` matches the port your frontend runs on (e.g. `http://localhost:5500` or `http://127.0.0.1:5500`), then restart the backend.

Open the site, click **Sign Up**, create an account (choose "Organizer" to create events, or "Attendee" to book them), and test the full flow.

---

## 5. Pushing to GitHub

```bash
cd event-booking-system
git init
git add .
git commit -m "Initial commit: Event Booking System full-stack app"
```

Create a new repository on GitHub (https://github.com/new), don't initialize it with a README, then:

```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/event-booking-system.git
git push -u origin main
```

**Important:** `.env` is already excluded via `.gitignore` — never commit real secrets.

---

## 6. Deployment

### Deploy Backend (Render — free tier)
1. Go to https://render.com → New → Web Service.
2. Connect your GitHub repo.
3. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Add Environment Variables (from your `.env`): `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRE`, `NODE_ENV=production`, `CLIENT_URL` (your deployed frontend URL, set this after step below).
5. Deploy. Copy your live backend URL, e.g. `https://event-booking-backend.onrender.com`.

### Deploy Frontend (Netlify or Vercel — free)
**Netlify:**
1. Go to https://app.netlify.com → Add new site → Import from GitHub.
2. **Base directory:** `frontend`
3. **Publish directory:** `frontend` (no build step needed)
4. Deploy. Copy your live frontend URL, e.g. `https://eventiq.netlify.app`.

**Vercel (alternative):**
```bash
cd frontend
npx vercel
```
Follow prompts, set root directory to `frontend`.

### Connect them
1. In `frontend/js/api.js`, replace:
   ```js
   : 'https://YOUR-BACKEND-URL.onrender.com/api';
   ```
   with your actual Render backend URL.
2. Commit and push this change — Netlify/Vercel will auto-redeploy.
3. Update `CLIENT_URL` in your Render backend's environment variables to your Netlify/Vercel frontend URL, then redeploy the backend (Render → Manual Deploy).

Test the live site end-to-end: register, create an event (as organizer), book it (as attendee), check the dashboard.

---

## 7. Feature Checklist (maps to your capstone modules)

| Module | Feature | Where |
|---|---|---|
| 1 | Register/Login/Logout, password hashing (bcrypt), JWT sessions | `authRoutes.js`, `login.html`, `register.html` |
| 2 | Create/update/delete events, banners, venue & date | `eventRoutes.js`, `dashboard.html` |
| 3 | View events, book seats, get confirmation code | `bookingRoutes.js`, `event-detail.html`, `booking-confirmation.html` |
| 4 | Revenue, bookings, seat-fill stats per event | `dashboardRoutes.js`, dashboard "Overview" tab |
| 5 | Booking confirmations, cancellations, per-event reports | `bookingRoutes.js` (`/event/:eventId`), `my-bookings.html` |

---

## 8. Project Workflow (as implemented)

The homepage displays this same 6-step workflow as a visual tracker:

1. **User Registration & Login** — `register.html`, `login.html`
2. **Event Creation** — organizer creates events from `dashboard.html`
3. **Event Listing** — `index.html` and `events.html` display all events with search/filter
4. **Ticket Booking** — `event-detail.html`, seat selection and confirm
5. **Booking Confirmation** — `booking-confirmation.html` shows a unique booking code
6. **Dashboard & Reports** — `dashboard.html` "Overview" tab shows bookings, revenue, and seat stats

## 9. Suggested Demo Video Script (2–3 min)

1. Show homepage — workflow tracker and module overview.
2. Register as an **Organizer**.
3. Go to Dashboard → Create a new event.
4. Log out, register/login as a regular **Attendee**.
5. Browse events, open event detail, select seats, confirm booking.
6. Show booking confirmation screen with code.
7. Go to "My Bookings" → cancel one booking.
8. Log back in as organizer → show updated stats on dashboard.

---

## 10. Tech Stack Used

- **Frontend:** HTML5, CSS3 (custom, no framework), Vanilla JavaScript (ES6+)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Auth:** JWT + bcryptjs password hashing
- **Deployment:** Render (backend), Netlify/Vercel (frontend)



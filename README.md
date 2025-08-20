# 🍽️ FullSnack — Meal & Nutrition Tracker

**FullSnack** is a full-stack web app for fast, friendly food logging. Search foods, preview nutrition with an image, add to your log, and see accurate **daily** and **weekly** totals at a glance.  
Built with **Django REST** (API) and **React** (Vite, Tailwind + React-Bootstrap).

---

## 🚀 Features

- 🔎 **Search → Preview → Add**  
  Type a food (e.g., “chicken salad”), see **calories + macros** and a photo, then add in one click.
- ✏️ **Edit & Delete**  
  Inline edit modal to adjust portions; delete entries; totals recalc immediately on the server.
- 🖼️ **Auto Image & Credit**  
  Photos via Unsplash (proxied by the backend). Required attribution is displayed on cards.
- 🏠 **Home (Today’s Total)**  
  Personalized header; **today’s calories** card auto-updates after create/edit/delete.
- 📊 **Dashboard (Weeks → Day Bubbles)**  
  Expand a week to view **individual day bubbles** with totals; jump to a Day view.
- 📆 **Day View**  
  See all entries for a specific date; edit/delete from here as well.
- 👤 **Profile**  
  Update first/last name and email; optional password change with clear validation & feedback.
- ⚠️ **Friendly Error States**  
  Polished error page with “Reload Page” and “Go Home”; helpful alerts/spinners throughout.
- 🎨 **Cohesive, Responsive UI**  
  Tailwind utilities + React-Bootstrap components with a mint “FullSnack” theme.

---

## 🧰 Tech Stack

**Backend**
- Django 5, Django REST Framework
- PostgreSQL
- Token Auth (`rest_framework.authtoken`)
- CORS (`django-cors-headers`)

**Frontend**
- React (Vite)
- Tailwind CSS + React-Bootstrap
- React Router DOM
- Axios

**3rd-Party APIs**
- [FDC API](https://fdc.nal.usda.gov/api-guide) — nutrition data
- [Unsplash](https://unsplash.com/developers) — food images + attribution

---

## 🗺️ Frontend Routes

- `/` — Home (logo, “Alex’s Homepage”, **Today’s Calories** card)
- `/login/` — Log In
- `/signup/` — Sign Up
- `/profile/` — Update account info (+ optional password change)
- `/foodlog/` — Search → Preview → Add; list of **today’s** entries (edit/delete)
- `/dashboard/` — Weeks list; expand a week to see **day bubbles**
- `/days/:date/` — Day View (entries for that date; edit/delete)

---

## 🔌 API Overview (selected endpoints)

**Auth**
- `POST /api/users/signup/` → `{ user, token }`
- `POST /api/users/login/` → `{ user, token }`
- `POST /api/users/logout/` → `204 No Content`
- `GET  /api/users/info/` → `{ user: {...} }`
- `PUT  /api/users/info/` → update current user (supports `old_password` + `new_password`)

**Foods**
- `GET  /api/foods/?day=YYYY-MM-DD` → list entries for that date
- `GET  /api/foods/:id/` → retrieve one
- `POST /api/foods/` → create a log `{ food_name, calories, protein, carbs, fat }`
- `PUT  /api/foods/:id/` → update a log (recalculates totals server-side)
- `DELETE /api/foods/:id/` → delete (recalculates **Day/Week** totals server-side via a helper like `recalculate_totals()`)

**Dates**
- `GET /api/dates/days/?week_start=YYYY-MM-DD` → days in the given week (for Dashboard)
- `GET /api/dates/days/` → recent days (~30 most recent for the user)

**Images (proxy)**
- `GET   /api/images/search/?q=QUERY` → preview candidates `[{ id, alt, thumb, full, credit }, ...]`
- `PATCH /api/images/foodlogs/:id/set/` with `{ q }` → sets a photo for the log and returns `{ foodlog, credit }`


---

## 🧭 Data Flow & Recalculation

- **Create / Edit**: serializer saves → model `save()` triggers recalc → **Home/Dashboard/Day** totals reflect changes.
- **Delete**: endpoint deletes **then** calls a model helper (e.g., `recalculate_totals()`) → **Day** and **Week** totals update.
- **UI sync**: pages dispatch/listen for a custom event:
  - `window.dispatchEvent(new Event('foodlog:changed'))`
  - Home & DayView listen and refetch (with a small debounce/retry to avoid race conditions).

---

## ⚙️ Setup

### 1) Backend (Django)
```bash
cd backend
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
# set env vars (see below)
python manage.py migrate
python manage.py runserver
```

**Backend environment**
Create `backend/.env` or export these:
```
DJANGO_SECRET_KEY=change-me
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (either DATABASE_URL or individual settings)
# DATABASE_URL=postgres://USER:PASS@HOST:5432/DBNAME
DB_NAME=fullsnack
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# API keys
CALORIE_NINJAS_API_KEY=your_calorieninjas_key
UNSPLASH_ACCESS_KEY=your_unsplash_access_key
```

### 2) Frontend (React + Vite)
```bash
cd frontend
npm install
# set env vars (see below)
npm run dev
```

**Frontend environment (`frontend/.env`)**
```
VITE_API_BASE=http://localhost:8000/api/
```

```js
// tailwind.config.js (excerpt)
export default {
  content: ['./index.html','./src/**/*.{js,jsx,ts,tsx}'],
  safelist: [
    { pattern: /bg-snack-(50|100|200|300|400|500|600|700|800|900)/ },
    { pattern: /text-snack-(600|700)/ },
    { pattern: /border-snack-(100|200)/ },
  ],
};
```

---

## 🧪 Quick Test (cURL)

```bash
# sign up
curl -X POST http://localhost:8000/api/users/signup/   -H "Content-Type: application/json"   -d '{"email":"demo@example.com","password":"password123","first_name":"Demo","last_name":"User"}'

# login
curl -X POST http://localhost:8000/api/users/login/   -H "Content-Type: application/json"   -d '{"email":"demo@example.com","password":"password123"}'
# → save the returned token

# create a log (replace TOKEN)
curl -X POST http://localhost:8000/api/foods/   -H "Authorization: Token TOKEN" -H "Content-Type: application/json"   -d '{"food_name":"Chicken salad","calories":420,"protein":30,"carbs":20,"fat":12}'

# get today’s logs (UTC YYYY-MM-DD)
curl "http://localhost:8000/api/foods/?day=$(date -u +%F)" -H "Authorization: Token TOKEN"
```

---

## 📸 Screenshots
- **Home**<br>
  ![Home](./assets/home.png)
- **Food Log**<br>
  ![Food Log](./assets/foodlog.png)
- **Dashboard**<br>
  ![Dashboard](./assets/dashboard.png)
- **Day View**<br>
  ![Day View](./assets/days.png)
- **Profile**<br>
  ![Profile](./assets/profile.png)
- **Database**<br>
  ![Database](./assets/db-schema.png)

---

## 🧑‍🎓 Author

**Alexander Douglas Walker**  
- 🌐 LinkedIn: https://www.linkedin.com/in/alexander-walker-007160119  
- 📧 alexwalker1337@gmail.com  
- 🛠️ U.S. Army Veteran | Cryptologic Linguist | Aspiring Full Stack Engineer

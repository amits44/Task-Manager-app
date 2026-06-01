# Task Manager App

A simple task manager where you can create and manage tasks across three stages — Todo, In Progress, and Done.

Live links:
- Frontend: https://task-manager-app-silk-pi.vercel.app/
- Backend: https://task-manager-app-production-677b.up.railway.app/health

---

## What it does

- Register and login with your email and password
- Create tasks with a title, description, priority, and due date
- Move tasks between Todo, In Progress, and Done
- Edit or delete tasks
- Search tasks by name

---

## Tech used

**Frontend** - React + Vite, CSS Modules for styling, Axios for API calls, React Router for navigation

**Backend** - Node.js with Express, MongoDB for the database, JWT for authentication

I went with React because I'm most comfortable with it. The backend is Node + Express since it's straightforward to set up and easy to deploy on free platforms.

---

## How to run locally

**Clone the repo**
```bash
git clone https://github.com/your-username/task-manager-app.git
cd task-manager-app
```

**Backend**
```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=any_random_string
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

```bash
npm run dev
```

**Frontend**
```bash
cd frontend
npm install
```

Create a `.env` file inside `frontend/`:
```
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev
```

Open http://localhost:5173

---

## Assumptions

- Each user only sees their own tasks - there's no sharing between accounts
- I didn't add email verification, any valid email format works to register
- Tasks are permanently deleted, there is no trash or undo option
- Pagination wasn't added since this is a personal tool and the task count stays manageable

---

## Tradeoffs

**JWT stored in localStorage**- easier to implement than cookies. For a production app with sensitive data I'd use httpOnly cookies, but for this scope it works fine.

**No drag and drop**- tasks move between stages using arrow buttons instead. It was simpler to build correctly.

**MongoDB over SQL**- the task schema is simple and MongoDB Atlas has a free tier that's easy to connect. A relational DB would be a better fit if the app needed complex queries or reporting, but for this it's okay.

**Context API instead of Redux**- the app state is small enough that React Context handles it cleanly without adding extra dependencies.

---

## Technical decisions

- Used CSS Modules to keep styles scoped to each component and avoid class name conflicts
- All task routes on the backend are protected, you can't access or modify another user's tasks even if you know the task ID
- Input validation happens on both the frontend (basic checks) and backend (express-validator) so bad data doesn't reach the database
- Used debounce on the search input so it doesn't fire an API call on every single keystroke

---

## Note on AI tools

AI tools were used during development, so a backend has been implemented as per the assignment requirement.

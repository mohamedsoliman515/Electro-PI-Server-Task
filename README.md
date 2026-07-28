# TaskFlow API

A production-ready REST API for the TaskFlow app — Node.js, Express, MongoDB Atlas, and Mongoose, with JWT authentication and per-user task ownership.

## Tech Stack

- Node.js (LTS) + Express.js
- MongoDB Atlas + Mongoose
- JWT authentication (`jsonwebtoken`)
- `bcryptjs` for password hashing
- `dotenv`, `cors`, `nodemon`

## Project Structure

```
task-manager-api/
├── src/
│   ├── config/
│   │   └── db.js                  # Mongoose connection to Atlas
│   ├── controllers/
│   │   ├── auth.controller.js     # register, login
│   │   └── task.controller.js     # task CRUD
│   ├── middleware/
│   │   ├── auth.middleware.js     # JWT verification -> req.user
│   │   ├── error.middleware.js    # centralized error handler
│   │   └── notFound.middleware.js # 404 handler
│   ├── models/
│   │   ├── User.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   └── task.routes.js
│   ├── services/
│   │   ├── auth.service.js        # business logic for auth
│   │   └── task.service.js        # business logic + ownership checks
│   ├── utils/
│   │   ├── ApiError.js
│   │   ├── asyncHandler.js
│   │   ├── generateToken.js
│   │   └── validators.js
│   ├── app.js                     # Express app (middleware + routes)
│   └── server.js                  # entry point (connects DB, starts server)
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## 1. Installation

```bash
cd task-manager-api
npm install
```

## 2. Environment Variables

Copy the example file and fill in your own values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `PORT` | Port the server listens on (default `5000`) |
| `NODE_ENV` | `development` or `production` |
| `MONGO_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | Long random string used to sign JWTs |

## 3. MongoDB Atlas Setup

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. **Database Access** → add a database user with a username/password (not your Atlas login).
3. **Network Access** → add your current IP, or `0.0.0.0/0` for development.
4. **Database** → **Connect** → **Drivers** → copy the connection string, it looks like:
   ```
   mongodb+srv://<username>:<password>@<cluster-url>/?retryWrites=true&w=majority
   ```
5. Paste it into `.env` as `MONGO_URI`, replacing `<username>`/`<password>`, and add a database name before the `?`, e.g. `/task-manager?retryWrites=true...`.

## 4. Run

```bash
npm run dev     # nodemon, auto-restarts on file changes
npm start        # plain node, for production
```

The API will be available at `http://localhost:5000`.

## API Endpoints

### Auth

| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create a new user |
| POST | `/api/auth/login` | Public | Log in, get a JWT |

### Tasks
All task routes require `Authorization: Bearer <token>` and only ever return/modify the authenticated user's own tasks.

| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/api/tasks` | Private | List all of your tasks |
| GET | `/api/tasks/:id` | Private | Get a single task |
| POST | `/api/tasks` | Private | Create a task |
| PUT | `/api/tasks/:id` | Private | Update a task |
| DELETE | `/api/tasks/:id` | Private | Delete a task |

## Example Requests / Responses

### Register
`POST /api/auth/register`
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123"
}
```
**201 Created**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { "id": "64f1...", "name": "John Doe", "email": "john@example.com" },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login
`POST /api/auth/login`
```json
{ "email": "john@example.com", "password": "secret123" }
```
**200 OK** — same shape as register (`data.user`, `data.token`).

### Create Task
`POST /api/tasks`
Headers: `Authorization: Bearer <token>`
```json
{ "title": "Design landing page", "description": "Create a modern landing page for our product." }
```
**201 Created**
```json
{
  "success": true,
  "message": "Task created",
  "data": {
    "_id": "64f2...",
    "title": "Design landing page",
    "description": "Create a modern landing page for our product.",
    "completed": false,
    "user": "64f1...",
    "createdAt": "2026-07-27T10:00:00.000Z",
    "updatedAt": "2026-07-27T10:00:00.000Z"
  }
}
```

### List Tasks
`GET /api/tasks` → **200 OK**
```json
{ "success": true, "count": 1, "data": [ { "...": "task object" } ] }
```

### Update Task
`PUT /api/tasks/:id`
```json
{ "completed": true }
```
**200 OK** → `{ "success": true, "message": "Task updated", "data": { "...": "updated task" } }`

### Delete Task
`DELETE /api/tasks/:id` → **200 OK** → `{ "success": true, "message": "Task deleted" }`

## Error Responses

All errors go through the centralized error middleware and follow this shape:
```json
{ "success": false, "message": "Email is already registered" }
```

| Status | When |
|---|---|
| 400 | Validation errors, malformed IDs, duplicate email |
| 401 | Missing/invalid/expired token, wrong login credentials |
| 403 | Trying to access another user's task |
| 404 | Task not found, unknown route |
| 500 | Unexpected server error |

## Connecting the React Frontend

In the frontend's `services/api.js`, set:
```
VITE_API_URL=http://localhost:5000/api
```
Store the returned `token` (e.g. in memory or `localStorage`) and send it on every task request:
```js
headers: { Authorization: `Bearer ${token}` }
```

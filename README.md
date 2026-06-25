# Cerbos Auth Demo: Step-by-Step Setup & Verification Guide

This guide provides absolute step-by-step instructions to configure, run, and test the **Cerbos Auth Demo** application using a **local PostgreSQL database**, **Supabase Auth** (for authentication), and **Cerbos** (for role-based and attribute-based authorization).

---

## Prerequisites

Before starting, ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for running Cerbos)
- [PostgreSQL](https://www.postgresql.org/download/) (installed locally, e.g. listening on port `5432`)
- [Postman](https://www.postman.com/downloads/) (optional, for API testing)

---

## Step 1: Set Up Your Local PostgreSQL Database

### 1.1 Start PostgreSQL
Ensure your local PostgreSQL server is running. By default, it runs on host `localhost` and port `5432`.

### 1.2 Create the Database
Log in to your PostgreSQL instance using `psql`, PgAdmin, or any database GUI client, and run:
```sql
CREATE DATABASE localdb;
```

### 1.3 Create the Employees Table
Connect to your newly created database (`localdb` or your default `postgres` database) and run the following DDL script (located at [schema.sql](file:///d:/SAIIII/git/supabase-auth/backend/src/database/schema.sql)) to create the `employees` table:

```sql
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    salary NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL
);
```

---

## Step 2: Set Up Supabase Auth

This application uses Supabase solely as an Identity Provider (Authentication). It does not use Supabase's database for employee data.

### 2.1 Create a Supabase Project
1. Go to [Supabase Console](https://supabase.com) and sign in.
2. Click **New Project**, select an organization, enter a project name, database password, and choose a region close to you.
3. Wait a few minutes for the project to provision.

### 2.2 Retrieve Configuration Keys
Once the project is ready, navigate to **Project Settings** (gear icon on the bottom-left sidebar):
1. Go to **INTEGRATIONS > Data API** in the left sidebar to find your Project URL (labeled as **URL**, e.g., `https://xyz.supabase.co`).
2. Go to **CONFIGURATION > API Keys** in the left sidebar (which is shown in your screenshot):
   - Copy the **Publishable key** (this is your `anon public` key, labeled as `default` under Publishable key).
   - Copy the **Secret keys** (this is your `service_role` key, click the eye icon to reveal the `default` key under Secret keys).
3. Go to **CONFIGURATION > JWT Keys** in the left sidebar:
   - Copy the **JWT Secret** string. (This is critical: the Express backend needs this secret to verify JWTs signed by Supabase Auth).

---

## Step 3: Configure Environment Variables

Create and configure the configuration files in both `backend/` and `frontend/` folders.

### 3.1 Backend Configuration
1. Go to the `backend/` directory.
2. Create a file named `.env` (or copy `.env.example` to `.env`).
3. Replace the placeholder values with your Supabase credentials and your local PostgreSQL connection string:

```env
PORT=5000
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SUPABASE_JWT_SECRET=your-supabase-jwt-secret
CERBOS_URL=http://localhost:3592

# Local Database Connection String:
# Syntax: postgresql://[user]:[password]@localhost:5432/[database_name]
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/localdb
```

> [!IMPORTANT]
> The database connection pool ([database/index.ts](file:///d:/SAIIII/git/supabase-auth/backend/src/database/index.ts)) is programmed to automatically turn off SSL encryption if `localhost` is detected in the `DATABASE_URL`. This allows clean, unencrypted connections to your local database without complex configuration.

### 3.2 Frontend Configuration
1. Go to the `frontend/` directory.
2. Create a file named `.env.local` (or copy `.env.example` to `.env.local`).
3. Populate it with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## Step 4: Run the Cerbos Authorization Engine

Cerbos runs as an independent policy engine. You can run it either via **Docker** or as a **local Windows binary** (without Docker).

### Option A: Running without Docker (Windows PowerShell)
We have included a script [start-cerbos.ps1](file:///d:/SAIIII/git/supabase-auth/start-cerbos.ps1) that automatically downloads the official Cerbos binary and starts it:
1. Open PowerShell in the workspace root directory.
2. Run the script:
   ```powershell
   .\start-cerbos.ps1
   ```
3. This downloads Cerbos v0.34.0, extracts it inside the `cerbos/` folder, and runs the server pointing to your policies.

### Option B: Running with Docker
1. Open your terminal at the workspace root directory.
2. Launch the Cerbos container:
   ```bash
   docker-compose up -d
   ```

### Verify Cerbos Status
Test the Cerbos status API in your browser: `http://localhost:3592` (should return Cerbos server status JSON metadata).

---

## Step 5: Start Frontend and Backend Applications

### 5.1 Run the Express Backend
Open a terminal window:
```bash
cd backend
npm install
npm run dev
```
You should see:
```
[Server]: Backend running on port 5000
[Server]: Configured Cerbos URL at http://localhost:3592
[Database]: Pool connected successfully
```

### 5.2 Run the Next.js Frontend
Open a second terminal window:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your web browser.

---

## Step 6: Step-by-Step Scenario Testing

To test authorization behavior, create four accounts via the `/signup` screen using the following roles (roles are automatically appended to the user metadata):

### Setup Sandbox Users
1. Go to `http://localhost:3000/signup`.
2. Register the following test credentials:
   - Email: `admin@test.com` | Password: `password123` | Select Role: **Admin**
   - Email: `manager@test.com` | Password: `password123` | Select Role: **Manager**
   - Email: `employee@test.com` | Password: `password123` | Select Role: **Employee**
   - Email: `viewer@test.com` | Password: `password123` | Select Role: **Viewer**

---

### Scenario 1: Test Viewer Permissions (Read-Only)
1. Sign in as `viewer@test.com`.
2. Browse to the **Employees** page:
   - You can see the list of employees.
   - The **Add Employee** button is hidden.
   - The **Edit** and **Delete** buttons are hidden on all records.
3. If you try to manually navigate to `http://localhost:3000/employees/new`, the API request will return `403 Forbidden` and you will be blocked.

---

### Scenario 2: Test Employee Permissions (Read-Only + Edit Own Only)
1. Log out, then sign in as `employee@test.com`.
2. Ask another user (e.g. Admin) to create some records, or register a record.
3. Observe the employee directory list:
   - You can read all records.
   - You cannot delete any record.
   - You cannot create a record.
   - **Edit** button is visible **ONLY** on employee records that list `created_by` matching your current user ID. All other records will have the Edit button disabled or hidden.

---

### Scenario 3: Test Manager Permissions (Create + Read + Edit, No Delete)
1. Sign in as `manager@test.com`.
2. Go to the **Employees** page:
   - The **Add Employee** button is visible and you can register new records.
   - The **Edit** button is visible on **all** records, allowing you to update anyone's department or salary.
   - The **Delete** button is hidden on all records.
3. Try to hit the delete endpoint via API (e.g., using Postman) — you will get a `403 Forbidden` response.

---

### Scenario 4: Test Admin Permissions (Full Control)
1. Sign in as `admin@test.com`.
2. Go to the **Employees** page:
   - **Add Employee**, **Edit**, and **Delete** buttons are visible on all records.
   - You can delete any employee record from the local PostgreSQL database.

---

## Step 7: Inspect Architecture Internals (Developer Console)

Use the **Dev Console** toggle button at the top-right of your dashboard to view authorization logic in real-time:
1. **Request Inspector**: Watch the HTTP headers containing the `Bearer [JWT]` token, and the responses returned by the Express API.
2. **JWT Debugger**: View your decoded Supabase token payload showing `user_metadata.role`.
3. **Cerbos Decisions**: See the active principal variables evaluated by Cerbos.

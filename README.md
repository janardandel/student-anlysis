# Moodle to Supabase Reporting & Student Planning System

An end-to-end analytics and student intervention planning platform connecting **Moodle REST API**, **Self-Hosted n8n**, **Supabase (PostgreSQL & Auth)**, and a **GitHub Pages** teacher reporting dashboard.

---

## 📁 Repository Structure

```
moodle-supabase-reporting/
├── supabase/
│   ├── schema.sql           # Database schema, foreign keys, indexes, and RLS policies
│   └── seed.sql             # Test seed data (courses, quizzes, attempts, plans)
├── n8n/
│   └── moodle_supabase_workflow.json  # Importable n8n workflow for incremental sync
├── docs/
│   └── moodle_api_setup.md  # Step-by-step Moodle Web Services API configuration guide
└── dashboard/               # Vite + React + Tailwind CSS Teacher Web App
    ├── src/                 # Charts, Student Tables, Planning Tracker, Supabase client
    ├── .github/workflows/   # Automated GitHub Pages CI/CD deployment
    └── package.json
```

---

## 🚀 Quickstart & Setup Guide

### Step 1: Initialize Supabase Database
1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Run [`supabase/schema.sql`](./supabase/schema.sql) to create the schema and Row-Level Security (RLS) policies.
4. *(Optional)* Run [`supabase/seed.sql`](./supabase/seed.sql) to populate sample test data.

---

### Step 2: Configure Moodle REST API
Follow the detailed instructions in [`docs/moodle_api_setup.md`](./docs/moodle_api_setup.md):
1. Enable Web Services & REST protocol in Moodle.
2. Create an external service `Supabase Reporting Service` with `mod_quiz_get_user_attempts` and `mod_quiz_get_quizzes_by_courses`.
3. Create a service bot user and generate a Web Service API Token.

---

### Step 3: Import n8n Workflow (Self-Hosted)
1. Open your self-hosted n8n instance.
2. Go to **Workflows** $\rightarrow$ **Import from JSON** and select [`n8n/moodle_supabase_workflow.json`](./n8n/moodle_supabase_workflow.json).
3. Set your Environment Variables / Credentials:
   - `MOODLE_BASE_URL`: `https://<your-moodle-domain>`
   - `MOODLE_API_TOKEN`: Your generated Moodle token
   - Connect your **Supabase PostgreSQL Credentials** in the database nodes.
4. Activate the workflow (runs automatically on a schedule to fetch new finished quiz attempts).

---

### Step 4: Run or Deploy Dashboard to GitHub Pages

#### Local Development
```bash
cd dashboard
npm install
npm run dev
```

#### Deploy to GitHub Pages
1. Push the repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Moodle reporting dashboard"
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git branch -M main
   git push -u origin main
   ```
2. In your GitHub repository:
   - Go to **Settings** $\rightarrow$ **Pages**.
   - Under **Build and deployment** $\rightarrow$ **Source**, choose **GitHub Actions**.
   - *(Optional)* Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to **Settings** $\rightarrow$ **Secrets and variables** $\rightarrow$ **Actions**.
3. The GitHub Actions workflow will automatically build and publish your dashboard at `https://<your-username>.github.io/<repo-name>/`.

# Student Performance Prediction Dashboard Using AI

> A modern, responsive web application for predictive academic performance analytics, early risk detection, and personalized educational intervention planning powered by Machine Learning.

---

## 1. Overview & Architecture

**Student Performance Prediction Dashboard Using AI** enables educators and academic administrators to monitor student progress, predict expected examination marks, categorize academic standing (Excellent, Good, Average, At Risk), and receive automated, data-driven recommendations.

### Key Capabilities:
- **Real-Time Machine Learning Inference**: Uses an ensemble **Random Forest Classifier** to assess academic category and a regularized **Linear Regression** model to predict final examination marks (0–100 scale).
- **Early Warning & Risk Triage**: Real-time identification of students with dropping attendance or substandard coursework marks to trigger timely intervention plans.
- **Explainable AI (XAI)**: Breaks down the positive and negative factor contributions (attendance, previous semester marks, internal assessments, assignment scores, daily study hours) influencing each prediction.
- **Personalized Recommendations**: Automatically generates actionable advice tailored to individual weaknesses (e.g., attendance recovery plans, targeted tutoring, study schedules).
- **Comprehensive Academic Records**: Full CRUD operations for student profiles and multi-semester historical grade tracking with input bounds validation.
- **Reporting & Analytics**: Downloadable CSV data exports and printable institutional reports.
- **Dual Database Architecture**: Zero-config SQLite database pre-seeded with 20 realistic student records for immediate local execution, plus complete Supabase PostgreSQL schema with Row-Level Security (RLS) policies.

---

## 2. Technology Stack

### Frontend
- **React.js 19** with **Vite**
- **Tailwind CSS v4** (Modern clean blue & white SaaS theme)
- **Lucide React** (Consistent UI iconography)
- **Recharts** (Interactive score distributions, semester trends, and attendance analysis)
- **React Router v7** (Protected dashboard navigation)

### Backend & Machine Learning
- **Python 3.11+** & **Flask REST API**
- **Scikit-learn / NumPy ML Engine**
  - **Random Forest Classifier**: Category classification (*Excellent*, *Good*, *Average*, *At Risk*) with class probability distributions
  - **Ridge Linear Regression**: Continuous expected mark prediction ($R^2 = 0.931$, $\text{MAE} = 2.68$ marks)
- **Joblib / JSON** serialization for model weights and evaluation metadata

### Database & Authentication
- **Supabase (PostgreSQL)**: Complete SQL schema with RLS policies, indexes, and foreign keys
- **SQLite Fallback**: Integrated database pre-seeded with 20 sample students across 4 engineering departments
- **Supabase Auth** + Mock Session Manager for frictionless demo testing

---

## 3. Project Structure

```
student-performance-dashboard/
├── backend/
│   ├── app.py                      # Flask REST API entry point & CORS configuration
│   ├── database.py                 # DB connection layer & automated sample seeding
│   ├── student_data.db             # Pre-seeded SQLite database
│   ├── requirements.txt            # Python dependencies
│   ├── .env.example                # Backend environment configuration
│   ├── model/
│   │   ├── train_model.py          # Synthetic dataset generator & ML training pipeline
│   │   ├── predict.py              # Inference engine, factor explanation & recommendations
│   │   ├── student_dataset_synthetic.csv # Generated dataset (1,200 records)
│   │   └── saved_model/
│   │       └── model_artifacts.json # Serialized models, tree rules, weights & metrics
│   └── routes/
│       └── api.py                  # All REST API endpoints
├── frontend/
│   ├── index.html                  # HTML5 entry with Google Plus Jakarta Sans font
│   ├── package.json                # Frontend dependencies
│   ├── vite.config.js              # Vite configuration with Tailwind & backend proxy
│   ├── .env.example                # Frontend environment template
│   └── src/
│       ├── App.jsx                 # Route definitions & AuthProvider
│       ├── main.jsx                # React root mount
│       ├── index.css               # Tailwind CSS v4 styling & print media rules
│       ├── components/
│       │   ├── Navbar.jsx          # Header with global search, notifications, user badge
│       │   ├── Sidebar.jsx         # Collapsible SaaS navigation sidebar
│       │   ├── StatCard.jsx        # Metric summary cards with delta badges
│       │   ├── PredictionResultCard.jsx # Score gauge, probabilities & recommendations
│       │   ├── StudentModal.jsx    # Add / edit student modal
│       │   ├── StudentProfileModal.jsx # Comprehensive student dossier
│       │   └── PerformanceFormModal.jsx # Grade entry with numeric boundary validation
│       ├── pages/
│       │   ├── Dashboard.jsx       # 5 KPI cards + 6 interactive charts
│       │   ├── StudentManagement.jsx # Student CRUD, search & filters
│       │   ├── AcademicPerformance.jsx # Coursework & semester marks table
│       │   ├── AIPrediction.jsx    # Interactive what-if simulator & ML predictor
│       │   ├── RiskAnalysis.jsx    # Early warning triage & intervention triggers
│       │   ├── Reports.jsx         # CSV export & formatted printable view
│       │   ├── Login.jsx           # Sign in with one-click demo credentials
│       │   └── Register.jsx        # Teacher / Administrator account registration
│       ├── layouts/
│       │   └── DashboardLayout.jsx # Authenticated layout shell
│       ├── services/
│       │   ├── api.js              # Unified REST API service
│       │   └── supabaseClient.js   # Supabase client initializer
│       └── hooks/
│           └── useAuth.jsx         # React Authentication Context & hook
├── database/
│   └── schema.sql                  # PostgreSQL / Supabase DDL schema with RLS
└── README.md
```

---

## 4. Installation & Setup

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** and **npm**

### Step 1: Clone or Navigate to Directory
```bash
cd student-performance-dashboard
```

### Step 2: Backend Setup & ML Training
1. Open a terminal in `backend/`:
   ```bash
   cd backend
   ```
2. (Optional) Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install required packages:
   ```bash
   pip install -r requirements.txt
   ```
4. (Optional) Re-train the Machine Learning models (already pre-trained and saved in `saved_model/`):
   ```bash
   python model/train_model.py
   ```
   *Output displays regression $R^2$ score ($0.931$), MAE ($2.68$ marks), classification accuracy ($78.8\%$), and top predictive factor weights.*

5. Launch the Flask backend server:
   ```bash
   python app.py
   ```
   *The backend will automatically start on `http://127.0.0.1:5000` and seed the SQLite database with 20 sample students.*

### Step 3: Frontend Setup
1. Open a second terminal in `frontend/`:
   ```bash
   cd frontend
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser at `http://localhost:5173`.

---

## 5. Demonstration Credentials

The application includes frictionless one-click demo logins on the Login page (`/login`):
- **Administrator Demo**: `admin@university.edu` / `admin123`
- **Teacher Demo**: `teacher@university.edu` / `teacher123`

You can also register any new account on `/register` or enter custom credentials.

---

## 6. Supabase Setup (Optional)

If you wish to connect your own Supabase project instead of using the local SQLite database:

1. Create a project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Open `database/schema.sql` and run the script to create tables (`users`, `students`, `performance`, `predictions`, `recommendations`), constraints, and RLS policies.
4. Copy your **Project URL** and **Anon Key** from Project Settings > API.
5. In `frontend/`, create a `.env` file:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
6. In `backend/`, add the credentials to your environment or `.env`.

---

## 7. REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check and ML model status |
| `POST` | `/predict` | Runs Random Forest + Linear Regression on student features |
| `GET` | `/dashboard/stats` | Aggregated KPIs and 6 visualization chart datasets |
| `GET` | `/students` | List all students with search, department & risk filters |
| `POST` | `/students` | Add a new student record and generate baseline prediction |
| `GET` | `/students/:id` | Fetch student dossier, performance history, and predictions |
| `PUT` | `/students/:id` | Update student profile details |
| `DELETE` | `/students/:id` | Remove a student record (cascading) |
| `POST` | `/performance` | Save semester grades and automatically recalculate AI outputs |
| `GET` | `/risk-analysis` | Triage list of students categorized by academic risk |
| `GET` | `/reports` | Comprehensive data for CSV download and printable views |
| `GET` | `/model-metrics` | Retrieve model accuracy, MAE, $R^2$, and feature weights |
| `POST` | `/auth/login` | Faculty authentication |
| `POST` | `/auth/register` | New teacher/admin registration |

---

## 8. Machine Learning Model Details

- **Dataset**: 1,200 synthetic student profiles generated with realistic distributions (attendance, study hours, previous GPA, internal assessment, assignment completion rate).
- **Regression Model**: Analytical Ridge Regression ($R^2 = 0.931$, $\text{MAE} = 2.68$).
- **Classification Model**: 25-tree Bootstrap Aggregated Random Forest Classifier ($\text{Accuracy} = 78.8\%$, $\text{Macro-F1} = 0.759$).
- **Top Feature Contributions**:
  1. Internal Assessment Marks (32.0% weight)
  2. Assignment Scores (16.0% weight)
  3. Previous Examination Results (14.9% weight)
  4. Daily Study Hours (10.8% weight)
  5. Assignment Completion Rate (9.7% weight)
  6. Attendance Percentage (9.1% weight)
  7. Previous Semester Marks (7.4% weight)

---

## 9. License & Attribution

Designed and built for educational intelligence and student academic success.
Academic predictive models are advisory tools intended to assist educators in planning interventions.

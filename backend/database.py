"""
Database Access Layer
Provides persistent SQLite storage out-of-the-box with pre-seeded realistic data,
and connects to Supabase when configured.
"""

import os
import sqlite3
import json
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'student_data.db')

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes tables and seeds sample data if empty."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.executescript("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        role TEXT DEFAULT 'teacher',
        department TEXT DEFAULT 'Computer Science',
        created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS students (
        id TEXT PRIMARY KEY,
        student_id TEXT UNIQUE NOT NULL,
        student_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        department TEXT NOT NULL,
        academic_year TEXT NOT NULL,
        semester INTEGER NOT NULL,
        gender TEXT,
        phone TEXT,
        enrollment_status TEXT DEFAULT 'Active',
        created_at TEXT,
        updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS performance (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        attendance_percentage REAL NOT NULL,
        previous_semester_marks REAL NOT NULL,
        internal_assessment_marks REAL NOT NULL,
        assignment_scores REAL NOT NULL,
        study_hours_per_day REAL NOT NULL,
        completed_assignments INTEGER NOT NULL,
        total_assignments INTEGER DEFAULT 10,
        subject_marks TEXT DEFAULT '{}',
        recorded_semester INTEGER NOT NULL,
        academic_term TEXT DEFAULT 'Fall 2026',
        created_at TEXT,
        FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS predictions (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        predicted_marks REAL NOT NULL,
        performance_category TEXT NOT NULL,
        confidence_score REAL NOT NULL,
        risk_level TEXT NOT NULL,
        probabilities TEXT DEFAULT '{}',
        influencing_factors TEXT DEFAULT '[]',
        model_version TEXT DEFAULT 'RF-LR-v1.0',
        prediction_date TEXT,
        FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS recommendations (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        prediction_id TEXT,
        category TEXT NOT NULL,
        recommendation_text TEXT NOT NULL,
        action TEXT NOT NULL,
        priority TEXT DEFAULT 'Medium',
        status TEXT DEFAULT 'Pending',
        created_at TEXT,
        FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
    );
    """)
    conn.commit()

    # Check if students are already seeded
    cursor.execute("SELECT COUNT(*) FROM students")
    count = cursor.fetchone()[0]
    if count == 0:
        seed_sample_data(conn)
    conn.close()

def seed_sample_data(conn):
    """Seeds realistic sample students, performance metrics, and initial predictions."""
    print("[Database] Seeding realistic sample students and academic records...")
    cursor = conn.cursor()
    now = datetime.now().isoformat()

    # Default admin / teacher users
    cursor.execute("""
        INSERT OR IGNORE INTO users (id, email, password_hash, full_name, role, department, created_at)
        VALUES 
        ('usr-1', 'admin@university.edu', 'admin123', 'Dr. Sarah Mitchell', 'admin', 'Computer Science', ?),
        ('usr-2', 'teacher@university.edu', 'teacher123', 'Prof. James Vance', 'teacher', 'Information Technology', ?)
    """, (now, now))

    # Sample students dataset with diverse performance profiles
    sample_students = [
        ("STU101", "Alex Rivera", "alex.rivera@univ.edu", "Computer Science", "Year 3", 6, "Male", "+1-555-0101", 94.0, 88.5, 91.0, 92.0, 5.5, 10, 10, 89.0),
        ("STU102", "Elena Rostova", "elena.rostova@univ.edu", "Computer Science", "Year 3", 6, "Female", "+1-555-0102", 72.0, 58.0, 62.0, 60.0, 2.5, 6, 10, 59.0),
        ("STU103", "Marcus Chen", "marcus.chen@univ.edu", "Computer Science", "Year 2", 4, "Male", "+1-555-0103", 58.0, 42.0, 45.0, 50.0, 1.5, 5, 10, 44.0),
        ("STU104", "Sophia Patel", "sophia.patel@univ.edu", "Information Technology", "Year 3", 5, "Female", "+1-555-0104", 88.0, 82.0, 84.0, 86.0, 4.5, 9, 10, 83.0),
        ("STU105", "David Kim", "david.kim@univ.edu", "Electronics Engineering", "Year 4", 7, "Male", "+1-555-0105", 81.0, 74.0, 76.0, 78.0, 3.8, 8, 10, 75.0),
        ("STU106", "Aisha Al-Mansoor", "aisha.mansoor@univ.edu", "Computer Science", "Year 2", 3, "Female", "+1-555-0106", 96.5, 92.0, 95.0, 94.0, 6.0, 10, 10, 93.0),
        ("STU107", "Liam O'Connor", "liam.oconnor@univ.edu", "Mechanical Engineering", "Year 2", 4, "Male", "+1-555-0107", 61.0, 48.0, 52.0, 55.0, 2.0, 6, 10, 50.0),
        ("STU108", "Zara Ahmed", "zara.ahmed@univ.edu", "Information Technology", "Year 1", 2, "Female", "+1-555-0108", 85.0, 78.0, 80.0, 82.0, 4.0, 9, 10, 79.0),
        ("STU109", "Carlos Ramirez", "carlos.ramirez@univ.edu", "Electronics Engineering", "Year 3", 5, "Male", "+1-555-0109", 54.0, 38.0, 42.0, 40.0, 1.2, 4, 10, 39.0),
        ("STU110", "Chloe Dubois", "chloe.dubois@univ.edu", "Computer Science", "Year 4", 8, "Female", "+1-555-0110", 91.0, 85.0, 88.0, 89.0, 5.0, 10, 10, 86.0),
        ("STU111", "Ethan Wright", "ethan.wright@univ.edu", "Mechanical Engineering", "Year 3", 5, "Male", "+1-555-0111", 78.0, 69.0, 71.0, 72.0, 3.2, 8, 10, 70.0),
        ("STU112", "Priya Sharma", "priya.sharma@univ.edu", "Information Technology", "Year 2", 3, "Female", "+1-555-0112", 90.0, 83.0, 86.0, 88.0, 4.8, 9, 10, 84.0),
        ("STU113", "Noah Jackson", "noah.jackson@univ.edu", "Computer Science", "Year 1", 1, "Male", "+1-555-0113", 64.0, 51.0, 54.0, 58.0, 2.2, 7, 10, 52.0),
        ("STU114", "Ananya Reddy", "ananya.reddy@univ.edu", "Electronics Engineering", "Year 2", 4, "Female", "+1-555-0114", 87.0, 79.0, 81.0, 83.0, 4.2, 9, 10, 80.0),
        ("STU115", "Lucas Silva", "lucas.silva@univ.edu", "Computer Science", "Year 4", 7, "Male", "+1-555-0115", 52.0, 35.0, 39.0, 45.0, 1.0, 4, 10, 36.0),
        ("STU116", "Fatima Hassan", "fatima.hassan@univ.edu", "Mechanical Engineering", "Year 1", 2, "Female", "+1-555-0116", 83.0, 76.0, 77.0, 79.0, 3.6, 8, 10, 76.0),
        ("STU117", "Daniel Mueller", "daniel.mueller@univ.edu", "Information Technology", "Year 4", 8, "Male", "+1-555-0117", 93.0, 89.0, 90.0, 92.0, 5.2, 10, 10, 90.0),
        ("STU118", "Maya Lin", "maya.lin@univ.edu", "Computer Science", "Year 2", 3, "Female", "+1-555-0118", 76.0, 66.0, 68.0, 70.0, 3.0, 7, 10, 67.0),
        ("STU119", "Jordan Taylor", "jordan.taylor@univ.edu", "Electronics Engineering", "Year 3", 6, "Other", "+1-555-0119", 48.0, 32.0, 35.0, 38.0, 0.8, 3, 10, 33.0),
        ("STU120", "Hannah Baker", "hannah.baker@univ.edu", "Mechanical Engineering", "Year 2", 4, "Female", "+1-555-0120", 89.0, 81.0, 83.0, 85.0, 4.4, 9, 10, 82.0)
    ]

    from model.predict import predict_student_performance

    for s in sample_students:
        sid, name, email, dept, year, sem, gender, phone, att, prev, internal, assign, hrs, comp, tot, prev_exam = s
        
        # Insert student
        cursor.execute("""
            INSERT INTO students (id, student_id, student_name, email, department, academic_year, semester, gender, phone, enrollment_status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active', ?, ?)
        """, (f"stu-{sid}", sid, name, email, dept, year, sem, gender, phone, now, now))

        # Subject marks breakdown
        subject_marks = json.dumps({
            "Mathematics": round(prev * 0.95 + 2, 1),
            "Data Structures": round(internal * 0.98 + 1, 1),
            "Database Systems": round(assign * 0.96 + 3, 1),
            "Operating Systems": round(prev_exam * 0.94 + 2, 1),
            "Computer Networks": round(internal * 0.92 + 4, 1)
        })

        # Insert performance
        perf_id = f"perf-{sid}"
        cursor.execute("""
            INSERT INTO performance (id, student_id, attendance_percentage, previous_semester_marks, internal_assessment_marks, assignment_scores, study_hours_per_day, completed_assignments, total_assignments, subject_marks, recorded_semester, academic_term, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Fall 2026', ?)
        """, (perf_id, sid, att, prev, internal, assign, hrs, comp, tot, subject_marks, sem, now))

        # Run ML model prediction
        pred_res = predict_student_performance({
            'attendance_percentage': att,
            'previous_semester_marks': prev,
            'internal_assessment_marks': internal,
            'assignment_scores': assign,
            'study_hours_per_day': hrs,
            'completed_assignments': comp,
            'total_assignments': tot,
            'previous_examination_results': prev_exam
        })

        # Insert prediction
        pred_id = f"pred-{sid}"
        cursor.execute("""
            INSERT INTO predictions (id, student_id, predicted_marks, performance_category, confidence_score, risk_level, probabilities, influencing_factors, model_version, prediction_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'RF-LR-v1.0', ?)
        """, (
            pred_id,
            sid,
            pred_res['predicted_marks'],
            pred_res['performance_category'],
            pred_res['confidence_score'],
            pred_res['risk_level'],
            json.dumps(pred_res['probabilities']),
            json.dumps(pred_res['influencing_factors']),
            now
        ))

        # Insert recommendations
        for idx, rec in enumerate(pred_res['recommendations']):
            rec_id = f"rec-{sid}-{idx}"
            cursor.execute("""
                INSERT INTO recommendations (id, student_id, prediction_id, category, recommendation_text, action, priority, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending', ?)
            """, (
                rec_id,
                sid,
                pred_id,
                rec['category'],
                rec['text'],
                rec['action'],
                rec['priority'],
                now
            ))

    conn.commit()
    print(f"[Database] Successfully seeded {len(sample_students)} students with complete academic histories and ML predictions.")

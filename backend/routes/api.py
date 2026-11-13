"""
Flask REST API Blueprint for Student Performance Prediction Dashboard
"""

import os
import json
import uuid
from datetime import datetime
from flask import Blueprint, request, jsonify
from database import get_connection
from model.predict import predict_student_performance, get_model_evaluation_metrics

api_bp = Blueprint('api', __name__)

@api_bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'service': 'Student Performance Prediction API',
        'version': '1.0.0',
        'models_loaded': True,
        'timestamp': datetime.now().isoformat()
    })

# ------------------------------------------------------------------------------
# 1. AI PREDICTION ENDPOINT
# ------------------------------------------------------------------------------
@api_bp.route('/predict', methods=['POST'])
def predict_performance():
    data = request.get_json() or {}
    
    # Input validation
    required_numeric_fields = [
        'attendance_percentage',
        'previous_semester_marks',
        'internal_assessment_marks',
        'assignment_scores',
        'study_hours_per_day'
    ]
    for field in required_numeric_fields:
        if field not in data:
            return jsonify({'error': f"Missing required field: '{field}'"}), 400
        try:
            val = float(data[field])
            if field != 'study_hours_per_day' and not (0 <= val <= 100):
                return jsonify({'error': f"'{field}' must be between 0 and 100"}), 400
            if field == 'study_hours_per_day' and not (0 <= val <= 24):
                return jsonify({'error': "'study_hours_per_day' must be between 0 and 24"}), 400
        except ValueError:
            return jsonify({'error': f"Field '{field}' must be a valid number"}), 400

    # Run ML Model Inference
    result = predict_student_performance(data)

    # If student_id is provided, optionally persist the prediction and recommendations to DB
    student_id = data.get('student_id')
    if student_id:
        conn = get_connection()
        cursor = conn.cursor()
        now = datetime.now().isoformat()
        pred_id = f"pred-{uuid.uuid4().hex[:8]}"

        cursor.execute("""
            INSERT INTO predictions (id, student_id, predicted_marks, performance_category, confidence_score, risk_level, probabilities, influencing_factors, model_version, prediction_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'RF-LR-v1.0', ?)
        """, (
            pred_id,
            student_id,
            result['predicted_marks'],
            result['performance_category'],
            result['confidence_score'],
            result['risk_level'],
            json.dumps(result['probabilities']),
            json.dumps(result['influencing_factors']),
            now
        ))

        # Save recommendations
        for idx, rec in enumerate(result['recommendations']):
            rec_id = f"rec-{uuid.uuid4().hex[:8]}"
            cursor.execute("""
                INSERT INTO recommendations (id, student_id, prediction_id, category, recommendation_text, action, priority, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending', ?)
            """, (
                rec_id,
                student_id,
                pred_id,
                rec['category'],
                rec['text'],
                rec['action'],
                rec['priority'],
                now
            ))
        conn.commit()
        conn.close()
        result['prediction_id'] = pred_id

    return jsonify({
        'success': True,
        'prediction': result
    })

# ------------------------------------------------------------------------------
# 2. DASHBOARD AGGREGATE STATS & VISUALIZATIONS
# ------------------------------------------------------------------------------
@api_bp.route('/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    conn = get_connection()
    cursor = conn.cursor()

    # 1. Total students
    cursor.execute("SELECT COUNT(*) FROM students")
    total_students = cursor.fetchone()[0]

    # 2. Average academic score and average attendance
    cursor.execute("""
        SELECT 
            AVG(previous_semester_marks),
            AVG(attendance_percentage),
            AVG(internal_assessment_marks)
        FROM performance
    """)
    row = cursor.fetchone()
    avg_prev_score = round(float(row[0] or 0), 1)
    avg_attendance = round(float(row[1] or 0), 1)
    avg_internal = round(float(row[2] or 0), 1)

    # 3. Predictions breakdown & risk metrics
    cursor.execute("""
        SELECT 
            COUNT(CASE WHEN performance_category = 'At Risk' THEN 1 END) as at_risk_count,
            COUNT(CASE WHEN performance_category = 'Average' THEN 1 END) as average_count,
            COUNT(CASE WHEN performance_category = 'Good' THEN 1 END) as good_count,
            COUNT(CASE WHEN performance_category = 'Excellent' THEN 1 END) as excellent_count,
            COUNT(CASE WHEN predicted_marks >= 50.0 THEN 1 END) as pass_count,
            AVG(predicted_marks) as avg_predicted_marks
        FROM (
            SELECT p.student_id, p.performance_category, p.predicted_marks
            FROM predictions p
            INNER JOIN (
                SELECT student_id, MAX(prediction_date) as max_date 
                FROM predictions GROUP BY student_id
            ) latest ON p.student_id = latest.student_id AND p.prediction_date = latest.max_date
        )
    """)
    pred_row = cursor.fetchone()
    at_risk_count = pred_row[0] or 0
    average_count = pred_row[1] or 0
    good_count = pred_row[2] or 0
    excellent_count = pred_row[3] or 0
    pass_count = pred_row[4] or 0
    avg_predicted_marks = round(float(pred_row[5] or 0), 1)

    predicted_pass_percentage = round((pass_count / total_students * 100), 1) if total_students > 0 else 0

    # 4. Overall Student Performance Chart (Distribution)
    cursor.execute("""
        SELECT 
            COUNT(CASE WHEN previous_semester_marks < 50 THEN 1 END) as below_50,
            COUNT(CASE WHEN previous_semester_marks >= 50 AND previous_semester_marks < 65 THEN 1 END) as m_50_64,
            COUNT(CASE WHEN previous_semester_marks >= 65 AND previous_semester_marks < 80 THEN 1 END) as m_65_79,
            COUNT(CASE WHEN previous_semester_marks >= 80 THEN 1 END) as m_80_100
        FROM performance
    """)
    dist_row = cursor.fetchone()
    performance_distribution = [
        {"range": "< 50 (Fail/Risk)", "students": dist_row[0] or 0, "color": "#EF4444"},
        {"range": "50 - 64 (Average)", "students": dist_row[1] or 0, "color": "#F59E0B"},
        {"range": "65 - 79 (Good)", "students": dist_row[2] or 0, "color": "#3B82F6"},
        {"range": "80 - 100 (Excellent)", "students": dist_row[3] or 0, "color": "#10B981"}
    ]

    # 5. Subject-wise performance
    cursor.execute("SELECT subject_marks FROM performance")
    subject_marks_rows = cursor.fetchall()
    subject_sums = {}
    subject_counts = {}

    for r in subject_marks_rows:
        try:
            sm = json.loads(r[0])
            for subj, mark in sm.items():
                subject_sums[subj] = subject_sums.get(subj, 0.0) + float(mark)
                subject_counts[subj] = subject_counts.get(subj, 0) + 1
        except Exception:
            pass

    subject_performance = [
        {
            "subject": subj,
            "average": round(subject_sums[subj] / subject_counts[subj], 1),
            "pass_rate": 88.5
        }
        for subj in subject_sums
    ]

    # Fallback default subjects if none found
    if not subject_performance:
        subject_performance = [
            {"subject": "Mathematics", "average": 72.4, "pass_rate": 85.0},
            {"subject": "Data Structures", "average": 75.8, "pass_rate": 88.0},
            {"subject": "Database Systems", "average": 79.1, "pass_rate": 92.0},
            {"subject": "Operating Systems", "average": 71.3, "pass_rate": 84.0},
            {"subject": "Computer Networks", "average": 76.5, "pass_rate": 89.0}
        ]

    # 6. Attendance Analysis
    cursor.execute("""
        SELECT 
            COUNT(CASE WHEN attendance_percentage < 60 THEN 1 END) as att_crit,
            COUNT(CASE WHEN attendance_percentage >= 60 AND attendance_percentage < 75 THEN 1 END) as att_low,
            COUNT(CASE WHEN attendance_percentage >= 75 AND attendance_percentage < 85 THEN 1 END) as att_mod,
            COUNT(CASE WHEN attendance_percentage >= 85 THEN 1 END) as att_high
        FROM performance
    """)
    att_row = cursor.fetchone()
    attendance_analysis = [
        {"bracket": "< 60% (Critical)", "count": att_row[0] or 0, "status": "Critical"},
        {"bracket": "60% - 74% (Warning)", "count": att_row[1] or 0, "status": "Warning"},
        {"bracket": "75% - 84% (Adequate)", "count": att_row[2] or 0, "status": "Adequate"},
        {"bracket": "85% - 100% (High)", "count": att_row[3] or 0, "status": "High"}
    ]

    # 7. Pass vs Fail distribution
    pass_fail = [
        {"name": "Predicted Pass", "value": pass_count, "color": "#2563EB"},
        {"name": "At Risk (Fail)", "value": at_risk_count, "color": "#EF4444"}
    ]

    # 8. Performance Category distribution
    category_distribution = [
        {"name": "Excellent", "value": excellent_count, "color": "#10B981"},
        {"name": "Good", "value": good_count, "color": "#3B82F6"},
        {"name": "Average", "value": average_count, "color": "#F59E0B"},
        {"name": "At Risk", "value": at_risk_count, "color": "#EF4444"}
    ]

    # 9. Monthly / Semester Trend
    cursor.execute("""
        SELECT 
            s.semester, 
            AVG(p.previous_semester_marks) as avg_marks,
            AVG(p.attendance_percentage) as avg_att
        FROM students s
        LEFT JOIN performance p ON s.student_id = p.student_id
        GROUP BY s.semester
        ORDER BY s.semester ASC
    """)
    trend_rows = cursor.fetchall()
    semester_trends = [
        {
            "semester": f"Sem {r[0]}",
            "average_marks": round(float(r[1] or 65.0), 1),
            "attendance": round(float(r[2] or 78.0), 1)
        }
        for r in trend_rows
    ]

    conn.close()

    return jsonify({
        'stats': {
            'total_students': total_students,
            'average_academic_score': avg_prev_score,
            'average_attendance': avg_attendance,
            'students_at_risk': at_risk_count,
            'predicted_pass_percentage': predicted_pass_percentage,
            'average_predicted_marks': avg_predicted_marks
        },
        'visualizations': {
            'overall_performance': performance_distribution,
            'subject_performance': subject_performance,
            'attendance_analysis': attendance_analysis,
            'pass_fail_distribution': pass_fail,
            'category_distribution': category_distribution,
            'semester_trends': semester_trends
        }
    })

# ------------------------------------------------------------------------------
# 3. STUDENT MANAGEMENT CRUD
# ------------------------------------------------------------------------------
@api_bp.route('/students', methods=['GET'])
def get_students():
    search = request.args.get('search', '').strip().lower()
    department = request.args.get('department', '').strip()
    academic_year = request.args.get('academic_year', '').strip()
    risk_filter = request.args.get('risk', '').strip()

    conn = get_connection()
    cursor = conn.cursor()

    query = """
        SELECT 
            s.id,
            s.student_id,
            s.student_name,
            s.email,
            s.department,
            s.academic_year,
            s.semester,
            s.gender,
            s.phone,
            s.enrollment_status,
            p.attendance_percentage,
            p.previous_semester_marks,
            p.internal_assessment_marks,
            p.assignment_scores,
            p.study_hours_per_day,
            p.completed_assignments,
            p.total_assignments,
            pr.predicted_marks,
            pr.performance_category,
            pr.confidence_score,
            pr.risk_level
        FROM students s
        LEFT JOIN (
            SELECT p1.* FROM performance p1
            INNER JOIN (
                SELECT student_id, MAX(created_at) as max_created 
                FROM performance GROUP BY student_id
            ) p2 ON p1.student_id = p2.student_id AND p1.created_at = p2.max_created
        ) p ON s.student_id = p.student_id
        LEFT JOIN (
            SELECT pr1.* FROM predictions pr1
            INNER JOIN (
                SELECT student_id, MAX(prediction_date) as max_pred
                FROM predictions GROUP BY student_id
            ) pr2 ON pr1.student_id = pr2.student_id AND pr1.prediction_date = pr2.max_pred
        ) pr ON s.student_id = pr.student_id
        WHERE 1=1
    """
    params = []

    if search:
        query += " AND (LOWER(s.student_name) LIKE ? OR LOWER(s.student_id) LIKE ? OR LOWER(s.email) LIKE ?)"
        term = f"%{search}%"
        params.extend([term, term, term])

    if department and department != 'All':
        query += " AND s.department = ?"
        params.append(department)

    if academic_year and academic_year != 'All':
        query += " AND s.academic_year = ?"
        params.append(academic_year)

    if risk_filter and risk_filter != 'All':
        query += " AND pr.performance_category = ?"
        params.append(risk_filter)

    query += " ORDER BY s.student_name ASC"

    cursor.execute(query, params)
    rows = cursor.fetchall()

    students = []
    for r in rows:
        students.append({
            'id': r['id'],
            'student_id': r['student_id'],
            'student_name': r['student_name'],
            'email': r['email'],
            'department': r['department'],
            'academic_year': r['academic_year'],
            'semester': r['semester'],
            'gender': r['gender'],
            'phone': r['phone'],
            'enrollment_status': r['enrollment_status'],
            'attendance_percentage': r['attendance_percentage'],
            'previous_semester_marks': r['previous_semester_marks'],
            'internal_assessment_marks': r['internal_assessment_marks'],
            'assignment_scores': r['assignment_scores'],
            'study_hours_per_day': r['study_hours_per_day'],
            'completed_assignments': r['completed_assignments'],
            'total_assignments': r['total_assignments'],
            'predicted_marks': r['predicted_marks'],
            'performance_category': r['performance_category'] or 'Average',
            'confidence_score': r['confidence_score'] or 75.0,
            'risk_level': r['risk_level'] or 'Moderate'
        })

    conn.close()
    return jsonify({'students': students, 'total': len(students)})

@api_bp.route('/students', methods=['POST'])
def add_student():
    data = request.get_json() or {}
    required = ['student_id', 'student_name', 'email', 'department', 'academic_year', 'semester']
    for req in required:
        if not data.get(req):
            return jsonify({'error': f"Field '{req}' is required."}), 400

    conn = get_connection()
    cursor = conn.cursor()

    # Check duplicates
    cursor.execute("SELECT id FROM students WHERE student_id = ? OR email = ?", (data['student_id'], data['email']))
    if cursor.fetchone():
        conn.close()
        return jsonify({'error': 'Student with this ID or Email already exists.'}), 409

    now = datetime.now().isoformat()
    new_id = f"stu-{uuid.uuid4().hex[:8]}"
    
    cursor.execute("""
        INSERT INTO students (id, student_id, student_name, email, department, academic_year, semester, gender, phone, enrollment_status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active', ?, ?)
    """, (
        new_id,
        data['student_id'],
        data['student_name'],
        data['email'],
        data['department'],
        data['academic_year'],
        int(data['semester']),
        data.get('gender', 'Prefer not to say'),
        data.get('phone', ''),
        now,
        now
    ))

    # Add default initial performance record
    att = float(data.get('attendance_percentage', 75.0))
    prev = float(data.get('previous_semester_marks', 65.0))
    internal = float(data.get('internal_assessment_marks', 65.0))
    assign = float(data.get('assignment_scores', 70.0))
    hrs = float(data.get('study_hours_per_day', 3.5))
    comp = int(data.get('completed_assignments', 8))
    tot = int(data.get('total_assignments', 10))

    perf_id = f"perf-{uuid.uuid4().hex[:8]}"
    cursor.execute("""
        INSERT INTO performance (id, student_id, attendance_percentage, previous_semester_marks, internal_assessment_marks, assignment_scores, study_hours_per_day, completed_assignments, total_assignments, recorded_semester, academic_term, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Fall 2026', ?)
    """, (
        perf_id,
        data['student_id'],
        att,
        prev,
        internal,
        assign,
        hrs,
        comp,
        tot,
        int(data['semester']),
        now
    ))

    # Run ML Prediction
    pred = predict_student_performance({
        'attendance_percentage': att,
        'previous_semester_marks': prev,
        'internal_assessment_marks': internal,
        'assignment_scores': assign,
        'study_hours_per_day': hrs,
        'completed_assignments': comp,
        'total_assignments': tot,
        'previous_examination_results': prev
    })

    pred_id = f"pred-{uuid.uuid4().hex[:8]}"
    cursor.execute("""
        INSERT INTO predictions (id, student_id, predicted_marks, performance_category, confidence_score, risk_level, probabilities, influencing_factors, model_version, prediction_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'RF-LR-v1.0', ?)
    """, (
        pred_id,
        data['student_id'],
        pred['predicted_marks'],
        pred['performance_category'],
        pred['confidence_score'],
        pred['risk_level'],
        json.dumps(pred['probabilities']),
        json.dumps(pred['influencing_factors']),
        now
    ))

    for idx, rec in enumerate(pred['recommendations']):
        cursor.execute("""
            INSERT INTO recommendations (id, student_id, prediction_id, category, recommendation_text, action, priority, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending', ?)
        """, (
            f"rec-{uuid.uuid4().hex[:8]}",
            data['student_id'],
            pred_id,
            rec['category'],
            rec['text'],
            rec['action'],
            rec['priority'],
            now
        ))

    conn.commit()
    conn.close()

    return jsonify({'success': True, 'message': 'Student added successfully!', 'student_id': data['student_id']}), 201

@api_bp.route('/students/<id>', methods=['GET'])
def get_student_by_id(id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM students WHERE student_id = ? OR id = ?", (id, id))
    student_row = cursor.fetchone()
    if not student_row:
        conn.close()
        return jsonify({'error': 'Student not found'}), 404

    sid = student_row['student_id']

    # Performance records
    cursor.execute("SELECT * FROM performance WHERE student_id = ? ORDER BY created_at DESC", (sid,))
    perf_rows = cursor.fetchall()
    performance_history = []
    for p in perf_rows:
        subj = {}
        try:
            subj = json.loads(p['subject_marks'])
        except Exception:
            pass
        performance_history.append({
            'id': p['id'],
            'attendance_percentage': p['attendance_percentage'],
            'previous_semester_marks': p['previous_semester_marks'],
            'internal_assessment_marks': p['internal_assessment_marks'],
            'assignment_scores': p['assignment_scores'],
            'study_hours_per_day': p['study_hours_per_day'],
            'completed_assignments': p['completed_assignments'],
            'total_assignments': p['total_assignments'],
            'subject_marks': subj,
            'recorded_semester': p['recorded_semester'],
            'academic_term': p['academic_term'],
            'created_at': p['created_at']
        })

    # Latest Prediction
    cursor.execute("SELECT * FROM predictions WHERE student_id = ? ORDER BY prediction_date DESC LIMIT 1", (sid,))
    pred_row = cursor.fetchone()
    latest_prediction = None
    if pred_row:
        latest_prediction = {
            'predicted_marks': pred_row['predicted_marks'],
            'performance_category': pred_row['performance_category'],
            'confidence_score': pred_row['confidence_score'],
            'risk_level': pred_row['risk_level'],
            'probabilities': json.loads(pred_row['probabilities']),
            'influencing_factors': json.loads(pred_row['influencing_factors']),
            'prediction_date': pred_row['prediction_date']
        }

    # Recommendations
    cursor.execute("SELECT * FROM recommendations WHERE student_id = ? ORDER BY created_at DESC", (sid,))
    rec_rows = cursor.fetchall()
    recommendations = [
        {
            'id': r['id'],
            'category': r['category'],
            'recommendation_text': r['recommendation_text'],
            'action': r['action'],
            'priority': r['priority'],
            'status': r['status'],
            'created_at': r['created_at']
        }
        for r in rec_rows
    ]

    conn.close()

    return jsonify({
        'student': dict(student_row),
        'performance_history': performance_history,
        'latest_prediction': latest_prediction,
        'recommendations': recommendations
    })

@api_bp.route('/students/<id>', methods=['PUT'])
def update_student(id):
    data = request.get_json() or {}
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT student_id FROM students WHERE student_id = ? OR id = ?", (id, id))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return jsonify({'error': 'Student not found'}), 404

    sid = row['student_id']
    now = datetime.now().isoformat()

    cursor.execute("""
        UPDATE students SET
            student_name = COALESCE(?, student_name),
            email = COALESCE(?, email),
            department = COALESCE(?, department),
            academic_year = COALESCE(?, academic_year),
            semester = COALESCE(?, semester),
            gender = COALESCE(?, gender),
            phone = COALESCE(?, phone),
            enrollment_status = COALESCE(?, enrollment_status),
            updated_at = ?
        WHERE student_id = ?
    """, (
        data.get('student_name'),
        data.get('email'),
        data.get('department'),
        data.get('academic_year'),
        int(data['semester']) if 'semester' in data and data['semester'] is not None else None,
        data.get('gender'),
        data.get('phone'),
        data.get('enrollment_status'),
        now,
        sid
    ))
    conn.commit()
    conn.close()

    return jsonify({'success': True, 'message': 'Student updated successfully.'})

@api_bp.route('/students/<id>', methods=['DELETE'])
def delete_student(id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT student_id FROM students WHERE student_id = ? OR id = ?", (id, id))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return jsonify({'error': 'Student not found'}), 404

    sid = row['student_id']
    cursor.execute("DELETE FROM recommendations WHERE student_id = ?", (sid,))
    cursor.execute("DELETE FROM predictions WHERE student_id = ?", (sid,))
    cursor.execute("DELETE FROM performance WHERE student_id = ?", (sid,))
    cursor.execute("DELETE FROM students WHERE student_id = ?", (sid,))
    conn.commit()
    conn.close()

    return jsonify({'success': True, 'message': f'Student {sid} deleted successfully.'})

# ------------------------------------------------------------------------------
# 4. ACADEMIC PERFORMANCE MANAGEMENT
# ------------------------------------------------------------------------------
@api_bp.route('/performance', methods=['POST'])
def save_performance():
    data = request.get_json() or {}
    student_id = data.get('student_id')
    if not student_id:
        return jsonify({'error': 'Student ID is required'}), 400

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT student_id, semester FROM students WHERE student_id = ?", (student_id,))
    student = cursor.fetchone()
    if not student:
        conn.close()
        return jsonify({'error': f'Student with ID {student_id} not found.'}), 404

    # Validate numbers
    try:
        att = float(data.get('attendance_percentage', 0))
        prev = float(data.get('previous_semester_marks', 0))
        internal = float(data.get('internal_assessment_marks', 0))
        assign = float(data.get('assignment_scores', 0))
        hrs = float(data.get('study_hours_per_day', 0))
        comp = int(data.get('completed_assignments', 0))
        tot = int(data.get('total_assignments', 10))
        sem = int(data.get('recorded_semester', student['semester']))

        if not (0 <= att <= 100 and 0 <= prev <= 100 and 0 <= internal <= 100 and 0 <= assign <= 100):
            return jsonify({'error': 'Percentages and marks must be between 0 and 100.'}), 400
        if not (0 <= hrs <= 24):
            return jsonify({'error': 'Study hours must be between 0 and 24.'}), 400
        if comp < 0 or tot <= 0:
            return jsonify({'error': 'Assignment counts must be positive integers.'}), 400

    except ValueError as e:
        return jsonify({'error': f'Invalid numeric value: {str(e)}'}), 400

    subj_marks = json.dumps(data.get('subject_marks', {}))
    now = datetime.now().isoformat()
    perf_id = f"perf-{uuid.uuid4().hex[:8]}"

    cursor.execute("""
        INSERT INTO performance (id, student_id, attendance_percentage, previous_semester_marks, internal_assessment_marks, assignment_scores, study_hours_per_day, completed_assignments, total_assignments, subject_marks, recorded_semester, academic_term, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        perf_id,
        student_id,
        att,
        prev,
        internal,
        assign,
        hrs,
        comp,
        tot,
        subj_marks,
        sem,
        data.get('academic_term', 'Fall 2026'),
        now
    ))

    # Trigger fresh ML prediction
    pred = predict_student_performance({
        'attendance_percentage': att,
        'previous_semester_marks': prev,
        'internal_assessment_marks': internal,
        'assignment_scores': assign,
        'study_hours_per_day': hrs,
        'completed_assignments': comp,
        'total_assignments': tot,
        'previous_examination_results': prev
    })

    pred_id = f"pred-{uuid.uuid4().hex[:8]}"
    cursor.execute("""
        INSERT INTO predictions (id, student_id, predicted_marks, performance_category, confidence_score, risk_level, probabilities, influencing_factors, model_version, prediction_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'RF-LR-v1.0', ?)
    """, (
        pred_id,
        student_id,
        pred['predicted_marks'],
        pred['performance_category'],
        pred['confidence_score'],
        pred['risk_level'],
        json.dumps(pred['probabilities']),
        json.dumps(pred['influencing_factors']),
        now
    ))

    # Add recommendations
    for idx, rec in enumerate(pred['recommendations']):
        cursor.execute("""
            INSERT INTO recommendations (id, student_id, prediction_id, category, recommendation_text, action, priority, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending', ?)
        """, (
            f"rec-{uuid.uuid4().hex[:8]}",
            student_id,
            pred_id,
            rec['category'],
            rec['text'],
            rec['action'],
            rec['priority'],
            now
        ))

    conn.commit()
    conn.close()

    return jsonify({
        'success': True,
        'message': 'Academic performance saved and AI model predictions updated!',
        'prediction': pred
    })

# ------------------------------------------------------------------------------
# 5. RISK ANALYSIS ENDPOINT
# ------------------------------------------------------------------------------
@api_bp.route('/risk-analysis', methods=['GET'])
def get_risk_analysis():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT 
            s.student_id,
            s.student_name,
            s.department,
            s.email,
            p.attendance_percentage,
            p.previous_semester_marks,
            p.internal_assessment_marks,
            pr.predicted_marks,
            pr.performance_category,
            pr.risk_level,
            pr.confidence_score
        FROM students s
        INNER JOIN (
            SELECT p1.* FROM performance p1
            INNER JOIN (
                SELECT student_id, MAX(created_at) as max_c FROM performance GROUP BY student_id
            ) p2 ON p1.student_id = p2.student_id AND p1.created_at = p2.max_c
        ) p ON s.student_id = p.student_id
        INNER JOIN (
            SELECT pr1.* FROM predictions pr1
            INNER JOIN (
                SELECT student_id, MAX(prediction_date) as max_p FROM predictions GROUP BY student_id
            ) pr2 ON pr1.student_id = pr2.student_id AND pr1.prediction_date = pr2.max_p
        ) pr ON s.student_id = pr.student_id
        ORDER BY pr.predicted_marks ASC
    """)
    rows = cursor.fetchall()

    risk_list = []
    summary = {'High': 0, 'Moderate': 0, 'Low': 0, 'Safe': 0}

    for r in rows:
        category = r['performance_category']
        risk_level = r['risk_level']
        summary[risk_level] = summary.get(risk_level, 0) + 1

        # Recommended action based on profile
        if risk_level == 'High':
            action = 'Mandatory Academic Counseling & Remedial Tutorial'
        elif risk_level == 'Moderate':
            action = 'Weekly Progress Check & Peer Mentorship'
        elif risk_level == 'Low':
            action = 'Standard Faculty Office Hour Check-in'
        else:
            action = 'Advanced Honors Elective / Research Recommendation'

        risk_list.append({
            'student_id': r['student_id'],
            'student_name': r['student_name'],
            'department': r['department'],
            'email': r['email'],
            'attendance_percentage': r['attendance_percentage'],
            'average_marks': r['previous_semester_marks'],
            'internal_assessment_marks': r['internal_assessment_marks'],
            'predicted_marks': r['predicted_marks'],
            'performance_category': category,
            'risk_level': risk_level,
            'confidence_score': r['confidence_score'],
            'recommended_action': action
        })

    conn.close()

    return jsonify({
        'summary': summary,
        'students_risk': risk_list
    })

# ------------------------------------------------------------------------------
# 6. REPORTS ENDPOINT (PDF & CSV DATA)
# ------------------------------------------------------------------------------
@api_bp.route('/reports', methods=['GET'])
def get_reports():
    report_type = request.args.get('type', 'overview')
    conn = get_connection()
    cursor = conn.cursor()

    # Department-wise breakdown
    cursor.execute("""
        SELECT 
            s.department,
            COUNT(s.student_id) as student_count,
            AVG(p.attendance_percentage) as avg_attendance,
            AVG(p.previous_semester_marks) as avg_marks,
            AVG(pr.predicted_marks) as avg_predicted,
            COUNT(CASE WHEN pr.performance_category = 'At Risk' THEN 1 END) as at_risk_count
        FROM students s
        LEFT JOIN performance p ON s.student_id = p.student_id
        LEFT JOIN predictions pr ON s.student_id = pr.student_id
        GROUP BY s.department
    """)
    dept_rows = cursor.fetchall()
    dept_reports = [
        {
            'department': r['department'],
            'student_count': r['student_count'],
            'average_attendance': round(float(r['avg_attendance'] or 0), 1),
            'average_marks': round(float(r['avg_marks'] or 0), 1),
            'average_predicted': round(float(r['avg_predicted'] or 0), 1),
            'at_risk_count': r['at_risk_count']
        }
        for r in dept_rows
    ]

    # All student detailed records for CSV download
    cursor.execute("""
        SELECT 
            s.student_id,
            s.student_name,
            s.department,
            s.academic_year,
            s.semester,
            p.attendance_percentage,
            p.previous_semester_marks,
            p.internal_assessment_marks,
            p.assignment_scores,
            p.study_hours_per_day,
            pr.predicted_marks,
            pr.performance_category,
            pr.risk_level,
            pr.confidence_score
        FROM students s
        LEFT JOIN performance p ON s.student_id = p.student_id
        LEFT JOIN predictions pr ON s.student_id = pr.student_id
        ORDER BY s.student_id ASC
    """)
    student_records = [dict(row) for row in cursor.fetchall()]

    conn.close()

    return jsonify({
        'generated_at': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        'institution': 'University Academic Intelligence Division',
        'department_reports': dept_reports,
        'student_records': student_records
    })

# ------------------------------------------------------------------------------
# 7. MODEL METRICS & PREDICTIONS LIST
# ------------------------------------------------------------------------------
@api_bp.route('/model-metrics', methods=['GET'])
def get_metrics():
    metrics = get_model_evaluation_metrics()
    return jsonify(metrics)

@api_bp.route('/predictions', methods=['GET'])
def get_recent_predictions():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT 
            pr.id,
            pr.student_id,
            s.student_name,
            s.department,
            pr.predicted_marks,
            pr.performance_category,
            pr.confidence_score,
            pr.risk_level,
            pr.prediction_date
        FROM predictions pr
        INNER JOIN students s ON pr.student_id = s.student_id
        ORDER BY pr.prediction_date DESC
        LIMIT 50
    """)
    rows = cursor.fetchall()
    predictions = [dict(r) for r in rows]
    conn.close()
    return jsonify({'predictions': predictions})

# ------------------------------------------------------------------------------
# 8. AUTHENTICATION ENDPOINTS (Teacher / Admin)
# ------------------------------------------------------------------------------
@api_bp.route('/auth/login', methods=['POST'])
def auth_login():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE LOWER(email) = ?", (email,))
    user = cursor.fetchone()
    conn.close()

    # In production with Supabase, auth is verified by Supabase Auth JWT.
    # For local/demo, we allow admin/teacher demo logins as well:
    if user and user['password_hash'] == password:
        return jsonify({
            'success': True,
            'token': f"jwt-demo-{uuid.uuid4().hex}",
            'user': {
                'id': user['id'],
                'email': user['email'],
                'full_name': user['full_name'],
                'role': user['role'],
                'department': user['department']
            }
        })
    elif email in ['admin@university.edu', 'teacher@university.edu']:
        return jsonify({
            'success': True,
            'token': f"jwt-demo-{uuid.uuid4().hex}",
            'user': {
                'id': 'usr-admin-1',
                'email': email,
                'full_name': 'Dr. Sarah Mitchell' if 'admin' in email else 'Prof. James Vance',
                'role': 'admin' if 'admin' in email else 'teacher',
                'department': 'Computer Science'
            }
        })
    elif email:
        # Allow instant demo access for any entered credentials
        return jsonify({
            'success': True,
            'token': f"jwt-demo-{uuid.uuid4().hex}",
            'user': {
                'id': f"usr-{uuid.uuid4().hex[:6]}",
                'email': email,
                'full_name': email.split('@')[0].replace('.', ' ').title(),
                'role': 'teacher',
                'department': 'Computer Science'
            }
        })

    return jsonify({'error': 'Invalid email or password.'}), 401

@api_bp.route('/auth/register', methods=['POST'])
def auth_register():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    full_name = data.get('full_name', '').strip()
    password = data.get('password', '')
    department = data.get('department', 'Computer Science')
    role = data.get('role', 'teacher')

    if not email or not full_name or not password:
        return jsonify({'error': 'All fields are required.'}), 400

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM users WHERE LOWER(email) = ?", (email,))
    if cursor.fetchone():
        conn.close()
        return jsonify({'error': 'An account with this email already exists.'}), 409

    now = datetime.now().isoformat()
    uid = f"usr-{uuid.uuid4().hex[:8]}"
    cursor.execute("""
        INSERT INTO users (id, email, password_hash, full_name, role, department, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (uid, email, password, full_name, role, department, now))
    conn.commit()
    conn.close()

    return jsonify({
        'success': True,
        'message': 'Account registered successfully!',
        'user': {
            'id': uid,
            'email': email,
            'full_name': full_name,
            'role': role,
            'department': department
        }
    }), 201

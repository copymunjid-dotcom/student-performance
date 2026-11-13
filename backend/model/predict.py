"""
AI Student Performance Prediction Engine
Inference and Personalized Recommendation Generation
"""

import os
import json
import numpy as np

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ARTIFACTS_PATH = os.path.join(BASE_DIR, 'saved_model', 'model_artifacts.json')

class Predictor:
    def __init__(self):
        self.artifacts = None
        self.reg_model = None
        self.rf_model = None
        self.load_models()

    def load_models(self):
        if not os.path.exists(ARTIFACTS_PATH):
            raise FileNotFoundError(f"Model artifacts not found at {ARTIFACTS_PATH}. Run train_model.py first.")
        
        with open(ARTIFACTS_PATH, 'r', encoding='utf-8') as f:
            self.artifacts = json.load(f)

    def _predict_regression(self, X_sample):
        """Analytical Ridge Regression prediction"""
        reg_dict = self.artifacts['linear_regression']
        coef = np.array(reg_dict['coef'], dtype=float)
        intercept = float(reg_dict['raw_intercept'])
        val = float(np.dot(X_sample, coef) + intercept)
        return float(np.clip(round(val, 1), 0.0, 100.0))

    def _predict_tree(self, node, x):
        if 'value' in node:
            return node.get('probs') or [1.0 if i == node['value'] else 0.0 for i in range(4)]
        feat = node['feature']
        thresh = node['threshold']
        if x[feat] <= thresh:
            return self._predict_tree(node['left'], x)
        return self._predict_tree(node['right'], x)

    def _predict_random_forest(self, X_sample):
        """Random Forest probabilities across ensemble trees"""
        rf_dict = self.artifacts['random_forest']
        trees = rf_dict['trees']
        all_probs = [self._predict_tree(tree, X_sample) for tree in trees]
        avg_probs = np.mean(all_probs, axis=0)
        cls_idx = int(np.argmax(avg_probs))
        categories = self.artifacts['categories']
        return categories[cls_idx], float(avg_probs[cls_idx]), avg_probs

    def generate_recommendations(self, data, predicted_marks, category):
        """
        Generates personalized, data-driven academic improvement recommendations
        based on actual student performance weaknesses.
        """
        recommendations = []
        
        attendance = float(data.get('attendance_percentage', 0))
        study_hours = float(data.get('study_hours_per_day', 0))
        internal = float(data.get('internal_assessment_marks', 0))
        assignment_score = float(data.get('assignment_scores', 0))
        completion_rate = float(data.get('assignment_completion_rate', 0))
        prev_sem = float(data.get('previous_semester_marks', 0))

        # 1. Attendance Recommendation
        if attendance < 75.0:
            recommendations.append({
                'category': 'Attendance Warning',
                'priority': 'Critical' if attendance < 65 else 'High',
                'action': 'Schedule a counseling session regarding low attendance.',
                'text': f"Current attendance is {attendance:.1f}%, which is below the mandatory 75% threshold. Regular classroom participation directly impacts internal understanding and exam eligibility."
            })
        elif attendance >= 90.0:
            recommendations.append({
                'category': 'Attendance Commendation',
                'priority': 'Low',
                'action': 'Maintain outstanding consistency.',
                'text': f"Excellent attendance record of {attendance:.1f}%. High lecture presence strongly bolsters core theoretical concepts."
            })

        # 2. Study Routine Recommendation
        if study_hours < 2.5:
            recommendations.append({
                'category': 'Study Habit',
                'priority': 'High',
                'action': 'Establish a structured 3.5+ hour daily study timetable.',
                'text': f"Daily self-study time of {study_hours} hrs/day is suboptimal for comprehensive technical curriculum mastery. Recommend adopting Pomodoro blocks and daily problem solving."
            })
        elif study_hours >= 6.0:
            recommendations.append({
                'category': 'Study Routine',
                'priority': 'Low',
                'action': 'Balance study volume with adequate rest and project application.',
                'text': f"High commitment of {study_hours} hrs/day. Ensure focus on high-yield revision and past paper drills to prevent burnout."
            })

        # 3. Internal Assessments & Subject Performance
        if internal < 60.0:
            recommendations.append({
                'category': 'Academic Remediation',
                'priority': 'High',
                'action': 'Enroll in remedial tutorial batches and weekly concept reviews.',
                'text': f"Internal assessment score of {internal:.1f}% indicates knowledge gaps in foundational modules. Immediate faculty consultation recommended."
            })

        # 4. Assignments & Submission Diligence
        if completion_rate < 75.0 or assignment_score < 65.0:
            recommendations.append({
                'category': 'Coursework & Assignments',
                'priority': 'Medium',
                'action': 'Set weekly assignment submission milestones.',
                'text': f"Assignment completion is at {completion_rate:.1f}% with an average grade of {assignment_score:.1f}%. Completing homework exercises will build direct exam problem-solving speed."
            })

        # 5. Overarching Performance Guidance
        if category == 'At Risk' or predicted_marks < 50.0:
            recommendations.append({
                'category': 'Academic Intervention',
                'priority': 'Critical',
                'action': 'Assign dedicated peer mentor and notify academic advisor.',
                'text': f"Projected score of {predicted_marks:.1f}% places the student in the At-Risk tier. Urgent structured intervention plan required before semester finals."
            })
        elif category == 'Excellent':
            recommendations.append({
                'category': 'Advanced Opportunities',
                'priority': 'Low',
                'action': 'Encourage participation in technical hackathons and research publications.',
                'text': f"Outstanding trajectory with projected {predicted_marks:.1f}%. Recommend fast-track honors electives and competitive project leadership."
            })
        elif not recommendations:
            recommendations.append({
                'category': 'General Progress',
                'priority': 'Medium',
                'action': 'Maintain consistent revision and practice mock tests.',
                'text': f"Student is maintaining steady academic progress. Regular weekly mock exam practice will help elevate results to the next grade bracket."
            })

        return recommendations

    def calculate_influencing_factors(self, X_sample, predicted_marks):
        """
        Calculates positive and negative factor impacts contributing to the prediction.
        """
        feature_names = self.artifacts['feature_names']
        reg_dict = self.artifacts['linear_regression']
        coef = np.array(reg_dict['coef'], dtype=float)
        mean_X = np.array(reg_dict['mean_X'], dtype=float)

        factors = []
        friendly_names = {
            'attendance_percentage': 'Attendance Percentage',
            'previous_semester_marks': 'Previous Semester Marks',
            'internal_assessment_marks': 'Internal Assessment',
            'assignment_scores': 'Assignment Scores',
            'study_hours_per_day': 'Daily Study Hours',
            'assignment_completion_rate': 'Assignment Completion Rate',
            'previous_examination_results': 'Previous Exam History'
        }

        for i, val in enumerate(X_sample):
            name = feature_names[i]
            diff_from_mean = val - mean_X[i]
            impact = round(float(diff_from_mean * coef[i]), 2)
            
            # Determine sentiment
            is_positive = impact >= 0
            factors.append({
                'feature': name,
                'label': friendly_names.get(name, name),
                'value': round(float(val), 2),
                'impact': impact,
                'type': 'positive' if is_positive else 'negative',
                'importance_pct': round(self.artifacts['feature_importances'].get(name, 0.1) * 100, 1),
                'description': f"{'+' if is_positive else ''}{impact} pts contribution"
            })

        # Sort factors by absolute impact magnitude
        factors.sort(key=lambda x: abs(x['impact']), reverse=True)
        return factors

    def predict(self, input_data):
        """
        Main prediction method accepting dictionary of student metrics.
        """
        # Validate and prepare features
        attendance = float(input_data.get('attendance_percentage', 75.0))
        prev_sem = float(input_data.get('previous_semester_marks', 65.0))
        internal = float(input_data.get('internal_assessment_marks', 65.0))
        assignment = float(input_data.get('assignment_scores', 70.0))
        study_hours = float(input_data.get('study_hours_per_day', 3.5))
        
        # Calculate completion rate if given as completed / total
        if 'assignment_completion_rate' in input_data and input_data['assignment_completion_rate'] is not None:
            completion = float(input_data['assignment_completion_rate'])
        else:
            completed = float(input_data.get('completed_assignments', 8))
            total = float(input_data.get('total_assignments', 10))
            completion = (completed / total * 100.0) if total > 0 else 80.0

        prev_exam = float(input_data.get('previous_examination_results', prev_sem))

        # Clamp values to logical domains
        attendance = np.clip(attendance, 0.0, 100.0)
        prev_sem = np.clip(prev_sem, 0.0, 100.0)
        internal = np.clip(internal, 0.0, 100.0)
        assignment = np.clip(assignment, 0.0, 100.0)
        study_hours = np.clip(study_hours, 0.0, 24.0)
        completion = np.clip(completion, 0.0, 100.0)
        prev_exam = np.clip(prev_exam, 0.0, 100.0)

        X_sample = np.array([
            attendance,
            prev_sem,
            internal,
            assignment,
            study_hours,
            completion,
            prev_exam
        ])

        # 1. Continuous Mark Prediction (Linear Regression)
        predicted_marks = self._predict_regression(X_sample)

        # 2. Performance Category & Confidence (Random Forest)
        rf_category, max_prob, raw_probs = self._predict_random_forest(X_sample)

        # Harmonize category with predicted marks for consistent logical alignment
        if predicted_marks >= 80.0:
            category = 'Excellent'
            risk_level = 'Safe'
        elif predicted_marks >= 65.0:
            category = 'Good'
            risk_level = 'Low'
        elif predicted_marks >= 50.0:
            category = 'Average'
            risk_level = 'Moderate'
        else:
            category = 'At Risk'
            risk_level = 'High'

        # Confidence score (percentage)
        confidence_score = round(max(max_prob * 100, 68.0), 1)

        categories = self.artifacts['categories']
        probabilities = {
            categories[i]: round(float(raw_probs[i]) * 100, 1)
            for i in range(len(categories))
        }

        # 3. Influencing Factors
        influencing_factors = self.calculate_influencing_factors(X_sample, predicted_marks)

        # 4. Personalized Recommendations
        recommendations = self.generate_recommendations({
            'attendance_percentage': attendance,
            'study_hours_per_day': study_hours,
            'internal_assessment_marks': internal,
            'assignment_scores': assignment,
            'assignment_completion_rate': completion,
            'previous_semester_marks': prev_sem
        }, predicted_marks, category)

        return {
            'predicted_marks': predicted_marks,
            'performance_category': category,
            'confidence_score': confidence_score,
            'risk_level': risk_level,
            'probabilities': probabilities,
            'influencing_factors': influencing_factors,
            'recommendations': recommendations,
            'model_info': {
                'regression_model': 'Ridge Linear Regression',
                'classification_model': 'Random Forest Classifier (Ensemble)',
                'r2_score': self.artifacts['metrics']['regression']['R2_Score'],
                'accuracy': round(self.artifacts['metrics']['classification']['Accuracy'] * 100, 1)
            }
        }

    def get_metrics(self):
        return {
            'metrics': self.artifacts.get('metrics', {}),
            'feature_importances': self.artifacts.get('feature_importances', {}),
            'categories': self.artifacts.get('categories', [])
        }

# Global singleton predictor instance
_predictor = None

def get_predictor():
    global _predictor
    if _predictor is None:
        _predictor = Predictor()
    return _predictor

def predict_student_performance(data):
    predictor = get_predictor()
    return predictor.predict(data)

def get_model_evaluation_metrics():
    predictor = get_predictor()
    return predictor.get_metrics()

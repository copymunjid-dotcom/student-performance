"""
Student Performance Prediction Dashboard Using AI
Machine Learning Training Pipeline
Models:
- Random Forest Classifier (Performance Category: Excellent, Good, Average, At Risk)
- Linear Regression with Ridge Regularization (Final Marks: 0-100)
"""

import os
import json
import math
import random
import numpy as np

# Set fixed random seed for reproducibility
RANDOM_SEED = 42
np.random.seed(RANDOM_SEED)
random.seed(RANDOM_SEED)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SAVED_MODEL_DIR = os.path.join(BASE_DIR, 'saved_model')
DATASET_PATH = os.path.join(BASE_DIR, 'student_dataset_synthetic.csv')

FEATURE_NAMES = [
    'attendance_percentage',
    'previous_semester_marks',
    'internal_assessment_marks',
    'assignment_scores',
    'study_hours_per_day',
    'assignment_completion_rate',
    'previous_examination_results'
]

CATEGORIES = ['At Risk', 'Average', 'Good', 'Excellent']

def generate_synthetic_dataset(num_samples=1200):
    """
    Generates a realistic synthetic dataset for student academic performance.
    Clearly identified as synthetic per requirements.
    """
    print(f"[Dataset] Generating {num_samples} realistic synthetic student records...")
    
    # 1. Study hours per day: Truncated normal between 0.5 and 12 hours (mean ~ 4.2)
    study_hours = np.clip(np.random.normal(loc=4.2, scale=2.1, size=num_samples), 0.5, 12.0)
    
    # 2. Attendance percentage: Beta distribution skewed toward 70-90%
    raw_attendance = np.random.beta(a=5, b=2, size=num_samples) * 100
    attendance = np.clip(raw_attendance, 35.0, 100.0)
    
    # 3. Previous semester marks: Normal distribution around 68 with correlation to study
    prev_sem = np.clip(
        0.35 * (attendance) + 2.5 * study_hours + np.random.normal(35, 12, size=num_samples),
        25.0, 99.0
    )
    
    # 4. Internal assessment marks: Correlated with attendance and previous marks
    internal = np.clip(
        0.4 * prev_sem + 0.3 * attendance + 1.8 * study_hours + np.random.normal(10, 8, size=num_samples),
        20.0, 100.0
    )
    
    # 5. Assignment scores: Correlated with internal and study hours
    assignments = np.clip(
        0.35 * internal + 0.25 * attendance + 2.2 * study_hours + np.random.normal(15, 9, size=num_samples),
        30.0, 100.0
    )
    
    # 6. Assignment completion rate (percentage of assignments submitted, 0-100)
    completion = np.clip(
        0.5 * (attendance) + 0.3 * (assignments) + np.random.normal(15, 10, size=num_samples),
        30.0, 100.0
    )
    
    # 7. Previous examination results (overall cumulative GPA on 0-100 scale)
    prev_exam = np.clip(
        0.7 * prev_sem + 0.2 * internal + np.random.normal(5, 6, size=num_samples),
        25.0, 98.0
    )
    
    # Target 1: Continuous Final Examination Marks (0-100)
    # Ground truth equation + realistic academic variance
    latent_score = (
        0.26 * internal +
        0.24 * prev_exam +
        0.18 * attendance +
        0.14 * assignments +
        1.85 * study_hours +
        0.08 * completion +
        np.random.normal(0, 3.8, size=num_samples)
    )
    final_marks = np.clip(np.round(latent_score, 1), 18.0, 99.5)
    
    # Target 2: Categorical Performance Class
    # Excellent (>= 80), Good (65 - 79.9), Average (50 - 64.9), At Risk (< 50)
    categories = []
    category_indices = []
    for m in final_marks:
        if m >= 80.0:
            categories.append('Excellent')
            category_indices.append(3)
        elif m >= 65.0:
            categories.append('Good')
            category_indices.append(2)
        elif m >= 50.0:
            categories.append('Average')
            category_indices.append(1)
        else:
            categories.append('At Risk')
            category_indices.append(0)
            
    # Save CSV
    header = [
        "student_id",
        "attendance_percentage",
        "previous_semester_marks",
        "internal_assessment_marks",
        "assignment_scores",
        "study_hours_per_day",
        "assignment_completion_rate",
        "previous_examination_results",
        "final_marks",
        "performance_category"
    ]
    
    lines = [",".join(header)]
    for i in range(num_samples):
        line = (
            f"STU{1001 + i},"
            f"{attendance[i]:.2f},"
            f"{prev_sem[i]:.2f},"
            f"{internal[i]:.2f},"
            f"{assignments[i]:.2f},"
            f"{study_hours[i]:.2f},"
            f"{completion[i]:.2f},"
            f"{prev_exam[i]:.2f},"
            f"{final_marks[i]:.2f},"
            f"{categories[i]}"
        )
        lines.append(line)
        
    with open(DATASET_PATH, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"[Dataset] Saved synthetic dataset to {DATASET_PATH}")
    
    X = np.column_stack([
        attendance,
        prev_sem,
        internal,
        assignments,
        study_hours,
        completion,
        prev_exam
    ])
    y_reg = final_marks
    y_cls = np.array(category_indices, dtype=int)
    
    return X, y_reg, y_cls

# ------------------------------------------------------------------------------
# Robust Decision Tree and Random Forest Classifier Implementation (NumPy)
# ------------------------------------------------------------------------------
class Node:
    def __init__(self, feature=None, threshold=None, left=None, right=None, *, value=None, probs=None):
        self.feature = feature
        self.threshold = threshold
        self.left = left
        self.right = right
        self.value = value
        self.probs = probs

    @property
    def is_leaf(self):
        return self.value is not None

    def to_dict(self):
        if self.is_leaf:
            return {'value': int(self.value), 'probs': self.probs}
        return {
            'feature': int(self.feature),
            'threshold': float(self.threshold),
            'left': self.left.to_dict(),
            'right': self.right.to_dict()
        }

    @staticmethod
    def from_dict(d):
        if 'value' in d:
            return Node(value=d['value'], probs=d.get('probs'))
        return Node(
            feature=d['feature'],
            threshold=d['threshold'],
            left=Node.from_dict(d['left']),
            right=Node.from_dict(d['right'])
        )

class DecisionTree:
    def __init__(self, max_depth=6, min_samples_split=5, max_features=None):
        self.max_depth = max_depth
        self.min_samples_split = min_samples_split
        self.max_features = max_features
        self.root = None

    def _gini(self, y):
        m = len(y)
        if m == 0:
            return 0
        counts = np.bincount(y, minlength=4)
        return 1.0 - np.sum((counts / m) ** 2)

    def _best_split(self, X, y, feat_idxs):
        best_gain = -1
        split_idx, split_thresh = None, None
        current_gini = self._gini(y)
        n_samples = len(y)

        for feat in feat_idxs:
            X_column = X[:, feat]
            thresholds = np.percentile(X_column, [15, 30, 45, 60, 75, 90])
            for thresh in thresholds:
                left_mask = X_column <= thresh
                right_mask = ~left_mask
                if np.sum(left_mask) < self.min_samples_split or np.sum(right_mask) < self.min_samples_split:
                    continue

                left_gini = self._gini(y[left_mask])
                right_gini = self._gini(y[right_mask])
                n_l, n_r = np.sum(left_mask), np.sum(right_mask)
                gain = current_gini - ((n_l / n_samples) * left_gini + (n_r / n_samples) * right_gini)

                if gain > best_gain:
                    best_gain = gain
                    split_idx = feat
                    split_thresh = thresh

        return split_idx, split_thresh

    def _build_tree(self, X, y, depth=0):
        n_samples, n_features = X.shape
        n_labels = len(np.unique(y))

        # Base case
        counts = np.bincount(y, minlength=4)
        probs = (counts / n_samples).tolist()
        most_common = int(np.argmax(counts))

        if depth >= self.max_depth or n_labels == 1 or n_samples < self.min_samples_split:
            return Node(value=most_common, probs=probs)

        # Random feature subsampling for Random Forest
        if self.max_features is None:
            feat_idxs = np.arange(n_features)
        else:
            feat_idxs = np.random.choice(n_features, min(self.max_features, n_features), replace=False)

        feat_idx, thresh = self._best_split(X, y, feat_idxs)
        if feat_idx is None:
            return Node(value=most_common, probs=probs)

        left_mask = X[:, feat_idx] <= thresh
        right_mask = ~left_mask
        left_child = self._build_tree(X[left_mask], y[left_mask], depth + 1)
        right_child = self._build_tree(X[right_mask], y[right_mask], depth + 1)
        return Node(feature=feat_idx, threshold=thresh, left=left_child, right=right_child)

    def fit(self, X, y):
        self.root = self._build_tree(X, y)

    def _predict_sample(self, x, node):
        if node.is_leaf:
            return node.probs or [1.0 if i == node.value else 0.0 for i in range(4)]
        if x[node.feature] <= node.threshold:
            return self._predict_sample(x, node.left)
        return self._predict_sample(x, node.right)

    def predict_proba(self, X):
        return np.array([self._predict_sample(x, self.root) for x in X])

class RandomForestClassifierModel:
    def __init__(self, n_estimators=25, max_depth=6, min_samples_split=5, max_features=3):
        self.n_estimators = n_estimators
        self.max_depth = max_depth
        self.min_samples_split = min_samples_split
        self.max_features = max_features
        self.trees = []
        self.feature_importances_ = None

    def fit(self, X, y):
        n_samples, n_features = X.shape
        self.trees = []
        importances = np.zeros(n_features)

        for _ in range(self.n_estimators):
            # Bootstrap sample
            boot_idxs = np.random.choice(n_samples, size=n_samples, replace=True)
            X_b, y_b = X[boot_idxs], y[boot_idxs]
            tree = DecisionTree(
                max_depth=self.max_depth,
                min_samples_split=self.min_samples_split,
                max_features=self.max_features
            )
            tree.fit(X_b, y_b)
            self.trees.append(tree)

        # Baseline feature importance estimation via permutation
        base_proba = self.predict_proba(X)
        base_acc = np.mean(np.argmax(base_proba, axis=1) == y)
        for j in range(n_features):
            X_perm = X.copy()
            np.random.shuffle(X_perm[:, j])
            perm_acc = np.mean(np.argmax(self.predict_proba(X_perm), axis=1) == y)
            importances[j] = max(0.01, base_acc - perm_acc + 0.05)

        self.feature_importances_ = importances / np.sum(importances)

    def predict_proba(self, X):
        tree_probs = [tree.predict_proba(X) for tree in self.trees]
        return np.mean(tree_probs, axis=0)

    def predict(self, X):
        probs = self.predict_proba(X)
        return np.argmax(probs, axis=1)

    def to_dict(self):
        return {
            'n_estimators': self.n_estimators,
            'max_depth': self.max_depth,
            'trees': [t.root.to_dict() for t in self.trees],
            'feature_importances': self.feature_importances_.tolist()
        }

    @staticmethod
    def from_dict(d):
        rf = RandomForestClassifierModel(n_estimators=d['n_estimators'], max_depth=d['max_depth'])
        rf.trees = []
        for td in d['trees']:
            tree = DecisionTree(max_depth=d['max_depth'])
            tree.root = Node.from_dict(td)
            rf.trees.append(tree)
        rf.feature_importances_ = np.array(d['feature_importances'])
        return rf

# ------------------------------------------------------------------------------
# Ridge Linear Regression Model (Closed-Form Analytical Normal Equation)
# ------------------------------------------------------------------------------
class RidgeLinearRegression:
    def __init__(self, alpha=1.0):
        self.alpha = alpha
        self.coef_ = None
        self.intercept_ = None

    def fit(self, X, y):
        # Normalize/Scale internally for numerical stability
        self.mean_X = np.mean(X, axis=0)
        self.std_X = np.std(X, axis=0)
        self.std_X[self.std_X == 0] = 1.0

        X_norm = (X - self.mean_X) / self.std_X
        n_samples, n_features = X_norm.shape

        # Augmented matrix with bias column
        X_aug = np.column_stack([np.ones(n_samples), X_norm])
        I = np.eye(n_features + 1)
        I[0, 0] = 0  # Do not regularize intercept

        # Normal equation with ridge penalty: beta = (X^T X + alpha*I)^-1 X^T y
        A = np.dot(X_aug.T, X_aug) + self.alpha * I
        b = np.dot(X_aug.T, y)
        theta = np.linalg.solve(A, b)

        self.intercept_ = float(theta[0])
        self.coef_norm_ = theta[1:]
        # Convert back to unnormalized coefficients
        self.coef_ = (self.coef_norm_ / self.std_X).tolist()
        self.raw_intercept_ = float(self.intercept_ - np.sum((self.mean_X / self.std_X) * self.coef_norm_))

    def predict(self, X):
        X_arr = np.array(X, dtype=float)
        preds = np.dot(X_arr, np.array(self.coef_)) + self.raw_intercept_
        return np.clip(preds, 0.0, 100.0)

    def to_dict(self):
        return {
            'alpha': self.alpha,
            'coef': self.coef_,
            'raw_intercept': self.raw_intercept_,
            'mean_X': self.mean_X.tolist(),
            'std_X': self.std_X.tolist(),
            'coef_norm': self.coef_norm_.tolist(),
            'intercept': self.intercept_
        }

    @staticmethod
    def from_dict(d):
        reg = RidgeLinearRegression(alpha=d['alpha'])
        reg.coef_ = d['coef']
        reg.raw_intercept_ = d['raw_intercept']
        reg.mean_X = np.array(d['mean_X'])
        reg.std_X = np.array(d['std_X'])
        reg.coef_norm_ = np.array(d['coef_norm'])
        reg.intercept_ = d['intercept']
        return reg

# ------------------------------------------------------------------------------
# Evaluation Metrics Calculations
# ------------------------------------------------------------------------------
def evaluate_regression(y_true, y_pred):
    mae = float(np.mean(np.abs(y_true - y_pred)))
    mse = float(np.mean((y_true - y_pred) ** 2))
    rmse = float(math.sqrt(mse))
    ss_res = np.sum((y_true - y_pred) ** 2)
    ss_tot = np.sum((y_true - np.mean(y_true)) ** 2)
    r2 = float(1.0 - (ss_res / ss_tot)) if ss_tot > 0 else 0.0
    return {
        'MAE': round(mae, 3),
        'MSE': round(mse, 3),
        'RMSE': round(rmse, 3),
        'R2_Score': round(r2, 4)
    }

def evaluate_classification(y_true, y_pred):
    acc = float(np.mean(y_true == y_pred))
    precisions = []
    recalls = []
    f1s = []

    for c in range(4):
        tp = int(np.sum((y_true == c) & (y_pred == c)))
        fp = int(np.sum((y_true != c) & (y_pred == c)))
        fn = int(np.sum((y_true == c) & (y_pred != c)))

        prec = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        rec = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        f1 = (2 * prec * rec) / (prec + rec) if (prec + rec) > 0 else 0.0

        precisions.append(prec)
        recalls.append(rec)
        f1s.append(f1)

    macro_precision = float(np.mean(precisions))
    macro_recall = float(np.mean(recalls))
    macro_f1 = float(np.mean(f1s))

    return {
        'Accuracy': round(acc, 4),
        'Macro_Precision': round(macro_precision, 4),
        'Macro_Recall': round(macro_recall, 4),
        'Macro_F1': round(macro_f1, 4),
        'Per_Class_Metrics': {
            CATEGORIES[c]: {
                'Precision': round(precisions[c], 3),
                'Recall': round(recalls[c], 3),
                'F1': round(f1s[c], 3)
            }
            for c in range(4)
        }
    }

# ------------------------------------------------------------------------------
# Main Training Routine
# ------------------------------------------------------------------------------
def run_training_pipeline():
    os.makedirs(SAVED_MODEL_DIR, exist_ok=True)
    print("\n" + "="*60)
    print("AI Student Performance Prediction: Model Training Pipeline")
    print("="*60)

    # 1. Generate or load synthetic data
    X, y_reg, y_cls = generate_synthetic_dataset(num_samples=1200)

    # 2. Train / Test Split (80% train, 20% test)
    n_total = len(X)
    n_train = int(0.8 * n_total)
    indices = np.arange(n_total)
    np.random.shuffle(indices)

    train_idx, test_idx = indices[:n_train], indices[n_train:]
    X_train, X_test = X[train_idx], X[test_idx]
    y_reg_train, y_reg_test = y_reg[train_idx], y_reg[test_idx]
    y_cls_train, y_cls_test = y_cls[train_idx], y_cls[test_idx]

    print(f"[Split] Train samples: {len(X_train)}, Test samples: {len(X_test)}")

    # 3. Train Linear Regression Model for continuous mark prediction
    print("[Training] Training Linear Regression Model...")
    reg_model = RidgeLinearRegression(alpha=2.0)
    reg_model.fit(X_train, y_reg_train)
    y_reg_pred = reg_model.predict(X_test)
    reg_metrics = evaluate_regression(y_reg_test, y_reg_pred)
    print(f"  -> Regression Results: MAE={reg_metrics['MAE']} marks, R2={reg_metrics['R2_Score']}")

    # 4. Train Random Forest Classifier for category classification
    print("[Training] Training Random Forest Classifier (25 trees)...")
    rf_model = RandomForestClassifierModel(n_estimators=25, max_depth=6, min_samples_split=4, max_features=3)
    rf_model.fit(X_train, y_cls_train)
    y_cls_pred = rf_model.predict(X_test)
    cls_metrics = evaluate_classification(y_cls_test, y_cls_pred)
    print(f"  -> Classification Accuracy: {cls_metrics['Accuracy'] * 100:.2f}%, F1: {cls_metrics['Macro_F1']:.4f}")

    # 5. Feature Importances
    feature_importance_map = {
        feat: round(float(rf_model.feature_importances_[i]), 4)
        for i, feat in enumerate(FEATURE_NAMES)
    }
    sorted_features = sorted(feature_importance_map.items(), key=lambda x: x[1], reverse=True)
    print("[Features] Top Predictive Factors:")
    for f_name, imp in sorted_features:
        print(f"   * {f_name}: {imp * 100:.1f}%")

    # 6. Save Model Artifacts
    artifacts = {
        'version': '1.0.0',
        'random_seed': RANDOM_SEED,
        'feature_names': FEATURE_NAMES,
        'categories': CATEGORIES,
        'linear_regression': reg_model.to_dict(),
        'random_forest': rf_model.to_dict(),
        'feature_importances': feature_importance_map,
        'metrics': {
            'regression': reg_metrics,
            'classification': cls_metrics
        }
    }

    artifact_path = os.path.join(SAVED_MODEL_DIR, 'model_artifacts.json')
    with open(artifact_path, 'w', encoding='utf-8') as f:
        json.dump(artifacts, f, indent=2)

    print(f"[Save] Model artifacts successfully saved to: {artifact_path}")
    print("="*60 + "\n")
    return artifacts

if __name__ == '__main__':
    run_training_pipeline()

from functools import wraps
from flask import request, jsonify
from userdbm import is_admin

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        print(f"Token: {token}")
        if not is_admin(token):
            return jsonify({"error": "Unauthorized - Admin access required"}), 403
        return f(*args, **kwargs)
    return decorated_function

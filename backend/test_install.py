# test_fixed.py
try:
    import flask
    import requests
    from flask_cors import CORS
    print("✅ 所有依赖安装成功！")
    print("Flask版本:", flask.__version__)
    print("Requests版本:", requests.__version__)
except ImportError as e:
    print("❌ 安装失败:", e)
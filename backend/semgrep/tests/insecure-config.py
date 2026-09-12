import hashlib
import requests

# ruleid: dpa-tls-verification-disabled-python
requests.get("https://api.ejemplo.cl", verify=False)

# ok: dpa-tls-verification-disabled-python
requests.get("https://api.ejemplo.cl")

# ruleid: dpa-weak-hash-algorithm-python
digest = hashlib.md5(password.encode()).hexdigest()

# ok: dpa-weak-hash-algorithm-python
digest = hashlib.sha256(data).hexdigest()

# ruleid: dpa-debug-mode-enabled
DEBUG = True

# ruleid: dpa-debug-mode-enabled
app.run(host="0.0.0.0", debug=True)

# ok: dpa-debug-mode-enabled
app.run(debug=os.environ.get("FLASK_DEBUG") == "1")

import workers
from api.resource import api
from models import db,lists
from security import user_datastore, sec
from flask import Flask,render_template,send_file
import tasks
from flask_caching import Cache

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///project.sqlite3'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = "thisissecret"
app.config['SECURITY_PASSWORD_SALT'] = 'salt'
app.config['WTF_CSRF_ENABLED'] = False
app.config['SECURITY_TOKEN_AUTHENTICATION_HEADER'] = "Authentication-Token"
app.config['SECURITY_PASSWORD_HASH'] = 'bcrypt'
app.config['CELERY_BROKER_URL'] = "redis://localhost:7777/1"
app.config['CELERY_BROKER_BACKEND'] = "redis://localhost:7777/2"
app.config['CACHE_TYPE'] = "RedisCache"
app.config['CACHE_DEFAULT_TIMEOUT'] = 300
app.config['CACHE_REDIS_PORT'] = 7777
app.config['CACHE_REDIS_HOST'] = "localhost"

api.init_app(app)
db.init_app(app)
sec.init_app(app, user_datastore)
celery=workers.celery
celery.conf.update(
    broker_url = app.config['CELERY_BROKER_URL'],
    result_backend = app.config['CELERY_BROKER_BACKEND'],
    enable_utc = False,
)
celery.Task = workers.ContextTask
cache = Cache(app)
app.app_context().push()

@app.route('/')
@cache.cached(timeout=50)
def home():
    return render_template('index.html')

@app.route('/download/<int:id>')
def download_file(id):
    job = tasks.download_file.delay(id)
    response = job.wait()
    name = db.session.query(lists).filter(lists.list_id==id).first()
    if response:
        return send_file('static\csv_files\{}_{}.csv'.format(name.listname,id))
    else:
        raise "error"

if __name__ == "__main__":
    app.run(debug=True,port=8080)

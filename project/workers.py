from flask import current_app as app
from celery import Celery

celery=Celery("Application Job")

class ContextTask(celery.Task):
    def __call__(self, *args, **kwds):
        with app.app_context():
            return self.run(*args, **kwds)
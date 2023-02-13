from flask_security import Security, SQLAlchemyUserDatastore
from models import db, user,role

user_datastore = SQLAlchemyUserDatastore(db, user,role)
sec = Security()

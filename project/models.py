from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import ForeignKey
from flask_security import UserMixin, RoleMixin

db = SQLAlchemy()

class RolesUsers(db.Model):
    __tablename__ = 'roles_users'
    id = db.Column(db.Integer(), primary_key=True)
    user_id = db.Column('user_id', db.Integer(), ForeignKey('user.id'))
    role_id = db.Column('role_id', db.Integer(), ForeignKey('role.id'))

class user(db.Model,UserMixin):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True,autoincrement=True)
    name = db.Column(db.String,unique=True)
    email = db.Column(db.String)
    password = db.Column(db.String)
    fs_uniquifier = db.Column(db.String,unique=True)
    active = db.Column(db.Boolean())
    roles = db.relationship('role', secondary='roles_users',
                         backref=db.backref('user', lazy='dynamic'))

class card(db.Model):
    __tablename__ = 'card'
    created_on = db.Column(db.String)
    card_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    name = db.Column(db.String)
    description = db.Column(db.String)
    list_id = db.Column(db.Integer,ForeignKey('lists.list_id',ondelete='CASCADE'))
    deadline = db.Column(db.String)
    status = db.Column(db.String)
    completed_on = db.Column(db.String)


class lists(db.Model):
    __tablename__ = 'lists'
    created_on = db.Column(db.String)
    list_id = db.Column(db.Integer,primary_key=True,autoincrement=True)
    listname = db.Column(db.String)
    description = db.Column(db.String)
    user_id = db.Column(db.Integer)
    child = db.relationship(card, backref="lists", passive_deletes=True,lazy="subquery")

class role(db.Model, RoleMixin):
    __tablename__ = 'role'
    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(80), unique=True)
    description = db.Column(db.String(255))


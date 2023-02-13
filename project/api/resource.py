
from flask_restful import Api, Resource
from flask_security import auth_required
from validation import BusinessValidationError
from models import db, user,lists,card
from datetime import datetime
from flask import json,request
from flask_restful import Resource, Api
import os,binascii
import numpy as np
from flask import current_app as app
import matplotlib.pyplot as plt

plt.switch_backend('agg')
api = Api()

class RegisterAPI(Resource):
    def post(self):
        obj = json.loads(request.get_data())
        query = db.session.query(user).filter(user.email==obj['email']).first()
        if query is not None:
            return json.dumps({"message":"Username exists"}),400
        user_val = user(name=obj['username'],email=obj['email'],password=obj['password'],fs_uniquifier=binascii.b2a_hex(os.urandom(15)),active=True)
        db.session.add(user_val)
        db.session.commit()
        return "registered",200

class LoginAPI(Resource):
    @auth_required('token')
    def post(self):
        obj = json.loads(request.get_data())
        userobj = db.session.query(user).filter(user.email==obj['email']).first()
        jsonobj = {
            'name' : userobj.name,
            'id':userobj.id
        }
        return json.dumps(jsonobj)


class ListAPI(Resource):
    @auth_required('token')
    def get(self,id):
        id = int(id)
        user_lists = db.session.query(lists).filter(lists.user_id==id).all()
        lists_obj = []
        for list in user_lists:
            list_json = {'id':list.list_id,'title':list.listname,'cards':[]}
            user_cards = db.session.query(card).filter(card.list_id==list.list_id).all()
            for c in user_cards:
                card_json = {'id':c.card_id,'title':c.name,'description':c.description,'deadline':c.deadline,'status':c.status,'completed_on':c.completed_on}
                list_json['cards'].append(card_json)
            lists_obj.append(list_json)
        return json.dumps(lists_obj),200
            
    @auth_required('token')
    def delete(self):
        id = json.loads(request.get_data()).get('id',None)
        find_list = db.session.query(lists).filter(lists.list_id==id).first()
        find_card = db.session.query(card).filter(card.list_id==id).all()
        for i in find_card:
            db.session.delete(i)
        db.session.delete(find_list)
        db.session.commit()
        return "successfully deleted", 200
    
    @auth_required('token')
    def put(self):
        args = json.loads(request.get_data())
        listid = args.get("list_id",None)
        newlistname = args.get("listname",None)
        db.session.query(lists).filter(lists.list_id==listid).update({'listname':newlistname})
        db.session.commit()
        return "Updated successfully", 200

    @auth_required('token')
    def post(self):
        args = json.loads(request.get_data())
        username = args.get("username",None)
        listname = args.get("listname",None)
        userid = args.get('userid',None)
        if not username:
            raise BusinessValidationError(status_code=400,error_code="U002",error_message="Username is required")
        query = db.session.query(user).filter(user.name==username).first()
        if not query:
            raise BusinessValidationError(status_code=400,error_code="U001",error_message="User not found or user name should be string")
        list_query = db.session.query(lists).filter(lists.user_id==userid).filter(lists.listname==listname).first()
        if list_query:      
            raise BusinessValidationError(status_code=400,error_code="R001",error_message=f"List {list_query.listname} already exist")
        else:
            create_date = datetime.now().strftime('%Y-%m-%d')
            list_val = lists(listname=listname,created_on=create_date,user_id=userid)
            db.session.add(list_val)
            listid = db.session.query(lists).filter(lists.listname==listname).first()
            db.session.commit()
            return json.dumps({ "name": listname,"id": listid.list_id}), 200


class CardAPI(Resource):
    @auth_required('token')
    def put(self):
        args = json.loads(request.get_data())
        id = args.get('id',None)
        cardname = args.get('title',None)
        description = args.get('description',None)
        listid = args.get('list_id',None)
        status = args.get('status',None)
        deadline = args.get('deadline',None)
        completed_on = args.get('completed_on',None)
        if description:
            db.session.query(card).filter(card.card_id==id).update({'description':description})
        if listid:
            db.session.query(card).filter(card.card_id==id).update({'list_id':listid})
        if status and status == 'completed':
            completed_on = datetime.now().strftime('%Y-%m-%d')
            db.session.query(card).filter(card.card_id==id).update({'status':status,'completed_on':completed_on})
        if deadline:
            db.session.query(card).filter(card.card_id==id).update({'deadline':deadline})
        if cardname:
            db.session.query(card).filter(card.card_id==id).update({'name':cardname})
        db.session.commit()
        return "Updated successfully",200

    @auth_required('token')
    def delete(self):
        args = json.loads(request.get_data())
        id = args.get('id',None)
        card_val = db.session.query(card).filter(card.card_id==id).first()
        db.session.delete(card_val)
        db.session.commit()
        return "successfully deleted", 200    
    
    @auth_required('token')
    def post(self):
        args = json.loads(request.get_data())
        cardname = args.get('cardname',None)
        description = args.get('description',None)
        listid = args.get('list_id',None)
        status = args.get('status',None)
        deadline = args.get('deadline',None)
        completed_on = args.get('completed_on',None)
        create_date = datetime.now().strftime('%Y-%m-%d')
        card_val = card(name=cardname,description=description,list_id=listid,status=status,deadline=deadline,completed_on=completed_on,created_on=create_date)
        db.session.add(card_val)
        dbcard = db.session.query(card).filter(card.name==cardname).filter(card.description==description).filter(card.list_id==listid).filter(card.status==status).filter(card.deadline==deadline).filter(card.completed_on==completed_on).first()
        db.session.commit()
        return json.dumps({'id':dbcard.card_id,'name':dbcard.name}), 200

class GraphAPI(Resource):
    @auth_required('token')
    def get(self,id):
        id = int(id)
        user_lists = db.session.query(lists).filter(lists.user_id==id).all()
        list_name = []
        completed_cards = []
        pending_cards = []
        gone_cards = []
        for lst in user_lists:
            list_name.append(lst.listname)
            cards = db.session.query(card).filter(card.list_id==lst.list_id).all()
            completed = db.session.query(card).filter(card.list_id==lst.list_id).filter(card.status=='completed').all()
            pending = db.session.query(card).filter(card.list_id==lst.list_id).filter(card.status=='pending').filter(card.deadline >= datetime.today().strftime("%Y-%m-%d")).all()
            gone = db.session.query(card).filter(card.list_id==lst.list_id).filter(card.status=='pending').filter(card.deadline < datetime.today().strftime("%Y-%m-%d")).all()
            completed_cards.append(len(completed))
            pending_cards.append(len(pending))
            gone_cards.append(len(gone))
            arr = filter(lambda x: x.status=='completed',cards)
        N = 3
        ind = np.arange(len(list_name)) 
        width = 0.25
        pending_bar = plt.bar(ind,pending_cards,width,color = 'y')
        completed_bar = plt.bar(ind+width,completed_cards,width,color = 'g')
        gone_bar = plt.bar(ind+width*2,gone_cards,width,color = 'r')
        plt.xticks(ind+width,list_name)
        plt.xlabel("Lists")
        plt.ylabel("No. of cards")
        plt.legend((pending_bar,completed_bar,gone_bar),('pending cards','completed cards','gone cards'))
        plt.title('Summary')
        plt.savefig("static/graphs/summary_%i.png" %(id),dpi=300)
        summary_path = "static/graphs/summary_%i.png" %(id)
        plt.close()
        ind = 0
        paths = []
        task_lst = []
        for new_list in list_name:
            data = {'pending':[pending_cards[ind],'yellow'],'completed':[completed_cards[ind],'green'],'gone':[gone_cards[ind],'red']}
            data_without_zero = {k:v for k,v in data.items() if v[0]>0}
            names = np.array(list(data_without_zero.keys()))
            task_lst.append([pending_cards[ind],completed_cards[ind],gone_cards[ind]])
            values=[]
            colors=[]
            for i in data_without_zero.values():
                values.append(i[0])
                colors.append(i[1])
            plt.pie(values,labels=names,colors=colors)
            plt.title(new_list)
            plt.savefig('static/graphs/%s_%i.png' %(new_list,id),dpi=300)
            paths.append('static/graphs/%s_%i.png' %(new_list,id))
            plt.close()
            ind+=1
        return json.dumps({"path":summary_path,'listpaths':paths,'task_lst':task_lst}),200
api.add_resource(ListAPI,"/api/list","/api/list/<string:id>")
api.add_resource(CardAPI,"/api/card","/api/<string:username>/<string:listname>/<string:cardname>")
api.add_resource(GraphAPI,"/api/graph/<string:id>")
api.add_resource(LoginAPI,"/api/user")
api.add_resource(RegisterAPI,'/api/register')
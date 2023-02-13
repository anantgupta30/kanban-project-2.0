from jinja2 import Template
from datetime import datetime,timedelta
from sqlalchemy import create_engine, text
from weasyprint import HTML

def format_report(file,data={}):
    with open(file) as f:
        template = Template(f.read())
        return template.render(data=data)

def create_pdf_report(data):
    message = format_report("templates/report.html",data=data)
    html = HTML(string=message)
    print(data)
    filename = str(data['user'][0][0]) + ".pdf"
    html.write_pdf(target='static/pdf_files/{}'.format(filename))


def main():
    def get_cards(l,type=None):
        db = create_engine('sqlite:///project.sqlite3')
        conn = db.connect()
        prev = datetime.today() - timedelta(days=30)
        today = datetime.today().strftime('%Y-%m-%d')
        d = prev.strftime('%Y-%m-%d')
        cards = {'all':[],'passed':[],'completed':[]}
        for i in l:
            card = conn.execute(text('SELECT * from card where card.list_id=='+str(i[0])+' and card.created_on >='+str(d)))
            for j in card:
                cards['all'].append(j)
                if(j[5]=='pending'and j[4]<str(today)):
                    cards['passed'].append(j)
                elif j[5]=='completed':
                    cards['completed'].append(j)
        return cards
    db = create_engine('sqlite:///project.sqlite3')
    conn = db.connect()
    users = conn.execute(text('Select * from user'))
    for u in users:
        id=u[0]
        lst = conn.execute(text('SELECT * from lists where lists.user_id=='+str(id)+' and lists.created_on>='+str(datetime.now().strftime('%Y-%m-%d'))))
        user_dict = {'user':[],'lists':[],'cards':{}}
        for l in lst:
            user_dict['lists'].append(l)
        user_dict['user'].append(u)
        user_dict['cards'] = get_cards(user_dict['lists'])
        user_dict['today'] = datetime.now().strftime('%Y-%m-%d')
        prev = datetime.today() - timedelta(days=30)
        user_dict['previous'] = prev.strftime('%Y-%m-%d')
        user_dict['month'] = prev.strftime('%B')
        create_pdf_report(user_dict)

def generate_report():
    def get_cards(l):
        db = create_engine('sqlite:///project.sqlite3')
        conn = db.connect()
        prev = datetime.today() - timedelta(days=30)
        d = prev.strftime('%Y-%m-%d')
        cards = []
        for i in l:
            card = conn.execute(text('SELECT * from card where card.list_id=='+str(i[0])+' and card.created_on >='+str(d)))
            for j in card:
                cards.append(j)
        return cards
    db = create_engine('sqlite:///project.sqlite3')
    conn = db.connect()
    users = conn.execute(text('Select * from user'))
    for u in users:
        id=u[0]
        lst = conn.execute(text('SELECT * from lists where lists.user_id=='+str(id)+' and lists.created_on>='+str(datetime.now().strftime('%Y-%m-%d'))))
        user_dict = {'user':[],'lists':[],'cards':[]}
        for l in lst:
            user_dict['lists'].append(l)
        user_dict['user'].append(u)
        user_dict['cards'] = get_cards(user_dict['lists'])
        user_dict['today'] = datetime.now().strftime('%Y-%m-%d')
        prev = datetime.today() - timedelta(days=30)
        user_dict['previous'] = prev.strftime('%Y-%m-%d')
        user_dict['month'] = prev.strftime('%B')
        create_pdf_report(user_dict)


if __name__ == '__main__':
    main()
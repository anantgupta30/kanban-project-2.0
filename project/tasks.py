from workers import celery
from datetime import datetime
from celery.schedules import crontab
import smtplib
import glob
import csv
from email.mime.text import MIMEText 
from email.mime.base import MIMEBase
from email import encoders
from email.mime.multipart import MIMEMultipart
from report import *

SMTP_SERVER_HOST = 'localhost'
SMTP_SERVER_PORT = 1025
SENDER_ADDRESS = 'Do-Not-Reply@gmail.com'

@celery.on_after_configure.connect
def setup_periodic_tasks(sender,**kwargs):
    # Monthly Report will be sent at 12 AM at 1st day of every month
    sender.add_periodic_task(crontab(minute=33,hour=15,day_of_month=1),send_monthly_report.s(),name="Send report")
    # ALert will be sent daily at 5 PM 
    sender.add_periodic_task(crontab(minute=33,hour=15),daily_alert.s(),name="Send daily alert")

@celery.task()
def download_file(id):
    db = create_engine('sqlite:///project.sqlite3')
    conn = db.connect()
    cards = conn.execute("select * from card where card.list_id=="+str(id)).fetchall()
    lst = conn.execute("select listname from lists where lists.list_id=="+str(id)).fetchone()
    name = lst[0]
    with open('static/csv_files/{}_{}.csv'.format(name,id),"w") as csv_file:
        cw = csv.writer(csv_file)
        cw.writerow(['cardname','description','deadline','status','completed_on','created_on'])
        cw.writerows([(r[1], r[2], r[4], r[5], r[6], r[-1]) for r in cards])
    return True

@celery.task()
def send_email(to_address,subject,message,attachment=None):
    msg= MIMEMultipart()
    msg['From'] = SENDER_ADDRESS
    msg['To'] = to_address
    msg['Subject'] = subject
    if attachment:
        with open(attachment,"rb") as a:
            part = MIMEBase("application","octet-stream")
            part.set_payload(a.read())
        encoders.encode_base64(part)
        part.add_header(
            "Content-Disposition",f"attachment; filename={attachment}"
        )
        msg.attach(part)
    msg.attach(MIMEText(message,'html'))
    s = smtplib.SMTP(host=SMTP_SERVER_HOST,port=SMTP_SERVER_PORT)
    s.login(SENDER_ADDRESS,'')
    s.send_message(msg)
    s.quit()
    return True

@celery.task()
def send_monthly_report():
    generate_report()
    files = glob.glob('**/*.pdf', recursive=True)
    db = create_engine('sqlite:///project.sqlite3')
    conn = db.connect()
    users = conn.execute("select * from user")
    for user in users:
        report_name = str(user[0]) +".pdf"
        if report_name in files:
            send_email(user[2],"ALERT: Monthly report- Kanban APP","Hey, "+user[1]+", Please fing your report in the below attachment",attachment=report_name)

@celery.task()
def daily_alert():
    db = create_engine('sqlite:///project.sqlite3')
    conn = db.connect()
    users = conn.execute("select * from user")
    for u in users:
        id=u[0]
        lst = conn.execute(text('SELECT * from lists where lists.user_id=='+str(id)+' and lists.created_on>='+str(datetime.now().strftime('%Y-%m-%d'))))
        user_dict = {'user':[],'lists':[],'cards':[]}
        user_dict['today'] = datetime.now().strftime('%Y-%m-%d')
        user_dict['cards'] = []
        count = 0
        for l in lst:
            td = str(user_dict['today'])
            card = conn.execute(f'SELECT name,description,deadline from card where status=="pending" and deadline>="{td}" and list_id=='+str(l[0]))
            for j in card:
                user_dict['cards'].append(j)
                count +=1
            user_dict['lists'].append(l)
        user_dict['user'].append(u)
        with open('templates/alert.html') as file_:
            template = Template(file_.read())
            message = template.render(data=user_dict)
        if count!=0:
            send_email(u[2],"Kanban Application: Daily update regarding tasks",message=message)


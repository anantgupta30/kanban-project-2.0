import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

SMTP_SERVER_HOST = 'localhost'
SMTP_SERVER_PORT = 1025
SENDER_ADDRESS = 'ag30721@gmail.com'
RECIEVER_ADDRESS = 'ghosttam@gmail.com'


def send_email(to_address,subject,message):
    msg= MIMEMultipart()
    msg['From'] = SENDER_ADDRESS
    msg['To'] = to_address
    msg['Subject'] = subject

    msg.attach(MIMEText(message,'html'))

    s = smtplib.SMTP(host=SMTP_SERVER_HOST,port=SMTP_SERVER_PORT)
    s.login(SENDER_ADDRESS,'')
    s.send_message(msg)
    s.quit()

    return True

def main():
    send_email(RECIEVER_ADDRESS,subject="sample",message="My first message")


if __name__ == '__main__':
    main()
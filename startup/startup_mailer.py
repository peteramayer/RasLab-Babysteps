# Script to Email IP address on startup.
import subprocess
import smtplib
import socket
from email.mime.text import MIMEText
import datetime
from config_sample import *

to = config_to
email_user = config_email_user
email_password = config_email_password
email_smtp = config_smtp
email_config_smtp_port = config_smtp_port

smtpserver = smtplib.SMTP( email_smtp, email_config_smtp_port )
smtpserver.ehlo()
smtpserver.starttls()
smtpserver.ehlo
smtpserver.login(email_user, email_password)
today = datetime.date.today()

# Very Linux Specific
arg='ip route list'
p=subprocess.Popen(arg,shell=True,stdout=subprocess.PIPE)
data = p.communicate()
split_data = data[0].split()
ipaddr = split_data[split_data.index('src')+1]
my_ip = 'RasLabs IP is %s' %  ipaddr
msg = MIMEText(my_ip)
msg['Subject'] = 'RasLab Rebooted on: %s' % today.strftime('%b %d %Y')
msg['From'] = email_user
msg['To'] = ",".join(to);
smtpserver.sendmail(email_user, to, msg.as_string())
smtpserver.quit()

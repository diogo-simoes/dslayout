import web
import json
import textwrap
import os
import datetime

class Watchdog:
	def __init__(self, interval=15, max_requests=30):
		self.interval = interval
		self.max_requests = max_requests
		self.mru = {}
		self.blacklist = []
		if os.path.exists('blacklist.log'):
			with open('blacklist.log', 'r') as bl:
				for line in bl:
					self.blacklist.append(line.rstrip())

	def add_to_blacklist(self, ip):
		self.blacklist.append(ip)
		with open('blacklist.log', 'a+') as bl:
			bl.write(ip + '\n')

	def log_ip(self, ip):
		#if on blacklist, then reject
		if ip in self.blacklist:
			return 'blocked'

		#if not on mru, just log it {ip: [timestamp1,timestamp2...timestampn]}
		if self.mru.get(ip) is None:
			self.mru[ip] = [datetime.datetime.utcnow()]
			return 'granted'

		#if exists:
		#	1. clean old timestamps
		#	2. add new timestamp
		#	3. if above reasonable limit: add to blacklist
		history = self.mru[ip]
		now = datetime.datetime.utcnow()
		for stamp in history:
			if now > stamp + datetime.timedelta(minutes=self.interval):
				history.remove(stamp)
			else:
				break
		history.append(now)
		if len(history) > self.max_requests:
			self.add_to_blacklist(ip)
			return 'blocked'
		else:
			return 'granted'

class Bag:
	pass

confs = Bag()
confs.mail_recipient = ''


def init():
	f = open('mail.config', 'r')
	for line in f:
		prop = line.replace(' ','').rstrip().split('=')
		if (prop[0] == 'smtp_server'):
			web.config.smtp_server = prop[1]
		elif (prop[0] == 'smtp_port'):
			web.config.smtp_port = prop[1]
		elif (prop[0] == 'smtp_username'):
			web.config.smtp_username = prop[1]
		elif (prop[0] == 'smtp_password'):
			web.config.smtp_password = prop[1]
		elif (prop[0] == 'smtp_starttls'):
			web.config.smtp_starttls = True if prop[1].upper() == 'TRUE' else False
		elif (prop[0] == 'mail_recipient'):
			confs.mail_recipient = prop[1]
		else:
			print 'Unknown prop: ' + prop[0] + ' --> ' + prop[1]
	f.close()
	confs.wd = Watchdog();

init()

urls = (
	'/mailservice', 'Mail'
)

app = web.application(urls, globals())


class Mail:
	def GET(self):
		web.ctx.status = '401 Unauthorized'
		return

	def POST(self):
		client_origin = web.ctx.env.get('HTTP_ORIGIN')
		client_ua =  web.ctx.env.get('HTTP_USER_AGENT')
		client_ip =  web.ctx.ip

		web.header('Content-Type', 'application/json')
		web.header('Cache-control', 'no-cache')
		web.header('Access-Control-Allow-Origin', client_origin)

		if (confs.wd.log_ip(client_ip) == 'blocked'):
			web.ctx.status = '401 Unauthorized'
			return

		mail_data = json.loads(web.data())
		_to = confs.mail_recipient
		_from = mail_data['email']
		_sender = mail_data['name']
		_timestamp = mail_data['timestamp']
		_subject = mail_data['subject']
		_body = textwrap.dedent(
			u"""
			=======================================================
			* Email: {0}
			* Name: {1}
			* Time: {2}
			* UA-OS: {3}
			* IP: {4}
			* Subject: {5}
			========================================================

			""").format(_from, _sender, _timestamp, client_ua, client_ip, _subject) + mail_data["message"]
		try:
			web.sendmail(_from, _to, _subject, _body)
			response = { 'status' : '200'}
			return json.dumps(response)
		except Exception:
			web.ctx.status = '500 Internal server error'
			return

if __name__ == "__main__":
	app.run()
import web
import json
import textwrap

confs = {
	'mail_recipient': '',
	'allowed_origins': []
}

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
			confs['mail_recipient'] = prop[1]
		elif (prop[0] == 'allowed_origins'):
			for url in prop[1].split(","):
				confs['allowed_origins'].append(url.strip())
		else:
			print'Unknown prop: ' + prop[0] + ' --> ' + prop[1]
	f.close()

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

		if not(client_origin in confs['allowed_origins']):
			web.ctx.status = '401 Unauthorized'
			return

		mail_data = json.loads(web.data())
		_to = confs['mail_recipient']
		_from = mail_data['email']
		_sender = mail_data['name']
		_timestamp = mail_data['timestamp']
		_subject = mail_data['subject']
		_body = textwrap.dedent(
			"""
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
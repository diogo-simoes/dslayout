import web
import json
import textwrap

web.config.smtp_server = 'smtp.gmail.com'
web.config.smtp_port = 587
web.config.smtp_username = 'diogo.fonseca.simoes@gmail.com'
web.config.smtp_password = '*****'
web.config.smtp_starttls = True

urls = (
	'/mailservice', 'Mail'
)
auth_origins = ['http://localhost:8190']
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

		if not(client_origin in auth_origins):
			web.ctx.status = '401 Unauthorized'
			return

		mail_data = json.loads(web.data())
		_to = 'diogo.fonseca.simoes@gmail.com'
		_from = mail_data["email"]
		_sender = mail_data["name"]
		_timestamp = mail_data["timestamp"]
		_subject = mail_data["subject"]
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
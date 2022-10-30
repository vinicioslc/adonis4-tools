'use strict'

const Env = use('Env')

module.exports = {
  connection: Env.get('MAIL_CONNECTION', 'smtp'),
  smtp: {
    driver: 'smtp',
    pool: true,
    port: Env.get('SMTP_PORT', 587),
    host: Env.get('SMTP_HOST'),
    secure: false,
    auth: {
      user: Env.get('MAIL_USERNAME'),
      pass: Env.get('MAIL_PASSWORD')
    },
    maxConnections: 5,
    maxMessages: 100,
    rateLimit: 10
  }
}

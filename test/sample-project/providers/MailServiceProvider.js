'use strict'

const { ServiceProvider } = require('@adonisjs/fold')

class MailServiceProvider extends ServiceProvider {
  register() {
    this.app.singleton('Providers/MailService', () => {
      return new (require('../app/Services/MailService.js'))()
    })
  }
}

module.exports = MailServiceProvider

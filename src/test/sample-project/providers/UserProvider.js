'use strict'

const { ServiceProvider } = require('@adonisjs/fold')

class SettingsServiceProvider extends ServiceProvider {
  register() {
    this.app.singleton('Providers/User', () => {
      return new (require('../app/Services/UserService.js'))()
    })
  }
}

module.exports = SettingsServiceProvider

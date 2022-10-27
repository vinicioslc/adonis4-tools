'use strict'

const { ServiceProvider } = require('@adonisjs/fold')

class LoggerProvider extends ServiceProvider {
  register() {
    this.app.singleton('Logger', () => {})
  }
}

module.exports = LoggerProvider

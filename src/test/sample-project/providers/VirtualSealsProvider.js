'use strict'

const { ServiceProvider } = require('@adonisjs/fold')

class VirtualSealsProvider extends ServiceProvider {
  register() {
    this.app.bind('Providers/VirtualSealService', () => {
      return new (require('../app/Services/VirtualSealService.js'))(
        this.app.use('Providers/SealingService')
      )
    })
  }
}

module.exports = VirtualSealsProvider

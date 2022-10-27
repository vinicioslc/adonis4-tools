'use strict'
const moment = require('moment')

class CastDates {
  register(Model, customOptions = {}) {
    if (customOptions === 'disable') {
      // when disabled returns the default datetime value
      Model.castDates = function (field, value) {
        return value
      }
      return null
    }
    const defaultOptions = {
      format: 'DD/MM/YYYY HH:mm' // milliseconds (unix timestamp)
    }

    const options = Object.assign(defaultOptions, customOptions)

    Model.castDates = function (field, value) {
      return value ? moment(value).format('DD/MM/YYYY HH:mm') : value
    }
  }
}

module.exports = CastDates

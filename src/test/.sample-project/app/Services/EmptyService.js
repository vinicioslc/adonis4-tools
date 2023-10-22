'use strict'
/** @typedef {import('@adonisjs/lucid/src/Schema')} Schema */

/** @type {Schema} */
const Schema = use('Schema')
class EmptyService {
  constructor() {
    this.summary = {}
  }
}

module.exports = EmptyService

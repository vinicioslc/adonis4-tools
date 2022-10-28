'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserSchema extends Schema {
  up() {
    this.create('users', table => {
      table.increments()
      table.string('name', 64).notNullable()
      table.string('username', 82).notNullable().unique()
      table.string('email', 254).nullable().unique()
      table.string('password', 64).notNullable()
      table.uuid('uuid').notNullable().unique()
      table.timestamps()
    })
  }

  down() {
    this.drop('users')
  }
}

module.exports = UserSchema

'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class AuditHealthCheck extends Model {
  static boot() {
    super.boot()
    this.addTrait('@provider:Jsonable', ['test_data'])
    this.addTrait('@provider:SoftDeletes')

    this.addTrait('CastDates', {
      format: 'DD/MM/YYYY HH:mm' // milliseconds (unix timestamp)
    })

    this.addHook('beforeSave', model => {
      model.updated_at = new Date(Date.now())
      return model
    })

    this.addTrait('@provider:Auditable')
  }

  /**
   * Common Columns that are used in merge or filter from request body
   */
  static get _defaultCols() {
    return ['id', 'created_at', 'updated_at', 'deleted_at']
  }

  /**
   * Columns that are used in merge or filter from request body
   */
  static get columns() {
    return this._defaultCols
  }
}

module.exports = AuditHealthCheck

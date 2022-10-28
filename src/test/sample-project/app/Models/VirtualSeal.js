'use strict';

const { matchNonDigitRegex } = use('App/Helpers');

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');
class VirtualSeal extends Model {
  static boot() {
    super.boot();

    this.addHook('afterFetch', async meterArray => {
      return meterArray.map(VirtualSeal.formatModel);
    });

    this.addHook('afterFind', async term => {
      return VirtualSeal.formatModel(term);
    });

    this.addHook('afterCreate', async term => {
      return VirtualSeal.formatModel(term);
    });

    this.addHook('beforeSave', async voltageInstance => {
      voltageInstance.number = VirtualSeal.cleanNumber(voltageInstance.number);
      return voltageInstance;
    });

    this.addTrait('CastDates', {
      format: 'DD/MM/YYYY HH:mm' // milliseconds (unix timestamp)
    });

    // this.addTrait('@provider:SoftDeletes')
    this.addTrait('@provider:Auditable');
  }

  /**
   * Common Columns that are used in merge or filter from request body
   */
  static get _defaultCols() {
    return ['id', 'created_at', 'updated_at', 'deleted_at'];
  }

  /**
   * Columns that are used in merge or filter from request body
   */
  static get columns() {
    return this._defaultCols;
  }

  static cleanNumber(value) {
    if (value) return value.toString().replace(matchNonDigitRegex, '');
    return value;
  }

  static formatModel(term) {
    term.raw_number = VirtualSeal.cleanNumber(term.number);
    term.number = term.prefix + term.raw_number;
    return term;
  }

  meterSerials() {
    return this.belongsToMany('App/Models/MeterSerial').withTimestamps();
  }
  fiscalNoteItems() {
    return this.belongsToMany('App/Models/FiscalNoteItem').pivotTable('meter_serial_virtual_seal');
  }
  commitmentTerm() {
    return this.belongsTo('App/Models/CommitmentTerm');
  }
}

module.exports = VirtualSeal;

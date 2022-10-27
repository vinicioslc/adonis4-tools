'use strict'

const Database = use('Database')

/** @type {typeof import('../Models/CommitmentTerm')} */
const CommitmentTerm = use('App/Models/CommitmentTerm')

/** @type {typeof import('../Models/VirtualSeal')} */
const VirtualSeal = use('App/Models/VirtualSeal')

/** @type {typeof import('../Models/FiscalNoteItem')} */
const FiscalNoteItem = use('App/Models/FiscalNoteItem')

/** @type {typeof import('../Models/MeterSerialVirtualSeal')} */
const MeterSerialVirtualSeal = use('App/Models/MeterSerialVirtualSeal')

const { InvalidArgumentException, DomainException } = require('@adonisjs/generic-exceptions')

class VirtualSealsService {
  constructor(sealingService) {
    /** @type { import('../Services/SealingService')} */
    this.sealingService = sealingService
  }
}

module.exports = VirtualSealsService

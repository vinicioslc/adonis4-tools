'use strict';

/** Type Definitions */
/** @typedef {typeof import('../../Models/VirtualSeal.js.js')} VirtualSeal*/
/** @typedef {import('@adonisjs/bodyparser/src/Multipart/File')} File*/
/** @typedef {import('@adonisjs/lucid/src/Database')} Database*/
/** @typedef {import('../../Services/VirtualSealService.js')} VirtualSealsProvider*/

// eslint-disable-next-line no-undef
const VirtualSeal = use('App/Models/VirtualSeal');
/** @type {File}*/
const File = use('File')
/** @type {Database}*/
const Database = use('Database')
/** @type {VirtualSealsProvider}*/
const VirtualSealService = use('Providers/VirtualSealService')

/**
 *
 * Resourceful controller for interacting with virtual-seals
 *
 */
class VirtualSealController {
  async index({ request, response, view }) {}
}

module.exports = VirtualSealController

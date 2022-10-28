'use strict';

/** Type Definitions */
/** @typedef {typeof import('../../Models/VirtualSeal.js')} VirtualSeal*/

// eslint-disable-next-line no-undef
const VirtualSeal = use('App/Models/VirtualSeal');

/**
 *
 * Resourceful controller for interacting with virtual-seals
 *
 */
class VirtualSealController {
  async index({ request, response, view }) {}

  async store({ request, response }) {}

  async show({ params, request, response, view }) {}

  async update({ params, request, response }) {}

  async destroy({ params, request, response }) {}
}

module.exports = VirtualSealController;

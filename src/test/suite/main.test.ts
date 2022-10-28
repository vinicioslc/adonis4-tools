import * as assert from 'assert';
// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import * as myExtension from '../extension';
import * as helper from '../helpers';
const changedFile = `'use strict';
const VirtualSealService = use('Providers/VirtualSealService')

/** Type Definitions */

/** @typedef {import('../../Services/VirtualSealService.js')} VirtualSealsProvider*/
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
`;
suite('Extension Test Suite', () => {
  test('Should change the document adding the correct typedefs', async function () {
    this.timeout(10000);
    const revertChanges = await helper.importClassToFile(
      'VirtualSealsProvider.js',
      'app/Controllers/Http/VirtualSealController.js'
    );
    const afterText = await helper.getCurrentFileString();

    assert.strictEqual(afterText, changedFile);
    await revertChanges();
  });
});

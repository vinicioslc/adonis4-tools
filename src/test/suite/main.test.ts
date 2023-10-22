import * as assert from 'assert';
// You can import and use all API from the 'vscode' module
// as well as import your extension to test it

import * as helper from '../helpers';
suite('Extension Test Suite', () => {
  test('Should change the document adding the correct typedefs', async function () {
    this.timeout(10000);
    const revertChangesFn = await helper.importClassToFile(
      'VirtualSealsProvider.js',
      'app/Controllers/Http/VirtualSealController.js'
    );
    const afterText = await helper.getCurrentFileString();

    assert.strictEqual(
      afterText,
      `'use strict';

/** Type Definitions */
/** @typedef {typeof import('../../Models/VirtualSeal.js.js')} VirtualSeal*/
/** @typedef {import('../../Services/VirtualSealService.js')} VirtualSealsProvider*/

// eslint-disable-next-line no-undef
const VirtualSeal = use('App/Models/VirtualSeal');
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
`
    );
    await revertChangesFn();
  });

  test('Should Import Framework Typings Correctly', async function () {
    this.timeout(10000);
    const revertChangesFn = await helper.importClassToFile(
      'Database',
      'app/Controllers/Http/VirtualSealController.js'
    );
    const afterText = await helper.getCurrentFileString();

    assert.strictEqual(
      afterText,
      `'use strict';

/** Type Definitions */
/** @typedef {typeof import('../../Models/VirtualSeal.js.js')} VirtualSeal*/
/** @typedef {import('@adonisjs/lucid/src/Database')} Database*/

// eslint-disable-next-line no-undef
const VirtualSeal = use('App/Models/VirtualSeal');
/** @type {Database}*/
const Database = use('Database')

/**
 *
 * Resourceful controller for interacting with virtual-seals
 *
 */
class VirtualSealController {
  async index({ request, response, view }) {}
}

module.exports = VirtualSealController
`
    );
    await revertChangesFn();
  });

  test('Should Import More than 2 typings without overlap Correctly', async function () {
    this.timeout(10000);
    const revertChangesFn = await helper.importClassToFile(
      'Database',
      'app/Controllers/Http/VirtualSealController.js'
    );
    const revertChanges2Fn = await helper.importClassToFile(
      'File',
      'app/Controllers/Http/VirtualSealController.js'
    );
    const afterText = await helper.getCurrentFileString();

    assert.strictEqual(
      afterText,
      `'use strict';

/** Type Definitions */
/** @typedef {typeof import('../../Models/VirtualSeal.js.js')} VirtualSeal*/
/** @typedef {import('@adonisjs/bodyparser/src/Multipart/File')} File*/
/** @typedef {import('@adonisjs/lucid/src/Database')} Database*/

// eslint-disable-next-line no-undef
const VirtualSeal = use('App/Models/VirtualSeal');
/** @type {File}*/
const File = use('File')
/** @type {Database}*/
const Database = use('Database')

/**
 *
 * Resourceful controller for interacting with virtual-seals
 *
 */
class VirtualSealController {
  async index({ request, response, view }) {}
}

module.exports = VirtualSealController
`
    );
    await revertChangesFn();
  });



  test('Should Import Framework Typings Correctly', async function () {
    this.timeout(10000);
    const revertChangesFn = await helper.importClassToFile(
      'Database',
      'app/Controllers/Http/EmptyController.js'
    );
    const afterText = await helper.getCurrentFileString();

    assert.strictEqual(
      afterText,
      `'use strict'

class EmptyController {
  async index({ request, response, view }) {}
}

module.exports = EmptyController
`
    );
    await revertChangesFn();
  });
});

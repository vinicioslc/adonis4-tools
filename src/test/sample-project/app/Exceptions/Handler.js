'use strict';

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/Exception/BaseHandler')} BaseExceptionHandler */
/** @typedef {import('@adonisjs/framework/src/Env')} Env */

/** @type {BaseExceptionHandler} */
const BaseExceptionHandler = use('BaseExceptionHandler');

/** @type {Env} */
const Env = use('Env');
/**
 * This class handles all exceptions thrown during
 * the HTTP request lifecycle.
 *
 * @class ExceptionHandler
 */
class ExceptionHandler extends BaseExceptionHandler {
  /**
   * Handle exception thrown during the HTTP lifecycle
   *
   * @method handle
   *
   * @param  {Error} error
   * @param  {Request} options.request
   * @param  {Response} options.response
   *
   * @return {void}
   */
  async handle(error, { request, response, session }) {
    return super.handle(...arguments);
  }
  async report(error, { request }) {
    console.error(error);
  }
}

module.exports = ExceptionHandler;

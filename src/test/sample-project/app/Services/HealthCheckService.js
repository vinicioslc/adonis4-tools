'use strict';

const HealthCheck = use('App/Models/HealthCheck');
const AuditHealthCheck = use('App/Models/AuditHealthCheck');
const Database = use('Database');
const Audit = use('App/Models/Audit');

/**
 *
 * Service Responsible by health checks
 *
 * @class HealthCheckService
 */
class HealthCheckService {
  constructor() {
    this.summary = {};
  }
}

module.exports = HealthCheckService;

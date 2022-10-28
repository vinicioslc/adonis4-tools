'use strict'

const uuid = require('uuid')

const UUIDHook = (exports = module.exports = {})

UUIDHook.generate = async modelInstance => {
  modelInstance.uuid = uuid.v4()
}

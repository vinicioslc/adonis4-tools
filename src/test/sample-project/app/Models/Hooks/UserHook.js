'use strict'

const Hash = use('Hash')

const UserHook = (exports = module.exports = {})

UserHook.hashPassword = async user => {
  if (user.dirty.password && user.dirty.password.trim().length > 0) {
    user.password = await Hash.make(user.password)
  }
}

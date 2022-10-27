'use strict'

class Permission {
  get rules() {
    const id = this.ctx.params.id
    return {
      slug: `required_without_all:id|unique:permissions,slug,id,${id}`,
      name: `required_without_all:id|unique:permissions,name,id,${id}`
    }
  }
  get messages() {
    return {
      'slug.required_without_all': 'required_without_all',
      'slug.unique': 'unique',
      'name.required_without_all': 'required_without_all',
      'name.unique': 'unique'
    }
  }
  get data() {
    const { id } = this.ctx.params
    const data = this.ctx.request.all()
    if (!id) return Object.assign({}, { ...data })
    return Object.assign({}, { ...data, id })
  }
}

module.exports = Permission

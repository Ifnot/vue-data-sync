import Vue from 'vue'

let datasets = {}

export default {
  add (component, path, value) {
    let uniques = []
    let valueIsChild = typeof value === 'object'

    if (valueIsChild) {
      for (let key in value) {
        uniques = uniques.concat(this.add(component, path.concat(key), value[key]))
      }
    } else {
      let tag = component.$vnode ? component.$vnode.tag : ''
      let config = null
      if (typeof value === 'function') config = Object.assign({}, value.apply(component))
      else config = Object.assign({}, {name: value})

      if (!datasets[config.name]) datasets[config.name] = []

      let unique = Math.random().toString(36).substr(2, 9)
      datasets[config.name].push({
        id: unique,
        tag,
        component,
        data: component.$data,
        path: path.join('.'),
        handlers: {
          onCreate: () => { return false }, // Do not autocreate by default
          onUpdate: () => { return true },
          onDelete: () => { return true }
        }
      })

      console.log('[ VDS ] Adding data synchronizer : ' + tag + ' -> ' + config.name + ' (' + path.join('.') + ') (id ' + unique + ')')

      uniques.push(unique)
    }

    return uniques
  },
  remove (ids) {
    if (Array.isArray(ids) && ids.length > 0) {
      for (let name in datasets) {
        datasets[name] = datasets[name].filter(row => {
          if (!ids.includes(row.id)) {
            return true
          } else {
            console.log('[ VDS ] Removing data synchronizer : ' + row.tag + ' -> ' + row.path + ' (' + row.id + ')')
            return false
          }
        })
      }
    }
  },
  get (modelName) {
    if (typeof datasets[modelName] === 'undefined') {
      return []
    }

    return datasets[modelName]
  }
}

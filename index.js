import Datasets from './datasets'

let matchRule = (str, rule) => {
  return new RegExp('^' + rule.split('*').join('.*') + '$').test(str)
}

let deepGet = (obj, path) => {
  path = path.split('.')
  for (let i = 0; i < path.length; i++) {
    obj = obj[path[i]]
  }
  return obj
}

export default {
  install (Vue, options) {
    let self = this

    // Hooks all sync() methods on components
    Vue.mixin({
      created: function () {
        let vnode = this.$vnode ? this.$vnode.tag : ''
        this.syncHandlersIds = Datasets.add(vnode, this.$data, [], this.$options.sync ? this.$options.sync : {})
      },
      destroyed: function () {
        Datasets.remove(this.syncHandlersIds)
      }
    })

    // Listen for events
    options.driver.listen()
    options.driver.on('event', self.handleEvents)
    Vue.prototype.$sync = {
      on (name, handler) {
        options.driver.on('event', (e) => {
          if (matchRule(e.model_name + ':' + e.event, name)) {
            handler(e)
          }
        })
      },
      once (name, handler) {
        options.driver.once('event', (e) => {
          if (matchRule(e.model_name + ':' + e.event, name)) {
            handler(e)
          }
        })
      }
    }
  },
  handleEvents (e) {
    // For each sets with the corresponding model name
    let sets = Datasets.get(e.model_name)
    for (let i = 0; i < sets.length; i++) {
      let set = sets[i]
      let index = deepGet(set.data, set.path).findIndex(model => model.id === e.model.id)
      let payload = {data: deepGet(set.data, set.path), index, model: e.model, event: e}

      if (e.event === 'create') set.handlers.onCreate(payload)
      else if (e.event === 'update') set.handlers.onUpdate(payload)
      else if (e.event === 'delete') set.handlers.onDelete(payload)
    }
  }
}

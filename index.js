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
        this.syncHandlersIds = Datasets.add(this, [], this.$options.sync ? this.$options.sync : {})
      },
      destroyed: function () {
        Datasets.remove(this.syncHandlersIds)
      }
    })

    // Listen for events
    this.driver = options.driver
    this.driver.listen()
    this.driver.on('event', self.handleEvents)
    Vue.prototype.$sync = {
      on (name, handler) {
        self.driver.on('event', (e) => {
          if (matchRule(e.model_name + ':' + e.event, name)) {
            handler(e)
          }
        })
      },
      once (name, handler) {
        self.driver.once('event', (e) => {
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
      let index = Array.isArray(deepGet(set.data, set.path)) ? deepGet(set.data, set.path).findIndex(model => model.id === e.model.id) : null
      let payload = {data: deepGet(set.data, set.path), index, model: e.model, event: e}

      if (e.event === 'create') {
        if (set.handlers.onCreate.apply(set.component, [payload]) === true) {
          Datasets.getDefaultHandlers().onCreate.apply(set.component, [payload])
        }
      }
      else if (e.event === 'update') {
        if (set.handlers.onUpdate.apply(set.component, [payload]) === true) {
          Datasets.getDefaultHandlers().onUpdate.apply(set.component, [payload])
        }
      }
      else if (e.event === 'delete') {
        if (set.handlers.onDelete.apply(set.component, [payload]) === true) {
          Datasets.getDefaultHandlers().onDelete.apply(set.component, [payload])
        }
      }
    }
  }
}

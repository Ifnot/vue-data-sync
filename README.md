# Vue Data Sync (Client) - WIP

This is the VueJs client package for [Vue Data Sync](https://github.com/Ifnot/vue-data-sync-laravel).

## Installation

    npm install -S vue-data-sync

## Quick start

First, follow (the backend Quick Start)[https://github.com/Ifnot/vue-data-sync-laravel] and then setup the plugin :

```js
import Vue from 'vue'

import Echo from 'laravel-echo'
let echo = new Echo({ /* ... */ }) // Here your Echo configuration

import vds from 'vue-data-sync'
import vdsEchoDriver from 'vue-data-sync/drivers/laravel-echo-driver'

Vue.use(vds, {
  driver: new vdsEchoDriver({
    echo: echo,
    channels: ['public'], // The backend default value is to listen the public "public" channel
    privateChannels: [], // But you can also use private channels instead
    options: {
      debug: true // Log some debug informations into console
    }
  })
})
```

Add a `sync` object just below your `data` method of your components :

```js
export default {
  name: 'my-component',
  data () {
    return {
      cars: []
    }
  },
  sync: {
    cars: 'car' // By default, the backend php class name in lower case
  },
  created () {
    // Here you handle the loading of your cars by http request or other ...
  }
}
```

> **How it works** : For each event from the backend `Car` class, The package will apply the modification 
to your `cars` array for keeping up to date. (In fact, the loaded data will be updated or deleted, but no 
creation will be handled this way, read the following for adding creation capability)

## Fine tuning

You can customize the way actions are performed by returning method :

```js
sync: {
  cars () {
    return {
      name: 'car',
      onCreate ({data, model, index}) { return true },
      onUpdate ({data, model, index}) { return true },
      onDelete ({data, model, index}) { return true }
    }
  }
},
```

The parameters list :
 * `data` : The dataset (list of models)
 * `model` : The model send through Echo
 * `index` : The found index position of the `model` into `data`, `-1` if not found (search if performed with the id attribute)
 
 The return value :
 * `true` : You accept the action to be performed (by default `onCreate` is on false)
 * `false` or nothing: No default action is performed (you can still do what you want into it)
 
 

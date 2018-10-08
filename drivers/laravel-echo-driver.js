import EventEmitter from 'events'

class LaravelEchoDriver {
  constructor ({echo = null, channels = [], privateChannels = [], options = {}} = {}) {
    // Try to load a window Echo registered if given
    if (echo === null && 'Echo' in window) {
      echo = window.Echo
    }

    this.echo = echo
    this.channels = channels
    this.privateChannels = privateChannels
    this.options = options
    this.events = new EventEmitter()
  }

  listen () {
    if (this.channels.length > 0) {
      this.listenPublic(this.channels)
    }
    if (this.privateChannels.length > 0) {
      this.listenPrivate(this.privateChannels)
    }
  }

  listenPublic (channels) {
    let self = this

    if (this.options.debug) console.log('[ VDS:LARAVEL-ECHO-DRIVER ] Listening to Echo public channels : ' + channels)

    for (let i = 0; i < channels.length; i++) {
      this.echo.channel(channels[i])
        .listen('.vue-data-sync.event', (e) => {
          self.handleMessage(e, false)
        })
    }
  }

  listenPrivate (channels) {
    let self = this

    if (this.options.debug) console.log('[ VDS:LARAVEL-ECHO-DRIVER ] Listening to Echo private channels : ' + channels)

    for (let i = 0; i < channels.length; i++) {
      this.echo.private(channels[i])
        .listen('.vue-data-sync.event', (e) => {
          self.handleMessage(e, true)
        })
    }
  }

  handleMessage (e, privateChannel) {
    if (this.options.debug) {
      console.log('[ VDS:LARAVEL-ECHO-DRIVER ] Event : ' + e.model_name + ' (' + e.event + ')', e.model, e.meta)
    }

    this.events.emit('event', e)
  }

  on (event, handler) {
    return this.events.on(event, handler)
  }
}

export default LaravelEchoDriver

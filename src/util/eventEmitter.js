const slice = Array.prototype.slice

export default class EventEmitter {
  constructor () {
    this.events = {}
  }

  on (eventName, fn, once) {
    const that = this

    eventName.split(' ').forEach(name => {
      if (!that.events[name]) {
        that.events[name] = []
      }
      fn && (that.events[name].push({fn, once}))
    })
    return that
  }

  emit (eventName) {
    const that = this
    const args = slice.call(arguments, 1)

    eventName = eventName.split(' ').forEach(name => {
      const events = that.events[name]

      if (events) {
        const length = events.length

        for (let i = 0; i < length; i++) {
          const current = events[i]

          if (current) {
            events[i].fn.apply(that, args)

            if (events[i].once) {
              events.splice(i--, 1)
            }
          }
        }
      }
    })
  }

  off (eventName, fn) {
    const that = this
    const events = that.events[eventName]

    if (events) {
      // 没有回调函数则移除所有该事件下的函数
      if (!fn) {
        that.events[eventName] = []
        return
      }

      // 有事件名和函数
      const length = events.length

      for (let i = 0; i < length; i++) {
        if (events[i] && events[i].fn === fn) {
          events.splice(i, 1)
          break
        }
      }
      return
    }

    // 没有事件名则移除所有监听函数
    if (!eventName) {
      that.events = {}
    }
  }
}

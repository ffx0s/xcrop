const slice = Array.prototype.slice

export default class Observer {
  constructor () {
    this.events = {}
  }

  on (eventName, fn) {
    const ob = this

    eventName.split(' ').forEach(name => {
      if (!ob.events[name]) {
        ob.events[name] = []
      }
      fn && (ob.events[name].push(fn))
    })
    return ob
  }

  emit (eventName) {
    const ob = this
    const args = slice.call(arguments, 1)

    eventName = eventName.split(' ').forEach(name => {
      const events = ob.events[name]

      if (events) {
        events.forEach(fn => fn.apply(ob, args))
      }
    })
  }

  off (eventName, fn) {
    const ob = this
    const events = ob.events[eventName]

    if (events) {
      const index = events.indexOf(fn)

      if (index !== -1) {
        events.forEach(fn => events.splice(index, 1))
      }
    }
  }
}

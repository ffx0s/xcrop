const slice = Array.prototype.slice

function Observer () {
  this.events = {}
}

Observer.prototype = {
  on: function (signals, fn) {
    const ob = this

    signals.split(' ').forEach(signal => {
      if (!ob.events[signal]) {
        ob.events[signal] = []
      }
      fn && (ob.events[signal].push(fn))
    })
  },
  emit: function (signals) {
    const ob = this
    const args = slice.call(arguments, 1)

    signals = signals.split(' ').forEach(signal => {
      const events = ob.events[signal]
      if (events) {
        events.forEach(fn => fn.apply(ob, args))
      }
    })
  },
  off: function (signal, fn) {
    const ob = this

    let events = ob.events[signal]
    if (events) {
      events.forEach(fn => events.splice(events.indexOf(fn), 1))
    }
  }
}

export default Observer

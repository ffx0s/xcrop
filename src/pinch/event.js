import { bind } from '../util/shared'
import Observer from '../util/observer'

function touchEach (touches, callback) {
  let arr = []
  for (let attr in touches) {
    if (typeof +attr === 'number' && !isNaN(+attr)) {
      arr.push(callback(touches[attr], attr))
    }
  }
  return arr
}

export function initEvent (pinch) {
  pinch.eventList = ['mousewheel', 'touchstart', 'touchmove', 'touchend']
  pinch.isMove = false
  pinch.isLock = false
  pinch.observer = new Observer()
}

export function bindEvent (pinch) {
  const target = pinch.options.touchTarget || pinch.canvas
  pinch.eventList.forEach(value => {
    target.addEventListener(value, pinch, false)
  })
}

export function addEvent (Pinch) {
  const proto = Pinch.prototype

  proto.handleEvent = function (e) {
    const pinch = this
    switch (e.type) {
      case 'touchstart':
        pinch.touchstart(e)
        break
      case 'touchmove':
        pinch.touchmove(e)
        break
      case 'touchend':
        pinch.touchend(e)
        break
      // debug
      case 'mousewheel':
        pinch.mousewheel(e)
        break
    }
  }

  proto.mousewheel = function (e) {
    e.preventDefault()

    const pinch = this
    const zoomIntensity = 0.01
    const mouse = {
      x: e.clientX - pinch.rect.left,
      y: e.clientY - pinch.rect.top
    }
    const wheel = e.wheelDelta / 520
    const zoom = Math.exp(wheel * zoomIntensity)

    pinch.scaleTo(mouse, zoom)
    pinch.validation()
    pinch.emit('mousewheel', e)
  }

  proto.touchstart = function (e) {
    e.preventDefault()

    const pinch = this
    const touches = e.touches

    if (pinch.isLock) return false

    if (touches.length === 2) {
      pinch.pinchstart(e)
    } else if (touches.length === 1) {
      pinch.dragstart(e)
    }

    pinch.isMove = true
  }

  proto.touchmove = function (e) {
    const pinch = this
    const touches = e.touches

    if (!pinch.isMove || pinch.isLock) return false

    if (touches.length === 2) {
      pinch.pinchmove(e)
    } else if (touches.length === 1) {
      pinch.dragmove(e)
    }
  }

  proto.touchend = function (e) {
    const pinch = this

    if (pinch.isLock) return false

    pinch.isMove = false

    pinch.validation()
    pinch.emit('touchend', e)
  }

  proto.dragstart = function (e) {
    const pinch = this
    const touches = e.touches

    pinch.dragStart = {
      x: touches[0].pageX - pinch.rect.left,
      y: touches[0].pageY - pinch.rect.top
    }
    pinch.lastMove = {
      x: pinch.position.x - pinch.origin.x,
      y: pinch.position.y - pinch.origin.y
    }

    pinch.emit('touchstart', e)
  }

  proto.dragmove = function (e) {
    const pinch = this
    const touches = e.touches
    const move = {
      x: touches[0].pageX - pinch.rect.left - pinch.dragStart.x,
      y: touches[0].pageY - pinch.rect.top - pinch.dragStart.y
    }
    const speed = pinch.canvasScale / pinch.scale
    const x = pinch.lastMove.x + move.x * speed
    const y = pinch.lastMove.y + move.y * speed

    pinch.moveTo(x, y)
    pinch.emit('touchmove', e)
  }

  proto.pinchstart = function (e) {
    const pinch = this

    pinch.zoomStart = touchEach(e.touches, function (touch) {
      return { x: touch.pageX, y: touch.pageY }
    })

    pinch.zoomCount = 0

    pinch.emit('pinchstart', e)
  }

  proto.pinchmove = function (e) {
    const pinch = this

    if (!pinch.isMove) return false

    pinch.zoomCount++

    pinch.zoomEnd = touchEach(e.touches, touch => {
      return { x: touch.pageX, y: touch.pageY }
    })

    const touchCenter = Pinch.getTouchCenter(pinch.zoomEnd)
    const scale = Pinch.getScale(pinch.zoomStart, pinch.zoomEnd)

    if (pinch.zoomCount <= 2) {
      pinch.lastScale = scale
      return false
    }

    const zoom = 1 + scale - pinch.lastScale
    const move = {
      x: touchCenter.x - pinch.rect.left,
      y: touchCenter.y - pinch.rect.top
    }

    pinch.scaleTo(move, zoom)
    pinch.lastScale = scale
    pinch.emit('pinchmove', e)
  }

  proto.emit = function (name) {
    this.observer.emit.apply(this.observer, arguments)
  }

  ;['on', 'off'].forEach(value => {
    proto[value] = function (name, fn) {
      this.observer[value](name, fn && bind(fn, this))
    }
  })
}

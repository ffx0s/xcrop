import Observer from '../util/observer'
import { noop } from '../util/shared'
import animate from '../util/animate'

export function initEvent (pinch) {
  pinch.events = ['mousewheel', 'touchstart', 'touchmove', 'touchend']
  pinch.observer = new Observer()
  // 最后一次触摸操作的参数
  pinch.last = {
    scale: 1,
    point: { x: 0, y: 0 },
    move: { x: 0, y: 0 },
    time: 0,
    dis: { time: 0, x: 0, y: 0 }
  }
  pinch.touchDelay = 3
  pinch.animation = { stop: noop }
}

export function addEvent (Pinch) {
  const proto = Pinch.prototype

  proto.bindEvent = function () {
    const pinch = this
    const target = pinch.options.touchTarget || pinch.canvas
    pinch.events.forEach(value => {
      target.addEventListener(value, pinch, false)
    })
  }

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

  // debug
  proto.mousewheel = function (e) {
    e.preventDefault()
    const pinch = this
    pinch.rect = pinch.wrap.getBoundingClientRect()
    const point = {
      x: (e.clientX - pinch.rect.left) * pinch.canvasScale,
      y: (e.clientY - pinch.rect.top) * pinch.canvasScale
    }
    const STEP = 0.99
    const factor = e.deltaY
    const scaleChanged = Math.pow(STEP, factor)
    pinch.last.point = point
    pinch.scaleTo(point, pinch.scale * scaleChanged)
    pinch.emit('mousewheel', e)
  }

  proto.touchstart = function (e) {
    e.preventDefault()
    const pinch = this
    const touches = e.touches
    pinch.rect = pinch.wrap.getBoundingClientRect()
    pinch.animation.stop()
    if (touches.length === 2) {
      pinch.pinchstart(e)
    } else if (touches.length === 1) {
      pinch.dragstart(e)
    }
  }

  proto.touchmove = function (e) {
    const pinch = this
    const touches = e.touches
    if (touches.length === 2) {
      pinch.pinchmove(e)
    } else if (touches.length === 1) {
      pinch.dragmove(e)
    }
  }

  proto.touchend = function (e) {
    const pinch = this
    const touches = e.touches
    if (touches.length) {
      // pinch end
      pinch.emit('pinchend', e)
      pinch.dragstart(e)
    } else {
      // drag end
      pinch.dragend(e)
    }
  }

  proto.dragstart = function (e) {
    const pinch = this
    const touches = e.touches

    pinch.last.move = {
      x: touches[0].clientX - pinch.rect.left,
      y: touches[0].clientY - pinch.rect.top
    }
    pinch.last.dis = { time: 0, x: 0, y: 0 }
    pinch.last.time = new Date().getTime()
    pinch.touchDelay = 3
    pinch.emit('dragstart', e)
  }

  proto.dragmove = function (e) {
    const pinch = this
    const touches = e.touches
    const move = {
      x: touches[0].clientX - pinch.rect.left,
      y: touches[0].clientY - pinch.rect.top
    }
    const x = (move.x - pinch.last.move.x) * pinch.canvasScale
    const y = (move.y - pinch.last.move.y) * pinch.canvasScale
    const nowTime = new Date().getTime()
    pinch.last.dis = { x, y, time: nowTime - pinch.last.time }
    pinch.last.time = nowTime
    pinch.last.move = move
    // 延迟防止手误操作
    if (pinch.touchDelay) {
      pinch.touchDelay--
      return
    }
    pinch.moveTo(pinch.position.x + x, pinch.position.y + y)
    pinch.emit('dragmove', e)
  }

  proto.dragend = function (e) {
    const pinch = this
    if (!pinch.validation()) {
      // 缓冲动画
      const vx = pinch.last.dis.x / pinch.last.dis.time
      const vy = pinch.last.dis.y / pinch.last.dis.time
      const speed = 0.3
      if (Math.abs(vx) > speed || Math.abs(vy) > speed) {
        const time = 200
        let x = pinch.position.x + vx * time
        let y = pinch.position.y + vy * time
        const result = pinch.checkBorder({ x, y }, pinch.scale, { x, y })
        if (result.isDraw) {
          x = result.xpos + vx * 8
          y = result.ypos + vy * 8
        }
        pinch.animation = animate({
          time: time * 2,
          targets: [[pinch.position.x, x], [pinch.position.y, y]],
          type: 'easeOutStrong',
          running: target => {
            pinch.position.x = target[0]
            pinch.position.y = target[1]
            pinch.draw()
          },
          end () {
            pinch.validation()
          }
        })
      }
    }
    pinch.emit('dragend', e)
  }

  proto.pinchstart = function (e) {
    const pinch = this
    const zoom = touchEach(e.touches, function (touch) {
      return { x: touch.clientX, y: touch.clientY }
    })
    const touchCenter = Pinch.getTouchCenter(zoom)
    pinch.last.zoom = zoom
    pinch.last.point = {
      x: (touchCenter.x - pinch.rect.left) * pinch.canvasScale,
      y: (touchCenter.y - pinch.rect.top) * pinch.canvasScale
    }
    pinch.touchDelay = 5
    pinch.emit('pinchstart', e)
  }

  proto.pinchmove = function (e) {
    const pinch = this
    const zoom = touchEach(e.touches, touch => {
      return { x: touch.clientX, y: touch.clientY }
    })
    // 双指的中心点
    const touchCenter = Pinch.getTouchCenter(zoom)
    // 相对于canvas画布的中心点
    const point = {
      x: (touchCenter.x - pinch.rect.left) * pinch.canvasScale,
      y: (touchCenter.y - pinch.rect.top) * pinch.canvasScale
    }
    // 双指两次移动间隔的差值
    const disX = point.x - pinch.last.point.x
    const disY = point.y - pinch.last.point.y
    // 双指两次移动间隔的比例
    const scaleChanged = Pinch.getScale(pinch.last.zoom, zoom)
    pinch.last.zoom = zoom
    pinch.last.point = point
    // 延迟防止手误操作
    if (pinch.touchDelay) {
      pinch.touchDelay--
      return
    }
    pinch.position.x += disX
    pinch.position.y += disY
    pinch.scaleTo(point, pinch.scale * scaleChanged)
    pinch.emit('pinchmove', e)
  }

  proto.emit = function (name) {
    this.observer.emit.apply(this.observer, arguments)
  }

  ;['on', 'off'].forEach(value => {
    proto[value] = function (name, fn) {
      this.observer[value](name, fn && fn.bind(this))
      return this.observer
    }
  })
}

function touchEach (touches, callback) {
  let arr = []
  for (let attr in touches) {
    if (typeof +attr === 'number' && !isNaN(+attr)) {
      arr.push(callback(touches[attr], attr))
    }
  }
  return arr
}

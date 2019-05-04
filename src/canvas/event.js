import { delay, makeArray, noop } from '../util/shared'
import { addListener } from '../util/element'
import { getTouchCenter, getScale } from './helper'

export function initEvent (canvas) {
  canvas.eventList = ['mousewheel', 'touchstart', 'touchmove', 'touchend']
  // 最后一次事件操作的参数
  canvas.last = {
    point: { x: 0, y: 0 },
    move: { x: 0, y: 0 },
    time: 0,
    dis: { time: 0, x: 0, y: 0 }
  }
  canvas.touchDelay = 3
  canvas.animation = { stop: noop }
  canvas.wheeling = false
  canvas.upTime = 0
}

export default {
  bindEvent () {
    const that = this
    const element = that.options.touchTarget || that.canvas

    that.eventList.forEach(eventName => {
      addListener(element, eventName, (that[eventName] = that[eventName].bind(that)), { passive: false })
    })
  },

  removeEvent () {
    const that = this
    const target = that.options.touchTarget || that.canvas

    that.eventList.forEach(eventName => {
      target.removeEventListener(eventName, that[eventName])
    })
  },

  mousewheel (e) {
    e.preventDefault()

    const that = this

    if (that.wheeling) return

    // 降低滚动频率
    delay(() => {
      that.wheeling = false
    }, 30)

    that.wheeling = true

    const STEP = 0.99
    const factor = e.deltaY
    const scaleChanged = Math.pow(STEP, factor)

    that.rect = that.canvas.getBoundingClientRect()
    that.last.point = {
      x: (e.clientX - that.rect.left) * that.canvasRatio,
      y: (e.clientY - that.rect.top) * that.canvasRatio
    }

    that.scaleTo(that.last.point, that.position.scale * scaleChanged)
    that.emit('mousewheel', e)
  },

  touchstart (e) {
    e.preventDefault()

    const that = this
    const touches = e.touches

    that.moved = false
    that.animation.stop()

    if (touches.length === 2) {
      that.pinchstart(e)
    } else if (touches.length === 1) {
      that.dragstart(e)
    }
  },

  touchmove (e) {
    e.preventDefault()

    const that = this
    const touches = e.touches
    that.moved = true

    if (touches.length === 2) {
      that.pinchmove(e)
    } else if (touches.length === 1) {
      that.dragmove(e)
    }
  },

  touchend (e) {
    const that = this
    const touches = e.touches
    const time = Date.now()

    clearTimeout(that.timer)

    if (!that.moved) {
      const dobuleclickTime = 300
      // 模拟双击事件
      if (time - that.upTime <= dobuleclickTime) {
        that.dobuleClick()
      }
    }

    this.upTime = time

    if (touches.length) {
      // pinch end
      that.emit('pinchend', e)
      that.dragstart(e)
    } else {
      // drag end
      that.dragend(e)
    }
  },

  dragstart (e) {
    const that = this
    const touches = e.touches

    that.last.move = {
      x: touches[0].clientX,
      y: touches[0].clientY
    }
    that.last.dis = {
      time: 0,
      x: 0,
      y: 0
    }
    that.last.time = new Date().getTime()
    that.touchDelay = 3
    that.emit('dragstart', e)
  },

  dragmove (e) {
    const that = this
    const touches = e.touches
    const move = {
      x: touches[0].clientX,
      y: touches[0].clientY
    }
    const x = (move.x - that.last.move.x) * that.canvasRatio
    const y = (move.y - that.last.move.y) * that.canvasRatio
    const nowTime = new Date().getTime()

    that.last.dis = {
      x,
      y,
      time: nowTime - that.last.time
    }
    that.last.time = nowTime
    that.last.move = move

    // 延迟防止手误操作
    if (that.touchDelay) {
      that.touchDelay--
      return
    }

    that.moveTo(that.position.x + x, that.position.y + y)
    that.emit('dragmove', e)
  },

  dragend (e) {
    const that = this
    if (!that.moved) return

    const speed = 0.4
    const position = that.position
    const vx = that.last.dis.x / that.last.dis.time
    const vy = that.last.dis.y / that.last.dis.time
    let scale = position.scale

    // 缓冲动画
    if (Math.abs(vx) > speed || Math.abs(vy) > speed) {
      const time = 420
      let x = position.x + vx * time
      let y = position.y + vy * time
      let type = 'easeOutCubic'
      const result = that.validation({ x, y, scale })

      if (result.isDraw) {
        x = result.xpos
        y = result.ypos
        scale = result.scale
        type = 'easeOutBack'
      }

      that.animate(scale, x, y, { type, time: time * 2 })
    } else {
      const result = that.validation()
      if (result.isDraw) {
        that.animate(result.scale, result.xpos, result.ypos)
      }
    }

    that.emit('dragend', e)
  },

  pinchstart (e) {
    const that = this
    const zoom = makeArray(e.touches).map(touch => {
      return { x: touch.clientX, y: touch.clientY }
    })
    const touchCenter = getTouchCenter(zoom)

    that.rect = that.canvas.getBoundingClientRect()
    that.last.zoom = zoom
    that.last.point = {
      x: (touchCenter.x - that.rect.left) * that.canvasRatio,
      y: (touchCenter.y - that.rect.top) * that.canvasRatio
    }
    that.touchDelay = 5

    that.emit('pinchstart', e)
  },

  pinchmove (e) {
    const that = this
    const zoom = makeArray(e.touches).map(touch => {
      return { x: touch.clientX, y: touch.clientY }
    })
    // 双指的中心点
    const touchCenter = getTouchCenter(zoom)
    // 相对于canvas画布的中心点
    const point = {
      x: (touchCenter.x - that.rect.left) * that.canvasRatio,
      y: (touchCenter.y - that.rect.top) * that.canvasRatio
    }
    // 双指两次移动的差值
    const disX = point.x - that.last.point.x
    const disY = point.y - that.last.point.y
    // 双指两次移动间隔的比例
    const scaleChanged = getScale(that.last.zoom, zoom)

    that.last.zoom = zoom
    that.last.point = point

    // 延迟防止手误操作
    if (that.touchDelay) {
      that.touchDelay--
      return
    }

    that.position.x += disX
    that.position.y += disY

    that.scaleTo(point, that.position.scale * scaleChanged)
    that.emit('pinchmove', e)
  },

  dobuleClick () {
    const that = this
    const rect = that.canvas.getBoundingClientRect()
    const { maxScale, minScale } = that.options
    const point = {
      x: (that.last.move.x - rect.left) * that.canvasRatio,
      y: (that.last.move.y - rect.top) * that.canvasRatio
    }
    let scale = that.position.scale
    if (scale < maxScale) {
      scale = maxScale
    } else {
      scale = minScale
    }
    that.scaleTo(point, scale, true, true)
  }
}

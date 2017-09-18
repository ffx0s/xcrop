import animate from '../util/animate'

export function addValidation (Pinch) {
  const proto = Pinch.prototype

  proto.validation = function () {
    const pinch = this
    const options = pinch.options
    const position = pinch.position
    const scale = pinch.scale
    const offsetX = (position.x - pinch.origin.x) * scale
    const offsetY = (position.y - pinch.origin.y) * scale
    const { left, right, top, bottom } = options.offset
    const canvasScale = pinch.canvasScale

    const cropLeft = left * canvasScale
    const cropTop = top * canvasScale

    const w = options.width - (left + right) * canvasScale - (position.width * scale - (cropLeft - offsetX))
    const h = options.height - (top + bottom) * canvasScale - (position.height * scale - (cropTop - offsetY))

    let x = 0
    let y = 0
    let isDraw = false

    if (offsetX >= cropLeft) {
      x = -(offsetX - cropLeft) / scale
      pinch.origin.x -= x
      isDraw = true
    } else if (w > 0) {
      x = w / scale
      pinch.origin.x -= x
      isDraw = true
    }

    if (offsetY >= cropTop) {
      y = -(offsetY - cropTop) / scale
      pinch.origin.y -= y
      isDraw = true
    } else if (h > 0) {
      y = h / scale
      pinch.origin.y -= y
      isDraw = true
    }

    function initLastAnimate () {
      pinch.lastAnimate = { x: 0, y: 0 }
    }

    if (isDraw) {
      initLastAnimate()
      animate({
        targets: [[0, x], [0, y]],
        time: 150,
        running: pinch._animate.bind(pinch),
        end () {
          pinch.isLock = false
          initLastAnimate()
        }
      })
    }
  }

  proto.vaildMaxScale = function (scale) {
    return (scale || this.scale) < this.options.maxScale
  }

  proto.vaildMinScale = function (scale) {
    return (scale || this.scale) > this.options.minScale
  }

  proto._animate = function (target) {
    const pinch = this
    const last = pinch.lastAnimate

    pinch.isLock = true
    pinch.context.translate(target[0] - last.x, target[1] - last.y)
    pinch.draw()
    pinch.lastAnimate = { x: target[0], y: target[1] }
  }
}

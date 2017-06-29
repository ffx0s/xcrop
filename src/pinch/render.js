import { imgCover, imageToCanvas } from '../util/image'

export function initRender (pinch) {
  pinch.scale = 1
  pinch.lastScale = 1
  pinch.origin = { x: 0, y: 0 }
}

export function render (pinch) {
  const options = pinch.options

  options.el = typeof options.el === 'string' ? document.querySelector(options.el) : options.el
  pinch.canvas = pinch.createCanvas()
  pinch.context = pinch.canvas.getContext('2d')

  getCanvasRect(function (rect) {
    pinch.rect = rect
    pinch.canvasScale = options.width / pinch.rect.width
    pinch.load(options.target, function () {
      options.el.appendChild(pinch.canvas)
    })
  })

  function getCanvasRect (callback) {
    let canvas = pinch.createCanvas()
    options.el.appendChild(canvas)
    setTimeout(() => {
      const rect = canvas.getBoundingClientRect()
      options.el.removeChild(canvas)
      canvas = null
      callback(rect)
    }, 10)
  }
}

export function addRender (Pinch) {
  const proto = Pinch.prototype

  proto.createCanvas = function () {
    const pinch = this
    const canvas = document.createElement('canvas')

    canvas.width = pinch.options.width
    canvas.height = pinch.options.height
    canvas.style.cssText = 'width:100%;height:100%;'

    return canvas
  }

  proto.load = function (target, callback) {
    const pinch = this

    imageToCanvas(target, success, { maxWidth: pinch.options.maxTargetWidth, maxHeight: pinch.options.maxTargetHeight })

    function success (canvas) {
      const { width, height, offset, loaded } = pinch.options
      const scale = pinch.canvasScale
      const pinchWidth = width - (offset.left + offset.right) * scale
      const pinchHeight = height - (offset.top + offset.bottom) * scale
      pinch.position = imgCover(canvas.width, canvas.height, pinchWidth, pinchHeight)
      pinch.position.x += offset.left * scale
      pinch.position.y += offset.top * scale
      pinch.imageCanvas = canvas
      pinch.draw()
      callback && callback()
      loaded.call(pinch)
    }
  }

  proto.remove = function () {
    const pinch = this
    const target = pinch.options.touchTarget || pinch.canvas

    pinch.eventList.forEach(value => {
      target.removeEventListener(value, pinch, false)
    })

    pinch.options.el.removeChild(pinch.canvas)
  }

  proto.draw = function () {
    const pinch = this
    const options = pinch.options
    const context = pinch.context
    let { x, y, width, height } = pinch.position

    context.save()
    context.setTransform(1, 0, 0, 1, 0, 0)
    context.clearRect(0, 0, options.width, options.height)
    context.restore()
    context.drawImage(pinch.imageCanvas, x, y, width, height)
  }

  proto.moveTo = function (_x, _y) {
    const pinch = this
    const x = _x - (pinch.position.x - pinch.origin.x)
    const y = _y - (pinch.position.y - pinch.origin.y)

    pinch.context.translate(x, y)
    pinch.origin.x -= x
    pinch.origin.y -= y
    pinch.draw()
  }

  /**
   * 图片缩放函数，以point点为中心（以左上角为原点（不是以裁剪框为原点））进行缩放.
   * @param {object} point - 坐标点.
   * @property {number} point.x - x坐标.
   * @property {number} point.y - y坐标.
   * @param {number} zoom - 缩放比例.
   */

  proto.scaleTo = function (point, zoom) {
    const pinch = this
    const context = pinch.context
    const speed = pinch.canvasScale
    const scale = pinch.scale
    const origin = pinch.origin

    if ((zoom > 1 && !pinch.vaildMaxScale()) || (zoom < 1 && !pinch.vaildMinScale())) {
      return false
    }

    if (!pinch.vaildMaxScale(scale * zoom)) {
      zoom = pinch.options.maxScale / scale
    } else if (!pinch.vaildMinScale(scale * zoom)) {
      zoom = pinch.options.minScale / scale
    }

    context.translate(origin.x, origin.y)
    pinch.origin.x -= point.x * speed / (scale * zoom) - point.x * speed / scale
    pinch.origin.y -= point.y * speed / (scale * zoom) - point.y * speed / scale
    context.scale(zoom, zoom)
    context.translate(-pinch.origin.x, -pinch.origin.y)
    pinch.scale *= zoom

    pinch.draw()
  }
}

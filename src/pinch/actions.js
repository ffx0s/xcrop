import { imgCover, imageToCanvas } from '../util/image'
import animate from '../util/animate'

export function initActions (pinch) {
  // 缩放比例
  pinch.scale = 1
  // 图片缩放原点坐标
  pinch.firstOrigin = { x: 0, y: 0 }
  // 图片相对于canvas的坐标
  pinch.position = { x: 0, y: 0, width: 0, height: 0 }
  // 图片数据
  pinch.image = { width: 0, height: 0, el: null }
}

export function addActions (Pinch) {
  const proto = Pinch.prototype

  // 加载目标图片
  proto.load = function (target, callback) {
    const pinch = this
    const { width, height, offset, loaded, maxTargetWidth, maxTargetHeight, maxScale } = pinch.options

    imageToCanvas(target, success, { maxWidth: maxTargetWidth, maxHeight: maxTargetHeight })

    function success (canvas) {
      // image.el为原目标图片的canvas版本，后续画布drawImage会用到
      const image = { el: canvas, width: canvas.width, height: canvas.height }
      // 减去偏移量获得实际容器的大小
      const pinchWidth = width - (offset.left + offset.right)
      const pinchHeight = height - (offset.top + offset.bottom)
      // 通过imgCover实现图片铺满容器，返回图片的坐标位置
      pinch.position = imgCover(image.width, image.height, pinchWidth, pinchHeight)
      // 需要加上偏移量
      pinch.position.x += offset.left
      pinch.position.y += offset.top
      // 图片缩放比例
      pinch.scale = pinch.position.width / image.width
      // 图片尺寸比画布小时，修正最大比例和最小比例
      const _maxScale = Math.max(pinch.scale, maxScale)
      const _minScale = pinch.scale
      pinch.options.maxScale = _maxScale === _minScale ? pinch.scale * Math.max(maxScale, 1) : maxScale
      pinch.options.minScale = _minScale
      pinch.image = image
      // 图片原点
      pinch.firstOrigin = {
        x: pinch.position.x,
        y: pinch.position.y
      }
      pinch.draw()
      setTimeout(() => {
        callback && callback()
        loaded.call(pinch)
      })
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
    const { x, y } = pinch.position

    context.clearRect(0, 0, options.width, options.height)
    context.save()
    pinch.context.translate(x, y)
    context.scale(pinch.scale, pinch.scale)
    context.drawImage(pinch.image.el, 0, 0, pinch.image.width, pinch.image.height)
    context.restore()
  }

  proto.moveTo = function (xpos, ypos, transition) {
    const pinch = this
    if (transition) {
      pinch.animate(pinch.scale, xpos, ypos)
    } else {
      pinch.position.x = xpos
      pinch.position.y = ypos
      pinch.draw()
    }
  }

  /**
   * 图片缩放函数，以point点为中心点进行缩放
   * @param {object} point 坐标点
   * @property {number} point.x x坐标
   * @property {number} point.y y坐标
   * @param {number} zoom 缩放比例
   */

  proto.scaleTo = function (point, scale) {
    const pinch = this
    if (scale === pinch.scale) return
    const scaleChanged = (scale / pinch.scale)
    const { x, y } = Pinch.calculate(pinch.position, pinch.firstOrigin, point, scale / scaleChanged, scaleChanged)
    pinch.scale = scale
    pinch.moveTo(x, y)
  }

  proto.animate = function (scale, xpos, ypos) {
    const pinch = this
    pinch.animation = animate({
      targets: [[pinch.scale, scale], [pinch.position.x, xpos], [pinch.position.y, ypos]],
      time: 450,
      type: 'easeOutCubic',
      running: target => {
        pinch.scale = target[0]
        pinch.position.x = target[1]
        pinch.position.y = target[2]
        pinch.draw()
      }
    })
  }
}

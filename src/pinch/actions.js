import { imgCover, imageToCanvas } from '../util/image'
import { setStyle } from '../util/element'
import animate from '../util/animate'

export function initActions (pinch) {
  // 缩放比例
  pinch.scale = 1
  // 图片缩放原点坐标
  pinch.firstOrigin = { x: 0, y: 0 }
  // 图片大小与位置
  pinch.position = { x: 0, y: 0, width: 0, height: 0 }
  // 原图数据
  pinch.originImage = { width: 0, height: 0, el: null }
}

export function addActions (Pinch) {
  const proto = Pinch.prototype

  // 加载目标图片
  proto.load = function (target, callback) {
    const pinch = this
    const {
      width, height, offset,
      maxTargetHeight, maxTargetWidth
    } = pinch.options

    imageToCanvas(target, success, {
      maxWidth: maxTargetWidth,
      maxHeight: maxTargetHeight,
      errorCallback (error) {
        pinch.emit('error', error)
      }
    })

    function success (canvas) {
      // 原图信息
      const originImage = {
        el: canvas,
        width: canvas.width,
        height: canvas.height
      }
      // 减去偏移量获得实际容器的大小
      const pinchWidth = width - (offset.left + offset.right)
      const pinchHeight = height - (offset.top + offset.bottom)
      // 图片铺满容器，返回图片的坐标位置
      pinch.position = imgCover(originImage.width, originImage.height, pinchWidth, pinchHeight)
      // 需要加上偏移量
      pinch.position.x += offset.left
      pinch.position.y += offset.top
      pinch.originImage = originImage
      // 图片原点
      pinch.firstOrigin = {
        x: pinch.position.x,
        y: pinch.position.y
      }
      pinch.image.src = pinch.originImage.el.toDataURL('image/jpeg')
      setStyle(pinch.image, {
        width: pinch.position.width + 'px',
        height: pinch.position.height + 'px'
      })
      pinch.render()
      pinch.draw()
      setTimeout(() => {
        callback && callback.call(pinch)
        pinch.emit('loaded', pinch)
      })
    }
    return this
  }

  proto.remove = function () {
    const pinch = this
    const target = pinch.options.touchTarget || pinch.canvas

    pinch.events.forEach(value => {
      target.removeEventListener(value, pinch, false)
    })

    pinch.options.el.removeChild(pinch.canvas)
  }

  proto.draw = function () {
    const pinch = this
    const { x, y } = pinch.position
    setStyle(pinch.canvas, {
      transform: `translate3d(${x}px, ${y}px, 0) scale(${pinch.scale})`
    })
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

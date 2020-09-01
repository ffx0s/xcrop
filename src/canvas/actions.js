import animate from '../util/animate'
import { imgCover, imageToCanvas } from '../util/image'
import { clearCanvas } from '../util/canvas'
import { delay } from '../util/shared'
import { isInPage } from '../util/element'
import { calculate, toFixed } from './helper'

export function initActions (canvas) {
  // 图片相对于canvas的坐标
  canvas.position = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    scale: 1
  }
  // 图片数据
  canvas.image = {
    width: 0,
    height: 0,
    el: null
  }
}

export default {
  load (target, callback) {
    const successCallback = canvas => {
      this.initImageData(canvas)
      this.draw()
      this.renderAction()

      delay(() => {
        callback && callback()
        this.emit('loaded', this)
      })
    }
    const errorCallback = error => {
      this.emit('error', error)
    }

    imageToCanvas(target, successCallback, { errorCallback })
  },

  initImageData (canvas) {
    const that = this
    const {
      width, height, offset, maxScale
    } = that.options
    const image = {
      el: canvas,
      width: canvas.width,
      height: canvas.height
    }

    // 减去偏移量获得实际容器的大小
    const canvasWidth = width - (offset.left + offset.right)
    const canvasHeight = height - (offset.top + offset.bottom)

    // 通过imgCover实现图片铺满容器，返回图片的坐标位置
    const position = imgCover(image.width, image.height, canvasWidth, canvasHeight)

    // 需要加上偏移量
    position.x += offset.left
    position.y += offset.top

    // 图片尺寸比画布小时，修正最大比例和最小比例
    const _maxScale = Math.max(position.scale, maxScale)
    const _minScale = position.scale

    that.options.maxScale = _maxScale === _minScale ? position.scale * Math.max(maxScale, 1) : maxScale
    that.options.minScale = _minScale
    that.position = position
    that.image = image
  },

  destroy () {
    const that = this

    that.removeEvent()

    if (isInPage(that.canvas)) {
      that.options.el.removeChild(that.canvas)
    }
  },

  draw () {
    const that = this
    const context = that.context
    const { width, height } = that.options
    const { x, y, scale } = that.position

    clearCanvas(that.canvas, context, width, height)
    context.save()
    context.translate(x, y)
    context.scale(scale, scale)
    context.drawImage(that.image.el, 0, 0)
    context.restore()
  },

  setData (data) {
    const that = this
    const digits = { x: 1, y: 1, scale: 4 }

    // eslint-disable-next-line no-unused-vars
    for (const prop in data) {
      that.position[prop] = toFixed(data[prop], digits[prop])
    }
  },

  moveTo (x, y, transition) {
    const that = this

    if (transition) {
      that.animate(x, y, that.position.scale)
    } else {
      that.setData({ x, y })
      that.draw()
    }
  },

  /**
   * 图片缩放，以point点为中心点进行缩放
   * @param {object} point 坐标点
   * @property {number} point.x x坐标
   * @property {number} point.y y坐标
   * @param {number} scale 缩放比例
   * @param {Boolean} transition 是否动画过渡 默认无
   * @param {Boolean} check 超出范围是否修正图片位置
   */
  scaleTo (point, scale, transition, check) {
    const that = this
    const currentScale = that.position.scale
    if (scale === currentScale) return

    let { x, y } = calculate(that.position, point, scale)
    if (check) {
      const result = that.checkPosition({ x, y, scale })
      x = result.x
      y = result.y
    }

    if (transition) {
      that.animate(x, y, scale)
    } else {
      that.setData({ scale })
      that.moveTo(x, y)
    }
  },

  animate (x, y, scale, options = { time: 450, type: 'easeOutCubic' }) {
    const that = this

    that.animation.stop()
    that.animation = animate({
      targets: [
        [that.position.scale, scale],
        [that.position.x, x],
        [that.position.y, y]
      ],
      time: options.time,
      type: options.type,
      running: target => {
        that.setData({
          scale: target[0],
          x: target[1],
          y: target[2]
        })
        that.draw()
      }
    })
  }
}

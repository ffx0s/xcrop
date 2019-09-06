import { calculate } from './helper'

export default {
  validation (position, isDraw, transition = true) {
    const that = this
    position = position || that.position
    const { maxScale, minScale } = that.options
    let scale = position.scale
    let result = {
      x: position.x,
      y: position.y,
      isDraw: false
    }
    const setScale = function (newScale) {
      const { x, y } = calculate(position, that.last.point, newScale)

      result = that.checkPosition({ x, y, scale: newScale })
      result.scale = newScale
      result.isDraw = true
    }

    // 缩放比例判断
    if (scale > maxScale) {
      setScale(maxScale)
    } else if (scale < minScale) {
      setScale(minScale)
    } else {
      result = that.checkPosition(position)
      result.scale = scale
    }

    if (isDraw && result.isDraw) {
      if (transition) {
        that.animate(result.x, result.y, result.scale)
      } else {
        that.setData({ x: result.x, y: result.y, scale: result.scale })
        that.draw()
      }
    }

    return result
  },

  /**
   * 判断图片是否超出可视区，返回矫正后的位置
   * @param {Object} position {x, y, scale}图片当前位置
   */
  checkPosition ({ x, y, scale }) {
    const that = this
    const { width, height, offset } = that.options
    const imageWidth = scale * that.image.width
    const imageHeight = scale * that.image.height
    const w = width - (offset.left + offset.right) - (imageWidth - (offset.left - x))
    const h = height - (offset.top + offset.bottom) - (imageHeight - (offset.top - y))
    let isDraw = false

    if (y > offset.top) {
      // top
      y = offset.top
      isDraw = true
    } else if (h > 0) {
      // bottom
      y = y + h
      isDraw = true
    }

    if (x > offset.left) {
      // left
      x = offset.left
      isDraw = true
    } else if (w > 0) {
      // right
      x = x + w
      isDraw = true
    }

    return {
      x,
      y,
      isDraw
    }
  }
}

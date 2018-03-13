import { calculate } from './helper'

export default {
  validation () {
    const that = this
    const { maxScale, minScale } = that.options
    let scale = that.position.scale
    let result = {
      xpos: that.position.x,
      ypos: that.position.y,
      isDraw: false
    }

    // 缩放比例判断
    if (scale > maxScale) {
      setScale(maxScale)
    } else if (scale < minScale) {
      setScale(minScale)
    } else {
      result = that.checkBorder(that.position, scale, that.position)
    }

    function setScale (newScale) {
      const scaleChanged = (newScale / that.position.scale)
      const { x, y } = calculate(that.position, that.firstOrigin, that.last.point, scale, scaleChanged)

      scale = newScale
      result = that.checkBorder({ x, y }, newScale, { x, y })
      result.isDraw = true
    }

    if (result.isDraw) {
      that.animate(scale, result.xpos, result.ypos)
    }

    return result.isDraw
  },

  /**
   * 边界值判断
   * @param {Object} curPos 当前位置
   * @param {Number} scale 目标比例
   * @param {Object} position 目标位置
   */
  checkBorder (curPos, scale, position) {
    const that = this
    const { width, height, offset } = that.options
    const imageWidth = scale * that.image.width
    const imageHeight = scale * that.image.height
    const w = width - (offset.left + offset.right) - (imageWidth - (offset.left - position.x))
    const h = height - (offset.top + offset.bottom) - (imageHeight - (offset.top - position.y))
    let xpos = curPos.x
    let ypos = curPos.y
    let isDraw = false

    if (ypos > offset.top) {
      // top
      ypos = offset.top
      isDraw = true
    } else if (h > 0) {
      // bottom
      ypos = ypos + h
      isDraw = true
    }

    if (xpos > offset.left) {
      // left
      xpos = offset.left
      isDraw = true
    } else if (w > 0) {
      // right
      xpos = xpos + w
      isDraw = true
    }

    return {
      xpos,
      ypos,
      isDraw
    }
  }
}

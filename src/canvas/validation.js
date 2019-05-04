import { calculate } from './helper'

export default {
  validation (position) {
    const that = this
    position = position || that.position
    const { maxScale, minScale } = that.options
    let scale = position.scale
    let result = {
      xpos: position.x,
      ypos: position.y,
      isDraw: false
    }

    // 缩放比例判断
    if (scale > maxScale) {
      setScale(maxScale)
    } else if (scale < minScale) {
      setScale(minScale)
    } else {
      result = that.checkBorder(position, scale, position)
      result.scale = scale
    }

    function setScale (newScale) {
      const { x, y } = calculate(position, that.last.point, newScale)

      result = that.checkBorder({ x, y }, newScale, { x, y })
      result.scale = newScale
      result.isDraw = true
    }

    return result
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

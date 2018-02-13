export function addValidation (Pinch) {
  const proto = Pinch.prototype

  proto.validation = function () {
    const pinch = this
    const { maxScale, minScale } = pinch.options
    let scale = pinch.scale
    let result = { xpos: pinch.position.x, ypos: pinch.position.y, isDraw: false }
    // 缩放比例判断
    if (scale > maxScale) {
      setScale(maxScale)
    } else if (scale < minScale) {
      setScale(minScale)
    } else {
      result = pinch.checkBorder(pinch.position, scale, pinch.position)
    }
    function setScale (newScale) {
      const scaleChanged = (newScale / pinch.scale)
      const { x, y } = Pinch.calculate(pinch.position, pinch.firstOrigin, pinch.last.point, scale, scaleChanged)
      scale = newScale
      result = pinch.checkBorder({ x, y }, newScale, { x, y })
      result.isDraw = true
    }

    if (result.isDraw) {
      pinch.animate(scale, result.xpos, result.ypos)
    }
    return result.isDraw
  }

  /**
   * 边界值判断
   * @param {Object} curPos 当前位置
   * @param {Number} scale 目标比例
   * @param {Object} position 目标位置
   */
  proto.checkBorder = function (curPos, scale, position) {
    const pinch = this
    const { width, height, offset } = pinch.options
    const imageWidth = scale * pinch.image.width
    const imageHeight = scale * pinch.image.height
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

function sum (a, b) {
  return a + b
}

/**
 * 获取两个点的中心
 * @param {Array} vectors 点
 */
export function getTouchCenter (vectors) {
  return {
    x: vectors.map(v => v.x).reduce(sum) / vectors.length,
    y: vectors.map(v => v.y).reduce(sum) / vectors.length
  }
}

// 获取点距离
export function getDistance (p1, p2, props) {
  props = props || ['x', 'y']

  const x = p2[props[0]] - p1[props[0]]
  const y = p2[props[1]] - p1[props[1]]

  return Math.sqrt((x * x) + (y * y))
}

/**
 * 通过两点距离计算比例
 * @param {Array} start 起始点
 * @param {Array} end 结束点
 */
export function getScale (start, end) {
  return getDistance(end[0], end[1]) / getDistance(start[0], start[1])
}

/**
 * 以指定点坐标为原点进行缩放，计算缩放后位置的函数，返回缩放后的{x,y,scale}
 * @param {Object} current 当前物体坐标{x,y,scale}
 * @param {Object} point 缩放原点{x,y}
 * @param {Number} scale 目标比例
 */
export function calculate (current, point, scale) {
  // 指定原点座标与当前物体的距离
  const distanceX = point.x - current.x
  const distanceY = point.y - current.y

  const scaleChanged = 1 - scale / current.scale
  const x = current.x + distanceX * scaleChanged
  const y = current.y + distanceY * scaleChanged

  return {
    x,
    y,
    scale
  }
}

/**
 * 创建一个宽高为100%的画布
 * @param {Number} width 画布宽度
 * @param {Number} height 画布高度
 * @returns {Element} canvas
 */
export function createCanvas (width, height) {
  const canvas = document.createElement('canvas')

  canvas.width = width
  canvas.height = height
  canvas.style.cssText = 'width:100%;height:100%;'

  return canvas
}

export function toFixed (number, digits) {
  return +number.toFixed(digits)
}

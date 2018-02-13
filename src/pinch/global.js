import Observer from '../util/observer'

function sum (a, b) {
  return a + b
}

/**
 * 获取两个点的中心
 * @param {Array} vectors 点
 */
function getTouchCenter (vectors) {
  return {
    x: vectors.map(v => v.x).reduce(sum) / vectors.length,
    y: vectors.map(v => v.y).reduce(sum) / vectors.length
  }
}

// 获取点距离
function getDistance (p1, p2, props) {
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
function getScale (start, end) {
  return getDistance(end[0], end[1]) / getDistance(start[0], start[1])
}

/**
 * 以点坐标为原点计进行缩放，计算缩放后位置的函数，返回缩放后的x,y,scale值
 * https://stackoverflow.com/questions/48097552/how-to-zoom-on-a-point-with-javascript
 * @param {Object} currentOrigin 当前原点坐标
 * @param {Object} firstOrigin 第一次缩放时的原点坐标
 * @param {Object} point 缩放点
 * @param {Number} scale 当前比例
 * @param {Number} scaleChanged 每次缩放的比例系数
 */
function calculate (currentOrigin, firstOrigin, point, scale, scaleChanged) {
  // 鼠标坐标与当前原点的距离
  const distanceX = point.x - currentOrigin.x
  const distanceY = point.y - currentOrigin.y
  // 新原点坐标
  const newOriginX = currentOrigin.x + distanceX * (1 - scaleChanged)
  const newOriginY = currentOrigin.y + distanceY * (1 - scaleChanged)
  const offsetX = newOriginX - firstOrigin.x
  const offsetY = newOriginY - firstOrigin.y
  return {
    scale: scale * scaleChanged,
    x: firstOrigin.x + offsetX,
    y: firstOrigin.y + offsetY
  }
}

export default function (Pinch) {
  Pinch.getTouchCenter = getTouchCenter
  Pinch.getDistance = getDistance
  Pinch.getScale = getScale
  Pinch.calculate = calculate
  Pinch.Observer = Observer
}

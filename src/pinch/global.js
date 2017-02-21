import Observer from '../util/observer'

function sum (a, b) {
  return a + b
}

function getTouchCenter (vectors) {
  return {
    x: vectors.map(v => v.x).reduce(sum) / vectors.length,
    y: vectors.map(v => v.y).reduce(sum) / vectors.length
  }
}

function getDistance (p1, p2, props) {
  props = props || ['x', 'y']

  const x = p2[props[0]] - p1[props[0]]
  const y = p2[props[1]] - p1[props[1]]
  return Math.sqrt((x * x) + (y * y))
}

function getScale (start, end) {
  return getDistance(end[0], end[1]) / getDistance(start[0], start[1])
}

export default function (Pinch) {
  Pinch.getTouchCenter = getTouchCenter
  Pinch.getDistance = getDistance
  Pinch.getScale = getScale
  Pinch.Observer = Observer
}

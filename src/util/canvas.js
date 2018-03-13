/**
 * 缩放画布
 * @param {Element} canvas 画布
 * @param {Number} scale 比例
 */
export function scaleCanvas (canvas, scale) {
  const newCanvas = document.createElement('canvas')
  const ctx = newCanvas.getContext('2d')
  const width = canvas.width
  const height = canvas.height

  newCanvas.width = width * scale
  newCanvas.height = height * scale

  ctx.drawImage(canvas, 0, 0, width, height, 0, 0, newCanvas.width, newCanvas.height)

  return newCanvas
}

/**
 * 复制 canvas
 * @param {Element} canvas 画布
 */
export function copyCanvas (canvas) {
  const newCanvas = document.createElement('canvas')

  newCanvas.width = canvas.width
  newCanvas.height = canvas.height
  newCanvas.getContext('2d').drawImage(canvas, 0, 0)

  return newCanvas
}

/**
 * 处理大图缩小有锯齿的问题
 * @param {Element} canvas 画布
 * @param {Number} scale 比例
 */
export function antialisScale (canvas, scale) {
  let originCanvas = copyCanvas(canvas)
  let ctx = originCanvas.getContext('2d')
  const newCanvas = document.createElement('canvas')
  const newCtx = newCanvas.getContext('2d')

  const sourceWidth = originCanvas.width
  const sourceHeight = originCanvas.height
  const width = Math.ceil(sourceWidth * scale)
  const height = Math.ceil(sourceHeight * scale)

  newCanvas.width = width
  newCanvas.height = height

  // 缩小操作的次数
  const steps = Math.ceil(Math.log(sourceWidth / width) / Math.log(3))
  const value = 0.5

  // 缩小操作
  // 进行steps次的减半缩小
  for (let i = 0; i < steps; i++) {
    ctx.drawImage(
      originCanvas,
      0,
      0,
      sourceWidth * value,
      sourceHeight * value
    )
  }
  // 放大操作
  // 进行steps次的两倍放大
  newCtx.drawImage(
    originCanvas,
    0,
    0,
    originCanvas.width * Math.pow(value, steps),
    originCanvas.height * Math.pow(value, steps),
    0,
    0,
    width,
    height
  )

  ctx = null
  originCanvas = null

  return newCanvas
}

/**
 * 裁剪
 */
export function drawImage (target, sx, sy, swidth, sheight, x, y, width, height) {
  const canvas = document.createElement('canvas')

  const _width = canvas.width = Math.floor(width)
  const _height = canvas.height = Math.floor(height)

  canvas.getContext('2d').drawImage(
    target,
    Math.floor(sx),
    Math.floor(sy),
    Math.floor(swidth),
    Math.floor(sheight),
    Math.floor(x),
    Math.floor(y),
    _width,
    _height
  )

  return canvas
}

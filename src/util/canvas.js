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

export function antialisScale (canvas, scale) {
  const newCanvas = document.createElement('canvas')
  const newCtx = newCanvas.getContext('2d')
  const ctx = canvas.getContext('2d')

  const sourceWidth = canvas.width
  const sourceHeight = canvas.height
  const width = sourceWidth * scale
  const height = sourceHeight * scale

  newCanvas.width = width
  newCanvas.height = height

  // 缩小操作的次数
  const steps = Math.ceil(Math.log(sourceWidth / width) / Math.log(2))

  // 缩小操作
  // 进行steps次的减半缩小
  for (let i = 0; i < steps; i++) {
    ctx.drawImage(canvas, 0, 0, sourceWidth * 0.5, sourceHeight * 0.5)
  }
  // 放大操作
  // 进行steps次的两倍放大
  newCtx.drawImage(canvas, 0, 0, canvas.width * Math.pow(0.5, steps), canvas.height * Math.pow(0.5, steps), 0, 0, width, height)

  return newCanvas
}

export function canvasTextAutoLine (str, canvas, initX, initY, lineHeight, letterSpacing, targetTextWidth) {
  const ctx = canvas.getContext('2d')
  let lineWidth = 0
  for (let i = 0; i < str.length; i++) {
    const curTextWidth = ctx.measureText(str[i]).width + letterSpacing
    ctx.fillText(str[i], initX + lineWidth, initY)
    lineWidth += curTextWidth
    if (lineWidth > targetTextWidth) {
      initY += lineHeight
      lineWidth = 0
    }
  }
}

export function initRender (pinch) {
  pinch.canvas = createCanvas(pinch.options.width, pinch.options.height)
  pinch.context = pinch.canvas.getContext('2d')
}

export function addRender (Pinch) {
  const proto = Pinch.prototype

  proto.render = function () {
    const pinch = this
    const options = pinch.options
    options.el = typeof options.el === 'string' ? document.querySelector(options.el) : options.el
    options.el.appendChild(pinch.canvas)
    // 获取canvas位于html里实际的大小
    pinch.rect = pinch.canvas.getBoundingClientRect()
    // 利用canvas的宽度和实际的宽度作为它的大小比例
    pinch.canvasScale = options.width / pinch.rect.width
  }
}

/**
 * 创建一个宽高为100%的画布
 * @param {Number} width 画布宽度
 * @param {Number} height 画布高度
 */
function createCanvas (width, height) {
  const canvas = document.createElement('canvas')

  canvas.width = width
  canvas.height = height
  canvas.style.cssText = 'width:100%;height:100%;'

  return canvas
}

import { setStyle } from '../util/element'

export function initRender (pinch) {
  const { width, height } = pinch.options
  const wrap = document.createElement('div')
  const canvas = document.createElement('div')
  const image = new window.Image()

  setStyle(wrap, {
    position: 'absolute',
    width: width + 'px',
    height: height + 'px',
    overflow: 'hidden'
  })
  setStyle(canvas, {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
    transformOrigin: 'left top',
    touchAction: 'none'
  })
  setStyle(image, {
    position: 'absolute',
    width: '100%'
  })
  canvas.appendChild(image)
  wrap.appendChild(canvas)
  // 是否需要图片遮罩层，防止微信保存图片菜单弹起
  if (pinch.options.imageMask) {
    const imageMask = document.createElement('div')
    setStyle(imageMask, {
      position: 'absolute',
      top: 0,
      width: '100%',
      height: '100%'
    })
    canvas.appendChild(imageMask)
  }
  pinch.wrap = wrap
  pinch.canvas = canvas
  pinch.image = image
  pinch.isRender = false
}

export function addRender (Pinch) {
  const proto = Pinch.prototype

  proto.render = function () {
    const pinch = this
    if (pinch.isRender) return
    pinch.options.el.appendChild(pinch.wrap)
    // 获取容器大小
    pinch.rect = pinch.wrap.getBoundingClientRect()
    // 利用canvas的宽度和实际的宽度作为它的大小比例
    pinch.canvasScale = pinch.options.width / pinch.rect.width
    pinch.isRender = true
    pinch.bindEvent()
  }
}

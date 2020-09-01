import './crop.css'
import template from './template'
import Canvas from '../canvas/index'
import { extendDeep, makeArray, objectAssign, isNumber, browser } from '../util/shared'
import { dataURItoBlob, URL } from '../util/file'
import { antialisScale, drawImage } from '../util/canvas'
import { imageToCanvas } from '../util/image'
import { setStyle, setClass, isInPage, addListener, removeListener } from '../util/element'

const viewWidth = document.documentElement.clientWidth
const viewHeight = document.documentElement.clientHeight
const borderSize = Math.min(viewWidth, viewHeight) * 0.9

class Crop {
  // 默认选项
  static defaults = {
    // 容器宽度
    viewWidth,
    // 容器高度
    viewHeight,
    // 插入节点
    el: document.body,
    // 裁剪框大小
    border: {
      width: borderSize,
      height: borderSize
    },
    // 裁剪框是否为圆形，仅样式改变，裁剪后输出的图片依然是矩形，不支持安卓4.1以下版本
    circle: false,
    // 允许缩放的最大比例
    maxScale: 2,
    // 画布比例
    canvasRatio: 2,
    // 按钮文字
    confirmText: '确认',
    cancleText: '取消',
    // 显示隐藏类名
    beforeShowClass: 'crop_slide-to-right',
    beforeHideClass: 'crop_slide-to-bottom'
  }

  constructor (options = {}) {
    const crop = this

    crop.options = extendDeep({}, Crop.defaults, options)
    crop.border = crop.options.border
    crop.elements = {}
    crop.isHide = true

    crop.init()
  }

  init () {
    this.initElement()
    this.initCanvas()
    this.initEvent()
  }

  initElement () {
    const crop = this
    const { viewWidth, viewHeight } = crop.options
    const element = document.createElement('div')

    element.innerHTML = template(crop.options)

    // 取出带有标记的节点元素
    makeArray(element.querySelectorAll('*')).forEach(el => {
      const name = el.getAttribute('data-el')
      if (name) {
        crop.elements[name] = el
      }
    })

    setStyle(crop.elements.container, {
      width: viewWidth,
      height: viewHeight
    })
    setClass(crop.elements.container, { add: Crop.CROP_HIDE_CLASS })

    crop.setBorder(crop.border)
  }

  initCanvas () {
    const crop = this
    const { canvasRatio, maxScale, viewWidth, viewHeight } = crop.options
    const canvasOptions = {
      maxScale,
      canvasRatio,
      el: crop.elements.container,
      touchTarget: crop.elements.zoom,
      width: viewWidth * canvasRatio,
      height: viewHeight * canvasRatio,
      offset: crop.canvasOffset
    }

    crop.canvas = new Canvas(canvasOptions)
  }

  initEvent () {
    const crop = this
    crop.onClick = crop.onClick.bind(crop)
    crop.transitionend = crop.transitionend.bind(crop)

    crop.canvas.on('loaded', crop.render.bind(crop), true)
    crop.canvas.on('loaded', crop.show.bind(crop))
    addListener(crop.elements.container, 'click', crop.onClick)
    addListener(crop.elements.container, 'transitionend', crop.transitionend)
    addListener(crop.elements.container, 'webkitTransitionEnd', crop.transitionend)
  }

  load (target) {
    this.canvas.load(target)
  }

  onClick (e) {
    const eventName = e.target.getAttribute('data-click')
    eventName && this[eventName] && this[eventName]()
  }

  onCancle () {
    this.emit('cancle', this)
  }

  onConfirm () {
    this.emit('confirm', this)
  }

  transitionend (e) {
    const crop = this
    const target = e.target

    if (target === crop.elements.container && crop.isHide) {
      setClass(target, {
        add: Crop.CROP_HIDE_CLASS,
        remove: crop.options.beforeHideClass
      })
    }
  }

  render () {
    this.options.el.appendChild(this.elements.container)
  }

  get (options) {
    const crop = this

    crop.canvas.validation(null, true, false)

    const { canvasRatio } = crop.options
    const { scale, x, y } = crop.canvas.position
    const clipWidth = crop.border.width * canvasRatio / scale
    const clipHeight = crop.border.height * canvasRatio / scale
    let clipX = (crop.border.x * canvasRatio - x) / scale
    if (clipX < 0) {
      clipX = 0
    }
    let clipY = (crop.border.y * canvasRatio - y) / scale
    if (clipY < 0) {
      clipY = 0
    }
    const count = 3
    let canvas

    options = objectAssign({
      width: clipWidth,
      height: clipHeight,
      type: 'image/jpeg',
      format: 'base64',
      quality: 0.85
    }, options || {})

    const clipScale = options.width / clipWidth
    const antialiasing = Math.ceil(Math.log(clipWidth / (clipWidth * clipScale)) / Math.log(count)) >= count
    const _drawImage = (w, h) => {
      return drawImage(
        crop.canvas.image.el,
        clipX,
        clipY,
        clipWidth,
        clipHeight,
        0,
        0,
        w,
        h
      )
    }

    // 是否需要对图片执行抗锯齿处理
    if (antialiasing) {
      canvas = antialisScale(_drawImage(clipWidth, clipHeight), clipScale)
    } else {
      canvas = _drawImage(options.width, Math.round(clipHeight * clipScale))
    }

    const format = {
      base64 () {
        return canvas.toDataURL(options.type, options.quality)
      },
      file () {
        return dataURItoBlob(format.base64())
      },
      objectUrl () {
        return URL.createObjectURL(format.file())
      },
      canvas () {
        return canvas
      }
    }

    if (format[options.format]) {
      return format[options.format]()
    } else {
      throw new Error(`Undefined format: ${options.format}, Try: base64|file|objectUrl|canvas`)
    }
  }

  /**
   * 设置裁剪框大小
   * @param {Object} border 位置大小{ x, y, width, height }
   */
  setBorder (border) {
    const crop = this
    const { x, y, width, height } = crop.checkBorder(border)
    const { canvasRatio, viewWidth, viewHeight, circle } = crop.options
    const maskStyle = {
      width,
      height,
      left: x - viewWidth,
      top: y - viewHeight,
      borderWidth: `${viewHeight}px ${viewWidth}px`,
      borderRadius: circle ? (browser.android && parseFloat(browser.android) <= 4.1 ? null : '50%') : null
    }
    const offset = {
      left: x * canvasRatio,
      top: y * canvasRatio,
      right: (viewWidth - width - x) * canvasRatio,
      bottom: (viewHeight - height - y) * canvasRatio
    }

    if (crop.canvas) {
      crop.canvas.options.offset = offset
    }

    setStyle(crop.elements.mask, maskStyle)

    crop.border = border
    crop.canvasOffset = offset
  }

  checkBorder (border) {
    const { x, y, width, height } = border
    const { viewWidth, viewHeight } = this.options

    border.width = isNumber(width) ? width : viewWidth
    border.height = isNumber(height) ? height : viewHeight
    border.x = isNumber(x) ? x : (viewWidth - border.width) / 2
    border.y = isNumber(y) ? y : (viewHeight - border.height) / 2

    return border
  }

  on () {
    return this.canvas.on.apply(this.canvas, arguments)
  }

  emit () {
    this.canvas.emit.apply(this.canvas, arguments)
  }

  off () {
    this.canvas.off.apply(this.canvas, arguments)
  }

  show (transition) {
    const crop = this
    if (!crop.isHide) return
    win.requestAnimationFrame(() => {
      const el = crop.elements.container
      const options = crop.options
      if (transition === false) {
        setClass(el, {
          remove: Crop.CROP_HIDE_CLASS
        })
      } else {
        setClass(el, {
          remove: Crop.CROP_HIDE_CLASS,
          add: options.beforeShowClass
        })
        win.requestAnimationFrame(() => {
          setClass(el, {
            remove: options.beforeShowClass
          })
        })
      }
      crop.isHide = false
    })
  }

  hide (transition) {
    const crop = this
    if (crop.isHide) return
    win.requestAnimationFrame(() => {
      const el = crop.elements.container
      if (transition === false) {
        setClass(el, {
          add: Crop.CROP_HIDE_CLASS
        })
      } else {
        setClass(el, {
          add: crop.options.beforeHideClass
        })
      }
      crop.isHide = true
    })
  }

  destroy () {
    const crop = this
    const container = crop.elements.container

    crop.canvas.destroy()

    removeListener(container, 'click', crop.onClick)
    removeListener(container, 'transitionend', crop.transitionend)
    removeListener(container, 'webkitTransitionEnd', crop.transitionend)

    if (isInPage(container)) {
      crop.options.el.removeChild(container)
    }
  }

  static imageToCanvas = imageToCanvas
  static Canvas = Canvas
  static CROP_HIDE_CLASS = 'crop_hide'
}

export default Crop

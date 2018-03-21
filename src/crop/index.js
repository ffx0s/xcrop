import './crop.css'
import template from './template'
import Canvas from '../canvas/index'
import { VIEW_WIDTH, VIEW_HEIGHT, CROP_HIDE, BORDER_SIZE } from '../constants'
import { delay, extendDeep, makeArray, objectAssign, isNumber } from '../util/shared'
import { dataURItoBlob, URL } from '../util/file'
import { antialisScale, drawImage } from '../util/canvas'
import { imageToCanvas } from '../util/image'
import { setStyle, setClass, isInPage, addListener } from '../util/element'

/**
 * 默认选项
 */

const defaults = {
  // 插入节点
  el: document.body,
  // 容器宽度
  viewWidth: VIEW_WIDTH,
  // 容器高度
  viewHeight: VIEW_HEIGHT,
  // 裁剪框大小
  border: {
    width: BORDER_SIZE,
    height: BORDER_SIZE
  },
  // 允许缩放的最大比例
  maxScale: 2,
  // 画布比例
  canvasRatio: 2,
  // 按钮文字
  confirmText: '确认',
  cancleText: '取消',
  showClass: 'crop-slide-left',
  hideClass: 'crop-slide-bottom'
}

class Crop {
  constructor (options = {}) {
    const crop = this

    crop.options = extendDeep({}, defaults, options)
    crop.border = crop.options.border
    crop.elements = {}

    crop.init()
  }

  init () {
    this.initElement()
    this.initCanvas()
    this.initEvent()
  }

  initElement () {
    const crop = this
    const { showClass, viewWidth, viewHeight } = crop.options
    const element = document.createElement('div')

    element.innerHTML = template(crop.options)

    // 取出带有标记的节点元素
    makeArray(element.querySelectorAll('*')).forEach(el => {
      const value = el.getAttribute('data-el')
      if (value) {
        crop.elements[value] = el
      }
    })

    setStyle(crop.elements.container, {
      width: viewWidth,
      height: viewHeight
    })
    setClass(crop.elements.container, {add: showClass})

    crop.setBorder(crop.border)
  }

  initCanvas () {
    const crop = this
    const { canvasRatio, maxScale, viewWidth, viewHeight } = crop.options
    const canvasOptions = {
      maxScale,
      canvasRatio,
      el: crop.elements.container,
      touchTarget: crop.elements.container,
      width: viewWidth * canvasRatio,
      height: viewHeight * canvasRatio,
      offset: crop.canvasOffset
    }

    crop.canvas = new Canvas(canvasOptions)
  }

  initEvent () {
    const crop = this

    crop.canvas.on('loaded', crop.show.bind(crop))
    crop.canvas.on('loaded', crop.render.bind(crop), true)

    addListener(crop.elements.container, 'touchstart', (crop.touchstart = crop.touchstart.bind(crop)))
  }

  touchstart (e) {
    const eventName = e.target.getAttribute('data-touchstart')

    eventName && this[eventName] && this[eventName]()
  }

  onCancle () {
    this.emit('cancle', this)
  }

  onConfirm () {
    this.emit('confirm', this)
  }

  render () {
    this.options.el.appendChild(this.elements.container)
  }

  get (options) {
    const crop = this
    const { canvasRatio } = crop.options
    const { scale, x, y } = crop.canvas.position
    const clipWidth = crop.border.width * canvasRatio / scale
    const clipHeight = crop.border.height * canvasRatio / scale
    const clipX = (crop.border.x * canvasRatio - x) / scale
    const clipY = (crop.border.y * canvasRatio - y) / scale
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
      canvas = _drawImage(options.width, Math.round(clipHeight * (options.width / clipWidth)))
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
   * 设置裁剪框样式
   * @param {Object} border 位置大小
   */
  setBorder (border) {
    const crop = this
    const { x, y, width, height } = crop.checkBorder(border)
    const { canvasRatio, viewWidth, viewHeight } = crop.options
    const maskProps = {
      width,
      height,
      left: x - viewWidth,
      top: y - viewHeight,
      borderWidth: `${viewHeight}px ${viewWidth}px`
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

    setStyle(crop.elements.mask, maskProps)

    crop.border = border
    crop.canvasOffset = offset
  }

  checkBorder (border) {
    const { x, y, width, height } = border
    const { viewWidth, viewHeight } = this.options

    border.width = isNumber(width) ? width : BORDER_SIZE
    border.height = isNumber(height) ? height : BORDER_SIZE
    border.x = isNumber(x) ? x : (viewWidth - border.width) / 2
    border.y = isNumber(y) ? y : (viewHeight - border.height) / 2

    return border
  }

  load (target) {
    this.canvas.load(target)
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
    const el = this.elements.container
    const duration = transition === false ? 0 : 30

    // 加定时器保证在其他任务完成之后执行
    delay(() => {
      setClass(el, {
        remove: CROP_HIDE
      })
      delay(() => {
        setClass(el, {
          remove: this.options.showClass
        })
      }, duration)
    })
  }

  hide (transition) {
    const crop = this
    const el = crop.elements.container
    const duration = transition === false ? 0 : 300

    // 加定时器保证在其他任务完成之后执行
    delay(() => {
      setClass(el, {
        add: crop.options.hideClass
      })
      delay(() => {
        setClass(el, {
          add: [CROP_HIDE, crop.options.showClass],
          remove: crop.options.hideClass
        })
      }, duration)
    })
  }

  destroy () {
    const crop = this
    const container = crop.elements.container

    crop.canvas.destroy()

    container.removeEventListener('touchstart', crop.touchstart)

    if (isInPage(container)) {
      crop.options.el.removeChild(container)
    }
  }

  static imageToCanvas = imageToCanvas
  static Canvas = Canvas
}

export default Crop

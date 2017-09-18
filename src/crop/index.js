import { noop, extend } from '../util/shared'
import { dataURItoBlob, URL } from '../util/file'
import { scaleCanvas, antialisScale } from '../util/canvas'
import { imageToCanvas } from '../util/image'
import { Element, createElement, removeElement, renderStyle } from '../util/element'

import Pinch from '../pinch/index'

/**
 * 获取裁剪默认选项
 */
function getDefaultOptions () {
  return {
    // 目标对象，可以是File/Canvas/Image src
    target: null,
    // 允许图片的最大width
    maxTargetWidth: 2000,
    // 允许图片的最大height
    maxTargetHeight: 2000,
    // 插入到el节点
    el: null,
    // 裁剪框width
    width: 300,
    // 裁剪框height
    height: 300,
    // 图片初始x坐标
    x: undefined,
    // 图片初始y坐标
    y: undefined,
    // 允许缩放的最大比例
    maxScale: 2,
    // 允许缩放的最小比例
    minScale: 1,
    // canavs画布比例
    canvasScale: 2,
    // 绑定事件的节点
    touchTarget: null,
    // 生命周期函数
    created: noop, // 创建完成
    mounted: noop, // 已插入到html节点
    loaded: noop,  // 裁剪图片加载完成
    // 取消事件回调
    cancle: noop,
    // 确认事件回调
    confirm: noop
  }
}

/**
 * 裁剪对象
 * @param {Object} options 裁剪选项
 */
function Crop (options) {
  this.init(options)
}

Crop.prototype = {
  /**
   * 初始化
   * @param {Object} options 裁剪选项
   */
  init: function (options) {
    this.options = extend(getDefaultOptions(), options)
    this.create()
    this.render()
    Crop.count ++
  },
  /**
   * 创建dom节点
   */
  create: function () {
    const crop = this
    const options = crop.options

    let el = options.el

    options.el = el
      ? typeof el === 'string'
        ? document.querySelector(el)
        : el
      : document.body

    const styles = []
    const width = options.width
    const height = options.height
    const docEl = document.documentElement

    // 裁剪最外层div
    const wrapProps = {
      className: 'crop-wrap',
      width: el ? (el.offsetWidth ? el.offsetWidth : docEl.clientWidth) : docEl.clientWidth,
      height: el ? (el.offsetHeight ? el.offsetHeight : docEl.clientHeight) : docEl.clientHeight,
      style: function () {
        return `
          .${this.className} {
            position: fixed;
            left: 0;
            top: 0;
            overflow: hidden;
            width: ${this.width}px;
            height: ${this.height}px;
            background: #000;
            z-index: 99;
          }
        `
      }
    }
    // 遮罩层
    const maskProps = {
      className: 'crop-mask',
      left: typeof options.x === 'number' ? options.x - wrapProps.width : -(width + wrapProps.width) / 2,
      top: typeof options.y === 'number' ? options.y - wrapProps.height : -(height + wrapProps.height) / 2,
      style: function () {
        return `
          .${this.className} {
            position: absolute; 
            left: ${this.left}px;
            top: ${this.top}px;
            width: ${width}px; 
            height: ${height}px; 
            overflow: hidden;
            border: 1px solid rgba(0, 0, 0, .6);
            border-width: ${wrapProps.height}px ${wrapProps.width}px;
            box-sizing: content-box;
          }
          .${this.className}:after {
            position: absolute;
            left: 0;
            top: 0;
            float: left;
            content: '';
            width: 200%;
            height: 200%;
            border: 1px solid #fff;
            -webkit-box-sizing: border-box;
            box-sizing: border-box;
            -webkit-transform: scale(0.5);
            transform: scale(0.5);
            -webkit-transform-origin: 0 0;
            transform-origin: 0 0;
          }
        `
      }
    }
    // 底部按钮外层div
    const handleProps = {
      className: 'crop-handle',
      style: function () {
        return `
          .${this.className} {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 50px;
            line-height: 50px;
            background-color: rgba(0,0,0,.3);
          }
          .${this.className} > div {
            height: 100px;
            width: 80px;
            color: #fff;
            font-size: 16px;
            text-align: center;
          }
        `
      }
    }
    // 取消按钮
    const cancleProps = {
      className: 'crop-cancle',
      style: function () {
        return `
          .${this.className} {
            float: left;
          }
        `
      },
      events: {
        touchstart: options.cancle.bind(crop)
      }
    }
    // 确认按钮
    const confirmProps = {
      className: 'crop-confirm',
      style: function () {
        return `
          .${this.className} {
            float: right;
          }
        `
      },
      events: {
        touchstart: options.confirm.bind(crop)
      }
    }

    // 实例化节点对象
    crop.root = new Element('div', wrapProps, [
      new Element('div', maskProps),
      new Element('div', handleProps, [
        new Element('div', cancleProps, ['取消']),
        new Element('div', confirmProps, ['确认'])
      ])
    ])

    // 创建dom节点
    createElement(crop.root, function (element) {
      element.style && styles.push(element.style())
    })
    crop.styles = styles.join('')
    crop.area = { width, height }

    options.x = wrapProps.width + maskProps.left
    options.y = wrapProps.height + maskProps.top

    options.created.call(crop)
  },
  render: function () {
    const crop = this
    const options = crop.options

    if (Crop.count === 0) {
      renderStyle(crop.styles)
    }
    options.el.appendChild(crop.root.el)

    initPinch(crop)

    setTimeout(options.mounted.call(crop), 0)
  },
  get: function (config = { width: undefined, height: undefined, type: 'image/jpeg', quality: 0.85 }) {
    const crop = this
    const pinch = crop.pinch
    const { width, height, type, quality } = config
    const scale = pinch.options.width / pinch.rect.width
    const clipWidth = crop.area.width * scale
    const clipHeight = crop.area.height * scale
    const defaultCanvas = getDefaultCanvas()

    function getDefaultCanvas () {
      const canvas = document.createElement('canvas')
      const x = pinch.options.offset.left * scale
      const y = pinch.options.offset.top * scale
      const ctx = canvas.getContext('2d')
      canvas.width = clipWidth
      canvas.height = clipHeight
      ctx.drawImage(pinch.canvas, x, y, clipWidth, clipHeight, 0, 0, clipWidth, clipHeight)
      return canvas
    }

    let result = {}
    let value = width || height

    if (value) {
      const clipScale = width ? width / clipWidth : height / clipHeight
      const newCanvas = value >= 150 ? scaleCanvas(defaultCanvas, clipScale) : antialisScale(defaultCanvas, clipScale)
      result = {
        canvas: newCanvas,
        src: newCanvas.toDataURL(type, quality)
      }
    } else {
      result = {
        canvas: defaultCanvas,
        src: defaultCanvas.toDataURL(type, quality)
      }
    }

    result.blob = dataURItoBlob(result.src)
    result.url = URL.createObjectURL(result.blob)

    return result
  },
  load: function (target) {
    const crop = this

    crop.show()
    crop.pinch && crop.pinch.remove()
    crop.options.target = target
    initPinch(crop)
  },
  show: function () {
    this.root.el.style.display = 'block'
  },
  hide: function () {
    this.root.el.style.display = 'none'
  },
  destroy: function () {
    const crop = this

    crop.pinch.remove()
    removeElement(crop.root, crop.options.el)
  },
  moveTo: function (x, y) {
    this.pinch.moveTo(x, y)
  },
  scaleTo: function (point, zoom) {
    this.pinch.scaleTo(point, zoom)
  }
}

Crop.count = 0
Crop.loadImage = imageToCanvas
Crop.Pinch = Pinch

function initPinch (crop) {
  function init () {
    const { target, maxTargetWidth, maxTargetHeight, canvasScale, x, y, el, maxScale, minScale, loaded } = crop.options
    const { el: touchTarget, width, height } = crop.root
    const pinchOptions = {
      target,
      maxTargetWidth,
      maxTargetHeight,
      el,
      maxScale,
      minScale,
      loaded,
      touchTarget,
      width: width * canvasScale,
      height: height * canvasScale,
      offset: {
        left: x,
        right: width - crop.area.width - x,
        top: y,
        bottom: height - crop.area.height - y
      }
    }
    crop.pinch = new Pinch(touchTarget, pinchOptions)
  }
  setTimeout(init, 0)
}

export default Crop

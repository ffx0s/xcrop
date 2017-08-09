import { noop, bind, extend } from '../util/shared'
import { dataURItoBlob, URL } from '../util/file'
import { scaleCanvas, antialisScale } from '../util/canvas'
import { imageToCanvas } from '../util/image'
import { Element, createElement, removeElement, renderStyle } from '../util/element'

import Pinch from '../pinch/index'

function getDefaultOptions () {
  return {
    target: null,
    maxTargetWidth: 2000,
    maxTargetHeight: 2000,
    el: null,
    width: 300,
    height: 300,
    x: undefined,
    y: undefined,
    maxScale: 2,
    minScale: 1,
    canvasScale: 2,
    touchTarget: null,
    created: noop,
    mounted: noop,
    loaded: noop,
    cancle: noop,
    confirm: noop
  }
}

function Crop (options) {
  this.init(options)
}

Crop.prototype = {
  init: function (options) {
    const crop = this
    crop.options = extend(getDefaultOptions(), options)
    crop.create()
    crop.render()
    Crop.count ++
  },
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

    const wrapProps = {
      className: setClassName('wrap'),
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
    const maskProps = {
      className: setClassName('mask'),
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

    const handleProps = {
      className: setClassName('handle'),
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
    const cancleProps = {
      className: setClassName('cancle'),
      style: function () {
        return `
          .${this.className} {
            float: left;
          }
        `
      },
      events: {
        touchstart: bind(options.cancle, crop)
      }
    }
    const confirmProps = {
      className: setClassName('confirm'),
      style: function () {
        return `
          .${this.className} {
            float: right;
          }
        `
      },
      events: {
        touchstart: bind(options.confirm, crop)
      }
    }

    crop.root = new Element('div', wrapProps, [
      new Element('div', maskProps),
      new Element('div', handleProps, [
        new Element('div', cancleProps, ['取消']),
        new Element('div', confirmProps, ['确认'])
      ])
    ])

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

function setClassName (name) {
  return `crop-${name}`
}

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

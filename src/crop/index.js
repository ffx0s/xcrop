import { noop, bind, extend } from '../util/shared'
import { dataURItoBlob } from '../util/file'
import { scaleCanvas, antialisScale } from '../util/canvas'
import { imageToCanvas } from '../util/image'
import { Element, createElement, removeElement, renderStyle } from '../util/element'

import Pinch from '../pinch/index'

function getDefaultOptions () {
  return {
    target: null,
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
      width: el ? el.offsetWidth : docEl.clientWidth,
      height: el ? el.offsetHeight : docEl.clientHeight,
      style: function () {
        return `
          .${this.className} {
            position: absolute;
            left: 0;
            top: 0;
            overflow: hidden;
            width: ${this.width}px;
            height: ${this.height}px;
            background: #000;
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

    crop.initPinch()

    setTimeout(bind(options.mounted, crop), 0)
  },
  initPinch: function () {
    const crop = this

    function init () {
      const { target, canvasScale, x, y, el, maxScale, minScale, loaded } = crop.options
      const { el: rootEl, width, height } = crop.root
      const pinchOptions = {
        target,
        el,
        maxScale,
        minScale,
        loaded,
        width: width * canvasScale,
        height: height * canvasScale,
        touchTarget: rootEl,
        offset: {
          left: x,
          right: width - crop.area.width - x,
          top: y,
          bottom: height - crop.area.height - y
        }
      }
      crop.pinch = new Pinch(rootEl, pinchOptions)
    }

    setTimeout(init, 0)
  },
  get: function (config = {}) {
    const crop = this
    const pinch = crop.pinch
    const defaultConfig = { width: undefined, height: undefined, type: 'image/jpeg', quality: 0.85 }
    const { width, height, type, quality } = extend(defaultConfig, config)
    const { left, top } = pinch.options.offset
    const scale = pinch.options.width / pinch.rect.width
    const x = left * scale
    const y = top * scale
    const clipWidth = crop.area.width * scale
    const clipHeight = crop.area.height * scale
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    canvas.width = clipWidth
    canvas.height = clipHeight

    ctx.drawImage(pinch.canvas, x, y, clipWidth, clipHeight, 0, 0, clipWidth, clipHeight)

    let result = {}
    let value = width || height

    if (value) {
      const clipScale = width ? width / clipWidth : height / clipHeight
      const curCanvas = value >= 150 ? scaleCanvas(canvas, clipScale) : antialisScale(canvas, clipScale)
      // const curCanvas = antialisScale(canvas, clipScale)
      // const curCanvas = scaleCanvas(canvas, clipScale)
      result = {
        canvas: curCanvas,
        src: curCanvas.toDataURL(type, quality)
      }
    } else {
      result = {
        canvas: canvas,
        src: canvas.toDataURL(type, quality)
      }
    }

    result.blob = dataURItoBlob(result.src)
    result.url = window.URL.createObjectURL(result.blob)

    return result
  },
  load: function (target) {
    const crop = this

    crop.show()
    crop.pinch && crop.pinch.remove()
    crop.options.target = target
    crop.initPinch()
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

export default Crop

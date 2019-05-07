import render, { initRender } from './render'
import events, { initEvent } from './event'
import actions, { initActions } from './actions'
import validation from './validation'
import { extendDeep, objectAssign } from '../util/shared'
import { $ } from '../util/element'
import EventEmitter from '../util/eventEmitter'

class Canvas extends EventEmitter {
  // 默认选项
  static defaults = {
    el: document.body,
    // canvas宽度
    width: document.documentElement.clientWidth * 2,
    // canvas高度
    height: document.documentElement.clientHeight * 2,
    // 最大缩放比例
    maxScale: 2,
    // touch事件绑定对象，默认为canvas
    touchTarget: null,
    // canvas位于容器的偏移量
    offset: {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
    }
  }

  constructor (options = {}) {
    super()

    const that = this

    if (options.el) {
      options.el = $(options.el)
    }

    that.options = extendDeep({}, Canvas.defaults, options)
    that.init()
  }

  init () {
    const that = this

    initRender(that)
    initEvent(that)
    initActions(that)
  }
}

// 添加原型方法
objectAssign(Canvas.prototype, render, events, actions, validation)

export default Canvas

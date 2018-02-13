import { extend, noop } from '../util/shared'
import { initRender, addRender } from './render'
import { initEvent, addEvent } from './event'
import { initActions, addActions } from './actions'
import { addValidation } from './validation'
import addGlobal from './global'

function getDefaultOptions () {
  return {
    target: null,
    maxTargetWidth: 2000,
    maxTargetHeight: 2000,
    el: null,
    // canvas宽度
    width: 800,
    // canvas高度
    height: 800,
    // 最大缩放比例，最小缩放比例默认为 canvas 与图片大小计算的比例
    maxScale: 2,
    touchTarget: null,
    // canvas位于容器的偏移量
    offset: {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
    },
    loaded: noop
  }
}

function Pinch (el, options) {
  options.el = el
  this.init(options)
  this.render()
  this.bindEvent()
  this.load(options.target)
}

Pinch.prototype.init = function (options) {
  const pinch = this

  pinch.options = extend(getDefaultOptions(), options)

  initRender(pinch)
  initEvent(pinch)
  initActions(pinch)
}

// 添加静态方法
addGlobal(Pinch)
// 添加渲染相关的原型方法
addRender(Pinch)
// 添加事件相关的原型方法
addEvent(Pinch)
// 添加操作相关的原型方法
addActions(Pinch)
// 添加验证相关的原型方法
addValidation(Pinch)

export default Pinch

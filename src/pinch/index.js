import { extend } from '../util/shared'
import { initRender, addRender } from './render'
import { initEvent, addEvent } from './event'
import { initActions, addActions } from './actions'
import { addValidation } from './validation'
import addGlobal from './global'

function getDefaultOptions () {
  return {
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight,
    // 允许最大的图片宽高
    maxTargetWidth: 2000,
    maxTargetHeight: 2000,
    // 最大/最小缩放比例
    maxScale: 2,
    minScale: 1,
    touchTarget: null,
    // canvas位于容器的偏移量
    offset: {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
    },
    // 是否需要图片遮罩层，防止微信保存图片菜单弹起
    imageMask: true
  }
}

function Pinch (el, options = {}) {
  const pinch = this
  options.el = typeof el === 'string' ? document.querySelector(el) : el
  pinch.options = extend(getDefaultOptions(), options)
  this.init()
  return this
}

Pinch.prototype.init = function () {
  const pinch = this
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

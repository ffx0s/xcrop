import { extend, noop } from '../util/shared'
import { initEvent, addEvent, bindEvent } from './event'
import { initRender, addRender, render } from './render'
import { addValidation } from './validation'
import addGlobal from './global'

function getDefaultOptions () {
  return {
    target: null,
    maxTargetWidth: 2000,
    maxTargetHeight: 2000,
    el: null,
    width: 800,
    height: 800,
    maxScale: 2,
    minScale: 1,
    touchTarget: null,
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
}

Pinch.prototype.init = function (options) {
  const pinch = this

  pinch.options = extend(getDefaultOptions(), options)

  function initState (pinch) {
    initEvent(pinch)
    initRender(pinch)
  }

  initState(pinch)
  render(pinch)
  bindEvent(pinch)
}

addGlobal(Pinch)
addEvent(Pinch)
addRender(Pinch)
addValidation(Pinch)

export default Pinch

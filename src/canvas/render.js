import { noop } from '../util/shared'
import { createCanvas } from './helper'

export function initRender (canvas) {
  canvas.canvas = createCanvas(canvas.options.width, canvas.options.height)
  canvas.context = canvas.canvas.getContext('2d')

  canvas.renderAction = () => {
    canvas.bindEvent()
    canvas.render()

    canvas.renderAction = noop
  }
}

export default {
  render () {
    const that = this
    const { el, canvasRatio, width } = that.options

    el.appendChild(that.canvas)
    // 获取 canvas 位于 html 里实际的大小
    that.rect = that.canvas.getBoundingClientRect()
    // 利用 canvas 的宽度和实际的宽度作为它的大小比例
    that.canvasRatio = canvasRatio || width / that.rect.width
  }
}

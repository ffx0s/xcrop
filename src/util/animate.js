import { extendDeep } from './shared'
import Tween from './tween'
import './rAF'

/**
 * 获取当前时间戳
 * @returns {Number} 时间戳
 */
const now = () => Date.now()

// 动画默认选项
const defaultsOptions = {
  time: 500,
  type: 'easeOutQuad'
}

/**
 * 动画执行函数，仅在opiotns.running函数返回数值，不做具体元素的动画操作
 * @param {Object} options 选项
 * @property {Number} [options.time = 500] 在指定时间（ms）内完成动画，默认500ms
 * @property {String} [options.type = 'easeOutQuad'] 动画类型，默认linear
 * @property {Array} options.targets 二维数组，存放起始值与目标值，例：[[0, 100], [100, 0]]，表示起始值0到目标值100的过程中的变化，变化的数值会作为options.running函数的参数返回
 * @property {Function} options.running - options.targets数值变化过程会执行这个函数
 * @property {Function} options.end 结束后的回调函数
 */
export default function (_options) {
  let timer = null
  const options = extendDeep({}, defaultsOptions, _options)
  const { time, type, targets, running, end } = options
  const startTime = now()

  function step () {
    const changeTime = now()
    const scale = 1 - ((Math.max(0, startTime - changeTime + time) / time) || 0)
    const value = []

    targets.forEach(target => {
      const currentValue = target[0] === target[1] ? target[0] : Tween[type](scale * time, target[0], target[1] - target[0], time) || 0
      value.push(currentValue)
    })

    running(value)

    if (scale === 1) {
      win.cancelAnimationFrame(timer)
      end && end()
    } else {
      timer = win.requestAnimationFrame(step)
    }
  }

  timer = win.requestAnimationFrame(step)
  return {
    stop: function () {
      win.cancelAnimationFrame(timer)
    }
  }
}

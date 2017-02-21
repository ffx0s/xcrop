export const Tween = {
  /*
   * t : 当前时间   b : 初始值  c : 变化值   d : 总时间
   * return : 当前的位置
   *
  */
  // linear: function (t, b, c, d) {  // 匀速
  //   return c * t / d + b
  // },
  // easeIn: function (t, b, c, d) {  // 加速曲线
  //   return c * (t /= d) * t + b
  // },
  easeOut: function (t, b, c, d) {  // 减速曲线
    return -c * (t /= d) * (t - 2) + b
  }
  // easeBoth: function (t, b, c, d) {  // 加速减速曲线
  //   if ((t /= d / 2) < 1) {
  //     return c / 2 * t * t + b
  //   }
  //   return -c / 2 * ((--t) * (t - 2) - 1) + b
  // },
  // easeInStrong: function (t, b, c, d) {  // 加加速曲线
  //   return c * (t /= d) * t * t * t + b
  // },
  // easeOutStrong: function (t, b, c, d) {  // 减减速曲线
  //   return -c * ((t = t / d - 1) * t * t * t - 1) + b
  // },
  // easeBothStrong: function (t, b, c, d) {  // 加加速减减速曲线
  //   if ((t /= d / 2) < 1) {
  //     return c / 2 * t * t * t * t + b
  //   }
  //   return -c / 2 * ((t -= 2) * t * t * t - 2) + b
  // },
  // elasticIn: function (t, b, c, d, a, p) {  // 正弦衰减曲线（弹动渐入）
  //   if (t === 0) {
  //     return b
  //   }
  //   if ((t /= d) == 1) {
  //     return b + c
  //   }
  //   if (!p) {
  //     p = d * 0.3
  //   }
  //   if (!a || a < Math.abs(c)) {
  //     a = c
  //     let s = p / 4
  //   } else {
  //     let s = p / (2 * Math.PI) * Math.asin(c / a)
  //   }
  //   return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b
  // },
  // elasticOut: function (t, b, c, d, a, p) {    // 正弦增强曲线（弹动渐出）
  //   if (t === 0) {
  //     return b
  //   }
  //   if ((t /= d) == 1) {
  //     return b + c
  //   }
  //   if (!p) {
  //     p = d * 0.3
  //   }
  //   if (!a || a < Math.abs(c)) {
  //     a = c
  //     let s = p / 4
  //   } else {
  //     let s = p / (2 * Math.PI) * Math.asin(c / a)
  //   }
  //   return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b
  // },
  // elasticBoth: function (t, b, c, d, a, p) {
  //   if (t === 0) {
  //     return b
  //   }
  //   if ((t /= d / 2) == 2) {
  //     return b + c
  //   }
  //   if (!p) {
  //     p = d * (0.3 * 1.5)
  //   }
  //   if (!a || a < Math.abs(c)) {
  //     a = c
  //     let s = p / 4
  //   }
  //   else {
  //     let s = p / (2 * Math.PI) * Math.asin(c / a)
  //   }
  //   if (t < 1) {
  //     return -0.5 * (a * Math.pow(2, 10 * (t -= 1)) *
  //       Math.sin((t * d - s) * (2 * Math.PI) / p)) + b
  //   }
  //   return a * Math.pow(2, -10 * (t -= 1)) *
  //     Math.sin((t * d - s) * (2 * Math.PI) / p) * 0.5 + c + b
  // },
  // backIn: function (t, b, c, d, s) {     // 回退加速（回退渐入）
  //   if (typeof s == 'undefined') {
  //     s = 1.70158
  //   }
  //   return c * (t /= d) * t * ((s + 1) * t - s) + b
  // },
  // backOut: function (t, b, c, d, s) {
  //   if (typeof s == 'undefined') {
  //     s = 3.70158  // 回缩的距离
  //   }
  //   return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b
  // },
  // backBoth: function (t, b, c, d, s) {
  //   if (typeof s == 'undefined') {
  //     s = 1.70158
  //   }
  //   if ((t /= d / 2) < 1) {
  //     return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b
  //   }
  //   return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b
  // },
  // bounceIn: function (t, b, c, d) {    // 弹球减振（弹球渐出）
  //   return c - Tween['bounceOut'](d - t, 0, c, d) + b
  // },
  // bounceOut: function (t, b, c, d) {
  //   if ((t /= d) < (1 / 2.75)) {
  //     return c * (7.5625 * t * t) + b
  //   } else if (t < (2 / 2.75)) {
  //     return c * (7.5625 * (t -= (1.5 / 2.75)) * t + 0.75) + b
  //   } else if (t < (2.5 / 2.75)) {
  //     return c * (7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375) + b
  //   }
  //   return c * (7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375) + b
  // },
  // bounceBoth: function (t, b, c, d) {
  //   if (t < d / 2) {
  //     return Tween['bounceIn'](t * 2, 0, c, d) * 0.5 + b
  //   }
  //   return Tween['bounceOut'](t * 2 - d, 0, c, d) * 0.5 + c * 0.5 + b
  // }
}

const requestAnimationFrame = (function () {
  return window.requestAnimationFrame ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame ||
         window.msRequestAnimationFrame ||
         function (callback) {
           return window.setTimeout(callback, 1000 / 60)
         }
})()

const cancelAnimationFrame = (function () {
  return window.cancelAnimationFrame ||
         window.mozCancelAnimationFrame ||
         function (id) {
           clearTimeout(id)
         }
})()

const now = () => new Date().getTime()

export default function (options) {
  let { times = 500, type = 'easeOut', targets, animate, end } = options
  const startTime = now()

  function step () {
    const changeTime = now()
    const scale = 1 - Math.max(0, startTime - changeTime + times) / times
    const value = []

    targets.forEach(target => {
      value.push(Tween[type](scale * times, target[0], target[1] - target[0], times))
    })

    animate(value)

    if (scale === 1) {
      cancelAnimationFrame(animate.timer)
      end && end()
    } else {
      requestAnimationFrame(step)
    }
  }

  cancelAnimationFrame(animate.timer)
  animate.timer = requestAnimationFrame(step)
}

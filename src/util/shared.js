export const toString = Object.prototype.toString
export const slice = Array.prototype.slice

/**
 * 空函数
 */
export function noop () {}

/**
 * 获取随机uid
 * @returns {String} uid
 */
export const uuid = () => Math.random().toString(36).substring(3, 8)

/**
 * 目标是否为原对象，不包含数组、null
 * @param {*} obj 检测对象
 */
export function isPlainObject (obj) {
  return toString.call(obj) === '[object Object]'
}

/**
 * 目标是否为对象，包含数组
 * @param {*} obj 检测对象
 */
export function isObject (obj) {
  return isPlainObject(obj) || Array.isArray(obj)
}

/**
 * 是否为字符串
 * @param {*} value 值
 */
export function isString (value) {
  return typeof value === 'string'
}

/**
 * 是否为数字
 * @param {*} value 值
 */
export function isNumber (value) {
  return typeof value === 'number' && value !== Infinity && !isNaN(value)
}

function objectEach (callback) {
  return function (to) {
    if (to === null || to === undefined) return

    const args = arguments
    const length = args.length
    const loop = function (i) {
      const next = args[i]
      if (next === null || next === undefined) return false

      Object.keys(next).forEach(prop => {
        callback(to, next, prop)
      })
    }

    for (let i = 1; i < length; i++) {
      if (!loop(i)) continue
    }

    return to
  }
}

/**
 * 深度复制
 */
export const extendDeep = objectEach((to, next, prop) => {
  const current = next[prop]

  if (isObject(current)) {
    to[prop] = isPlainObject(current) ? {} : []
    extendDeep(to[prop], current)
  } else {
    to[prop] = current
  }
})

/**
 * Object.assign
 */
export const objectAssign = Object.assign || objectEach((to, next, prop) => {
  const current = next[prop]
  to[prop] = current
})

/**
 * 延迟执行函数
 * @param {Function} callback 延迟函数
 * @param {Number} ms 延迟毫秒数
 */
export function delay (callback, ms) {
  setTimeout(callback, ms || 0)
}

/**
 * 浏览器信息
 */
// const ios8UserAgent = 'Mozilla/5.0 (iPad; CPU OS 8_0 like Mac OS X) AppleWebKit/537.51.3 (KHTML, like Gecko) Version/8.0 Mobile/11A4132 Safari/9537.145 evaliant'

export const browser = (() => {
  const userAgent = navigator.userAgent
  const ios = !!userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)

  return {
    ios: ios ? { version: +userAgent.match(/[OS\s]\d+/i)[0] } : false
  }
})()

/**
 * 类数组对象转数组
 * @param {Object} object 类数组对象
 */
export function makeArray (object) {
  return slice.call(object)
}

/**
 * 首字母大写
 * @param {String} text 单词
 */
export function firstToUpperCase (text) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/**
 * raf 节流
 * @param {Function} fn 执行函数
 */
export function throttle (fn) {
  let ticking = false
  return function requestTick () {
    if (!ticking) {
      const args = arguments
      win.requestAnimationFrame(() => {
        fn.apply(this, args)
        ticking = false
      })
      ticking = true
    }
  }
}

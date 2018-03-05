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
 * 对象合并
 * @param {Object} target 目标对象
 * @param {Object} object 属性将会合并到目标对象上
 * @returns {Object} 返回目标对象
 */
export function extend (target, object) {
  for (let key in object) {
    target[key] = object[key]
  }
  return target
}

const toString = Object.prototype.toString

/**
 * 目标是否为对象
 * @param {*} obj 检测对象
 */
export function isPlainObject (obj) {
  return toString.call(obj) === '[object Object]'
}

// 是否为 IOS 端
export const isIOS = !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)

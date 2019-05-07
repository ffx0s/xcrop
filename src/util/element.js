import { isString, isNumber, firstToUpperCase, objectAssign } from './shared'

/**
 * 渲染样式
 * @param {String} cssText css样式
 * @param {Element} elem css插入节点
 * @returns {Element} 返回 style element
 */
export function renderStyle (cssText, elem) {
  const styleElem = document.createElement('style')
  try {
    styleElem.appendChild(document.createTextNode(cssText))
  } catch (err) {
    styleElem.stylesheet.cssText = cssText
  }
  (elem || document.getElementsByTagName('head')[0]).appendChild(styleElem)
  return styleElem
}

/**
 * 获取 HTML 节点
 * @param {String} selector 选择器
 * @returns {Element} HTML节点
 */
export function $ (selector) {
  return isString(selector) ? document.querySelector(selector) : selector
}

/**
 * 判断节点是否存在页面上
 * @param {Element} node 节点
 */
export function isInPage (node) {
  return document.body.contains(node)
}

/**
 * 设置CSS样式
 * @param {Object} el 节点
 * @param {Object} css 样式
 */
export function setStyle (el, css) {
  for (let prop in css) {
    const value = isNumber(css[prop]) ? css[prop] + 'px' : css[prop]

    if (['transform', 'transformOrigin', 'transition'].indexOf(prop) !== -1) {
      el.style['Webkit' + firstToUpperCase(prop)] = el.style[prop] = value
    } else {
      el.style[prop] = value
    }
  }
}

const notwhite = /\S+/g

// 设置类名
export const setClass = (() => {
  /**
   * 添加新类名
   * @param {String} curClassName 当前类名
   * @param {String} className 新类名
   */
  function add (curClassName, className) {
    className = Array.isArray(className)
      ? className.join(' ')
      : className.match(notwhite).join(' ')

    return curClassName === '' ? className : (curClassName + ' ' + className)
  }

  /**
   * 移除类名
   * @param {String} curClassName 当前类名
   * @param {String} className 需要移除的类名
   */
  function remove (curClassName, className) {
    const classNameArr = Array.isArray(className)
      ? className
      : className.match(notwhite)

    classNameArr.forEach(name => {
      curClassName = curClassName.replace(new RegExp(`${name}`, 'g'), '')
    })

    return curClassName.trim()
  }

  /**
   * 设置 className
   * @param {Element} el 目标节点
   * @param {Object} options 选项
   * @property {String} options.remove 移除的类名
   * @property {String} options.add 增加的类名
   */
  return function (el, options) {
    let className = el.className
    if (options.remove) {
      className = remove(className, options.remove)
    }
    if (options.add) {
      className = add(className, options.add)
    }
    el.className = className
  }
})()

// 是否支持 passive 属性
let supportsPassive = () => {
  let support = false
  try {
    const options = Object.defineProperty({}, 'passive', {
      get: function () {
        support = true
        supportsPassive = () => true
        return true
      }
    })
    win.addEventListener('testPassive', null, options)
    win.removeEventListener('testPassive', null, options)
  } catch (err) {
    supportsPassive = () => false
  }
  return support
}

export function addListener (element, type, fn, options = { capture: false }) {
  const defaultOptions = {
    capture: false,
    passive: true,
    once: false
  }
  element.addEventListener(
    type,
    fn,
    supportsPassive()
      ? objectAssign(defaultOptions, options)
      : options.capture
  )
}

export function removeListener (
  element,
  type,
  fn,
  options = { capture: false }
) {
  element.removeEventListener(type, fn, options.capture)
}

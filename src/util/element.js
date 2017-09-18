/**
 * 简单封装创建节点和绑定移除事件的操作
 */

import { noop } from './shared'

/**
 * 节点对象
 * @param {String} tagName 节点标签
 * @param {Object} attr 属性
 * @param {Array} children 子节点
 */
export function Element (tagName, attr, children = []) {
  for (let name in attr) {
    this[name] = attr[name]
  }
  this.tagName = tagName
  this.children = children
}

Element.prototype = {
  // 创建节点
  create: function () {
    this.el = document.createElement(this.tagName)
    this.el.className = this.className
    this.addEvent()
    return this.el
  }
}

/**
 * 绑定/移除事件方法
 */
;['addEvent', 'removeEvent'].forEach(value => {
  Element.prototype[value] = function () {
    for (let eventName in this.events) {
      this.el[`${value}Listener`](eventName, this.events[eventName], false)
    }
  }
})

/**
 * 创建dom节点
 * @param {Object} element Element实例化的对象
 * @param {Function} callback 创建完成回调
 */
export function createElement (element, callback = noop) {
  if (typeof element === 'string') {
    const node = document.createTextNode(element)
    callback(element)
    return node
  }

  const node = element.create()

  // 如果有子节点，则递归调用创建
  element.children.forEach(child => {
    const childNode = createElement(child, callback)
    node.appendChild(childNode)
  })

  callback(element)

  return node
}

/**
 * 从html中移除dom节点及绑定事件
 * @param {Object} element Element实例化的对象
 * @param {Boolean} flag 是否从html中移除节点
 */
export function removeElement (element, flag) {
  if (typeof element === 'string') return
  element.children.forEach(child => {
    removeElement(child, false)
  })
  element.removeEvent()
  if (flag) {
    document.body.removeChild(element.el)
  }
}

/**
 * 渲染样式
 * @param {String} cssText css样式
 * @param {Element} elem css插入节点
 */
export function renderStyle (cssText, elem = document.getElementsByTagName('head')[0]) {
  const styleElem = document.createElement('style')
  try {
    styleElem.appendChild(document.createTextNode(cssText))
  } catch (err) {
    styleElem.stylesheet.cssText = cssText
  }
  elem.appendChild(styleElem)
  return styleElem
}

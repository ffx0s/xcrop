import { noop } from './shared'

export function Element (tagName, attr, children = []) {
  for (let name in attr) {
    this[name] = attr[name]
  }
  this.tagName = tagName
  this.children = children
}

Element.prototype = {
  create: function () {
    this.el = document.createElement(this.tagName)
    this.el.className = this.className
    this.addEvent()
    return this.el
  }
}

;['addEvent', 'removeEvent'].forEach(value => {
  Element.prototype[value] = function () {
    for (let eventName in this.events) {
      this.el[`${value}Listener`](eventName, this.events[eventName], false)
    }
  }
})

export function createElement (element, callback = noop) {
  if (typeof element === 'string') {
    const node = document.createTextNode(element)
    callback(element)
    return node
  }

  const node = element.create()

  element.children.forEach(child => {
    const childNode = createElement(child, callback)
    node.appendChild(childNode)
  })

  callback(element)

  return node
}

export function removeElement (element, targetElem, value = true) {
  if (typeof element === 'string') return
  element.children.forEach(child => {
    removeElement(child, targetElem, false)
  })
  element.removeEvent()
  if (value) {
    targetElem.removeChild(element.el)
  }
}

export function renderStyle (css, elem = document.getElementsByTagName('head')[0]) {
  const styleElem = document.createElement('style')
  try {
    styleElem.appendChild(document.createTextNode(css))
  } catch (err) {
    styleElem.stylesheet.cssText = css
  }
  elem.appendChild(styleElem)
  return styleElem
}


  /*!
   * @name xcrop v1.1.0
   * @github https://github.com/ffx0s/xcrop
   * @license MIT.
   */
  
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.Crop = factory());
}(this, (function () { 'use strict';

var win = window; var Math = win.Math;

function styleInject(css, ref) {
  if ( ref === void 0 ) ref = {};
  var insertAt = ref.insertAt;

  if (!css || typeof document === 'undefined') { return; }

  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';

  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

var css = ".crop-container{position:fixed;left:0;top:0;overflow:hidden;background:#000;z-index:1;-webkit-transition:transform .3s;transition:transform .3s;-webkit-transition:-webkit-transform .3s}.crop-container.crop-hide{display:none}.crop-container.crop-slide-left{-webkit-transform:translate3d(100%,0,0);transform:translate3d(100%,0,0)}.crop-container.crop-slide-right{-webkit-transform:translate3d(-100%,0,0);transform:translate3d(-100%,0,0)}.crop-container.crop-slide-top{-webkit-transform:translate3d(0,-100%,0);transform:translate3d(0,-100%,0)}.crop-container.crop-slide-bottom{-webkit-transform:translate3d(0,100%,0);transform:translate3d(0,100%,0)}.crop-mask{position:absolute;overflow:hidden;border:1px solid rgba(0,0,0,.6);-webkit-transform:translateZ(0);transform:translateZ(0);-webkit-box-sizing:content-box;box-sizing:content-box}.crop-mask:before{position:absolute;left:0;top:0;float:left;content:\"\";width:200%;height:200%;border:1px solid #fff;-webkit-box-sizing:border-box;box-sizing:border-box;-webkit-transform:scale(.5);transform:scale(.5);-webkit-transform-origin:0 0;transform-origin:0 0}.crop-handle{position:absolute;bottom:0;left:0;width:100%;height:50px;line-height:50px;-webkit-transform:translateZ(0);transform:translateZ(0)}.crop-handle div{height:100%;width:80px;color:#fff;font-size:16px;text-align:center}.crop-cancle{float:left}.crop-confirm{float:right}";
styleInject(css);

function template(options) {
  var cancleText = options.cancleText,
      confirmText = options.confirmText;


  return '<div class="crop-container crop-hide" data-el="container">' + '<div class="crop-mask" data-el="mask"></div>' + '<div class="crop-handle" data-el="handle">' + ('<div class="crop-cancle" data-el="cancle" data-touchstart="onCancle">' + cancleText + '</div>') + ('<div class="crop-confirm" data-el="confirm" data-touchstart="onConfirm">' + confirmText + '</div>') + '</div>' + '</div>';
}

var VIEW_WIDTH = document.documentElement.clientWidth;
var VIEW_HEIGHT = document.documentElement.clientHeight;

var CROP_HIDE = 'crop-hide';

var toString = Object.prototype.toString;
var slice = Array.prototype.slice;

/**
 * 空函数
 */
function noop() {}

/**
 * 获取随机uid
 * @returns {String} uid
 */


/**
 * 目标是否为原对象，不包含数组、null
 * @param {*} obj 检测对象
 */
function isPlainObject(obj) {
  return toString.call(obj) === '[object Object]';
}

/**
 * 目标是否为对象，包含数组
 * @param {*} obj 检测对象
 */
function isObject(obj) {
  return isPlainObject(obj) || Array.isArray(obj);
}

/**
 * 是否为字符串
 * @param {*} value 值
 */
function isString(value) {
  return typeof value === 'string';
}

/**
 * 是否为数字
 * @param {*} value 值
 */
function isNumber(value) {
  return typeof value === 'number' && value !== Infinity && !isNaN(value);
}

function objectEach(callback) {
  return function (to) {
    if (to === null || to === undefined) return;

    var args = arguments;
    var length = args.length;
    var loop = function loop(i) {
      var next = args[i];
      if (next === null || next === undefined) return false;

      Object.keys(next).forEach(function (prop) {
        callback(to, next, prop);
      });
    };

    for (var i = 1; i < length; i++) {
      if (!loop(i)) continue;
    }

    return to;
  };
}

/**
 * 深度复制
 */
var extendDeep = objectEach(function (to, next, prop) {
  var current = next[prop];

  if (isObject(current)) {
    to[prop] = isPlainObject(current) ? {} : [];
    extendDeep(to[prop], current);
  } else {
    to[prop] = current;
  }
});

/**
 * Object.assign
 */
var objectAssign = Object.assign || objectEach(function (to, next, prop) {
  var current = next[prop];
  to[prop] = current;
});

/**
 * 延迟执行函数
 * @param {Function} callback 延迟函数
 * @param {Number} ms 延迟毫秒数
 */
function delay(callback, ms) {
  setTimeout(callback, ms || 0);
}

/**
 * 浏览器信息
 */
// const ios8UserAgent = 'Mozilla/5.0 (iPad; CPU OS 8_0 like Mac OS X) AppleWebKit/537.51.3 (KHTML, like Gecko) Version/8.0 Mobile/11A4132 Safari/9537.145 evaliant'

var browser = function () {
  var userAgent = navigator.userAgent;
  var ios = !!userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);

  return {
    ios: ios ? { version: +userAgent.match(/[OS\s]\d+/i)[0] } : false
  };
}();

/**
 * 类数组对象转数组
 * @param {Object} object 类数组对象
 */
function makeArray(object) {
  return slice.call(object);
}

/**
 * 首字母大写
 * @param {String} text 单词
 */
function firstToUpperCase(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function sum(a, b) {
  return a + b;
}

/**
 * 获取两个点的中心
 * @param {Array} vectors 点
 */
function getTouchCenter(vectors) {
  return {
    x: vectors.map(function (v) {
      return v.x;
    }).reduce(sum) / vectors.length,
    y: vectors.map(function (v) {
      return v.y;
    }).reduce(sum) / vectors.length
  };
}

// 获取点距离
function getDistance(p1, p2, props) {
  props = props || ['x', 'y'];

  var x = p2[props[0]] - p1[props[0]];
  var y = p2[props[1]] - p1[props[1]];

  return Math.sqrt(x * x + y * y);
}

/**
 * 通过两点距离计算比例
 * @param {Array} start 起始点
 * @param {Array} end 结束点
 */
function getScale(start, end) {
  return getDistance(end[0], end[1]) / getDistance(start[0], start[1]);
}

/**
 * 以点坐标为原点计进行缩放，计算缩放后位置的函数，返回缩放后的x,y,scale
 * https://stackoverflow.com/questions/48097552/how-to-zoom-on-a-point-with-javascript
 * @param {Object} currentOrigin 当前原点坐标
 * @param {Object} firstOrigin 第一次缩放时的原点坐标
 * @param {Object} point 缩放点
 * @param {Number} scale 当前比例
 * @param {Number} scaleChanged 每次缩放的比例系数
 */
function calculate(currentOrigin, firstOrigin, point, scale, scaleChanged) {
  // 鼠标坐标与当前原点的距离
  var distanceX = point.x - currentOrigin.x;
  var distanceY = point.y - currentOrigin.y;
  // 新原点坐标
  var newOriginX = currentOrigin.x + distanceX * (1 - scaleChanged);
  var newOriginY = currentOrigin.y + distanceY * (1 - scaleChanged);
  var offsetX = newOriginX - firstOrigin.x;
  var offsetY = newOriginY - firstOrigin.y;

  return {
    scale: scale * scaleChanged,
    x: firstOrigin.x + offsetX,
    y: firstOrigin.y + offsetY
  };
}

/**
 * 创建一个宽高为100%的画布
 * @param {Number} width 画布宽度
 * @param {Number} height 画布高度
 * @returns {Element} canvas
 */
function createCanvas(width, height) {
  var canvas = document.createElement('canvas');

  canvas.width = width;
  canvas.height = height;
  canvas.style.cssText = 'width:100%;height:100%;';

  return canvas;
}

function toFixed(number, digits) {
  return +number.toFixed(digits);
}

function initRender(canvas) {
  canvas.canvas = createCanvas(canvas.options.width, canvas.options.height);
  canvas.context = canvas.canvas.getContext('2d');

  canvas.renderAction = function () {
    canvas.bindEvent();
    canvas.render();

    canvas.renderAction = noop;
  };
}

var render$1 = {
  render: function render() {
    var that = this;
    var _that$options = that.options,
        el = _that$options.el,
        canvasRatio = _that$options.canvasRatio,
        width = _that$options.width;


    el.appendChild(that.canvas);
    // 获取 canvas 位于 html 里实际的大小
    that.rect = that.canvas.getBoundingClientRect();
    // 利用 canvas 的宽度和实际的宽度作为它的大小比例
    that.canvasRatio = canvasRatio || width / that.rect.width;
  }
};

// t:当前时间、b:初始值、c:变化值、d:总时间，返回结果为当前的位置

var Easing = {
  // linear (t, b, c, d) {
  //   return c * t / d + b
  // },
  // easeInQuad (t, b, c, d) {
  //   return c * (t /= d) * t + b
  // },
  // easeOutQuad (t, b, c, d) {
  //   return -c * (t /= d) * (t - 2) + b
  // },
  easeOutStrong: function easeOutStrong(t, b, c, d) {
    return -c * ((t = t / d - 1) * t * t * t - 1) + b;
  },
  // easeInOutQuad (t, b, c, d) {
  //   if ((t /= d / 2) < 1) {
  //     return c / 2 * t * t + b
  //   } else {
  //     return -c / 2 * ((--t) * (t - 2) - 1) + b
  //   }
  // },
  // easeInCubic (t, b, c, d) {
  //   return c * (t /= d) * t * t + b
  // },
  easeOutCubic: function easeOutCubic(t, b, c, d) {
    return c * ((t = t / d - 1) * t * t + 1) + b;
  }
  // easeInOutCubic (t, b, c, d) {
  //   if ((t /= d / 2) < 1) {
  //     return c / 2 * t * t * t + b
  //   } else {
  //     return c / 2 * ((t -= 2) * t * t + 2) + b
  //   }
  // },
  // easeInQuart (t, b, c, d) {
  //   return c * (t /= d) * t * t * t + b
  // },
  // easeOutQuart (t, b, c, d) {
  //   return -c * ((t = t / d - 1) * t * t * t - 1) + b
  // },
  // easeInOutQuart (t, b, c, d) {
  //   if ((t /= d / 2) < 1) {
  //     return c / 2 * t * t * t * t + b
  //   } else {
  //     return -c / 2 * ((t -= 2) * t * t * t - 2) + b
  //   }
  // },
  // easeInQuint (t, b, c, d) {
  //   return c * (t /= d) * t * t * t * t + b
  // },
  // easeOutQuint (t, b, c, d) {
  //   return c * ((t = t / d - 1) * t * t * t * t + 1) + b
  // },
  // easeInOutQuint (t, b, c, d) {
  //   if ((t /= d / 2) < 1) {
  //     return c / 2 * t * t * t * t * t + b
  //   } else {
  //     return c / 2 * ((t -= 2) * t * t * t * t + 2) + b
  //   }
  // },
  // easeInSine (t, b, c, d) {
  //   return -c * Math.cos(t / d * (Math.PI / 2)) + c + b
  // },
  // easeOutSine (t, b, c, d) {
  //   return c * Math.sin(t / d * (Math.PI / 2)) + b
  // },
  // easeInOutSine (t, b, c, d) {
  //   return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b
  // },
  // easeInExpo (t, b, c, d) {
  //   var _ref
  //   return (_ref = t === 0) !== null ? _ref : {
  //     b: c * Math.pow(2, 10 * (t / d - 1)) + b
  //   }
  // },
  // easeOutExpo (t, b, c, d) {
  //   var _ref
  //   return (_ref = t === d) !== null ? _ref : b + {
  //     c: c * (-Math.pow(2, -10 * t / d) + 1) + b
  //   }
  // },
  // easeInOutExpo (t, b, c, d) {
  //   if (t === 0) {
  //   }
  //   if (t === d) {
  //     // b + c
  //   }
  //   if ((t /= d / 2) < 1) {
  //     return c / 2 * Math.pow(2, 10 * (t - 1)) + b
  //   } else {
  //     return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b
  //   }
  // },
  // easeInCirc (t, b, c, d) {
  //   return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b
  // },
  // easeOutCirc (t, b, c, d) {
  //   return c * Math.sqrt(1 - (t = t / d - 1) * t) + b
  // },
  // easeInOutCirc (t, b, c, d) {
  //   if ((t /= d / 2) < 1) {
  //     return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b
  //   } else {
  //     return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b
  //   }
  // },
  // easeInElastic (t, b, c, d) {
  //   var a, p, s
  //   s = 1.70158
  //   p = 0
  //   a = c
  //   if (t === 0) {
  //     // b
  //   } else if ((t /= d) === 1) {
  //     // b + c
  //   }
  //   if (!p) {
  //     p = d * 0.3
  //   }
  //   if (a < Math.abs(c)) {
  //     a = c
  //     s = p / 4
  //   } else {
  //     s = p / (2 * Math.PI) * Math.asin(c / a)
  //   }
  //   return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b
  // },
  // easeOutElastic (t, b, c, d) {
  //   var a, p, s
  //   s = 1.70158
  //   p = 0
  //   a = c
  //   if (t === 0) {
  //     // b
  //   } else if ((t /= d) === 1) {
  //     // b + c
  //   }
  //   if (!p) {
  //     p = d * 0.3
  //   }
  //   if (a < Math.abs(c)) {
  //     a = c
  //     s = p / 4
  //   } else {
  //     s = p / (2 * Math.PI) * Math.asin(c / a)
  //   }
  //   return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b
  // },
  // easeInOutElastic (t, b, c, d) {
  //   var a, p, s
  //   s = 1.70158
  //   p = 0
  //   a = c
  //   if (t === 0) {
  //     // b
  //   } else if ((t /= d / 2) === 2) {
  //     // b + c
  //   }
  //   if (!p) {
  //     p = d * (0.3 * 1.5)
  //   }
  //   if (a < Math.abs(c)) {
  //     a = c
  //     s = p / 4
  //   } else {
  //     s = p / (2 * Math.PI) * Math.asin(c / a)
  //   }
  //   if (t < 1) {
  //     return -0.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b
  //   } else {
  //     return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * 0.5 + c + b
  //   }
  // },
  // easeInBack (t, b, c, d, s) {
  //   if (s === void 0) {
  //     s = 1.70158
  //   }
  //   return c * (t /= d) * t * ((s + 1) * t - s) + b
  // },
  // easeOutBack (t, b, c, d, s) {
  //   if (s === void 0) {
  //     s = 1.70158
  //   }
  //   return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b
  // },
  // easeInOutBack (t, b, c, d, s) {
  //   if (s === void 0) {
  //     s = 1.70158
  //   }
  //   if ((t /= d / 2) < 1) {
  //     return c / 2 * (t * t * (((s *= 1.525) + 1) * t - s)) + b
  //   } else {
  //     return c / 2 * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2) + b
  //   }
  // },
  // easeInBounce (t, b, c, d) {
  //   var v
  //   v = Easing.easeOutBounce(d - t, 0, c, d)
  //   return c - v + b
  // },
  // easeOutBounce (t, b, c, d) {
  //   if ((t /= d) < 1 / 2.75) {
  //     return c * (7.5625 * t * t) + b
  //   } else if (t < 2 / 2.75) {
  //     return c * (7.5625 * (t -= 1.5 / 2.75) * t + 0.75) + b
  //   } else if (t < 2.5 / 2.75) {
  //     return c * (7.5625 * (t -= 2.25 / 2.75) * t + 0.9375) + b
  //   } else {
  //     return c * (7.5625 * (t -= 2.625 / 2.75) * t + 0.984375) + b
  //   }
  // },
  // easeInOutBounce (t, b, c, d) {
  //   var v
  //   if (t < d / 2) {
  //     v = Easing.easeInBounce(t * 2, 0, c, d)
  //     return v * 0.5 + b
  //   } else {
  //     v = Easing.easeOutBounce(t * 2 - d, 0, c, d)
  //     return v * 0.5 + c * 0.5 + b
  //   }
  // }

};

var requestAnimationFrame = win.requestAnimationFrame || win.webkitRequestAnimationFrame || function (callback) {
  return win.setTimeout(callback, 1000 / 60);
};

var cancelAnimationFrame = win.cancelAnimationFrame || function (id) {
  clearTimeout(id);
};

/**
 * 获取当前时间戳
 * @returns {Number} 时间戳
 */
var now = function now() {
  return new Date().getTime();
};

// 动画默认选项
var defaultsOptions = {
  time: 500,
  type: 'easeOutQuad'

  /**
   * 动画执行函数，仅在opiotns.running函数返回数值，不做具体元素的动画操作
   * @param {Object} options 选项
   * @property {Number} [options.time = 500] 在指定时间（ms）内完成动画，默认500ms
   * @property {String} [options.type = 'easeOutQuad'] 动画类型，默认linear
   * @property {Array} options.targets 二维数组，存放起始值与目标值，例：[[0, 100], [100, 0]]，表示起始值0到目标值100的过程中的变化，变化的数值会作为options.running函数的参数返回
   * @property {Function} options.running - options.targets数值变化过程会执行这个函数
   * @property {Function} options.end 结束后的回调函数
   */
};var _animate = function (_options) {
  var timer = null;
  var options = extendDeep({}, defaultsOptions, _options);
  var time = options.time,
      type = options.type,
      targets = options.targets,
      running = options.running,
      end = options.end;

  var startTime = now();

  function step() {
    var changeTime = now();
    var scale = 1 - (Math.max(0, startTime - changeTime + time) / time || 0);
    var value = [];

    targets.forEach(function (target) {
      var currentValue = target[0] === target[1] ? target[0] : Easing[type](scale * time, target[0], target[1] - target[0], time) || 0;
      value.push(currentValue);
    });

    running(value);

    if (scale === 1) {
      cancelAnimationFrame(timer);
      end && end();
    } else {
      timer = requestAnimationFrame(step);
    }
  }

  timer = requestAnimationFrame(step);
  return {
    stop: function stop() {
      cancelAnimationFrame(timer);
    }
  };
};

function initEvent$1(canvas) {
  canvas.eventList = ['mousewheel', 'touchstart', 'touchmove', 'touchend'];
  // 最后一次事件操作的参数
  canvas.last = {
    point: { x: 0, y: 0 },
    move: { x: 0, y: 0 },
    time: 0,
    dis: { time: 0, x: 0, y: 0 }
  };
  canvas.touchDelay = 3;
  canvas.animation = { stop: noop };
  canvas.wheeling = false;
}

var events = {
  bindEvent: function bindEvent() {
    var that = this;
    var element = that.options.touchTarget || that.canvas;

    that.eventList.forEach(function (eventName) {
      element.addEventListener(eventName, that[eventName] = that[eventName].bind(that));
    });
  },
  removeEvent: function removeEvent() {
    var that = this;
    var target = that.options.touchTarget || that.canvas;

    that.eventList.forEach(function (eventName) {
      target.removeEventListener(eventName, that[eventName]);
    });
  },
  mousewheel: function mousewheel(e) {
    e.preventDefault();

    var that = this;

    if (that.wheeling) return;

    // 降低滚动频率
    delay(function () {
      that.wheeling = false;
    }, 30);

    that.wheeling = true;

    var STEP = 0.99;
    var factor = e.deltaY;
    var scaleChanged = Math.pow(STEP, factor);

    that.rect = that.canvas.getBoundingClientRect();
    that.last.point = {
      x: (e.clientX - that.rect.left) * that.canvasRatio,
      y: (e.clientY - that.rect.top) * that.canvasRatio
    };

    that.scaleTo(that.last.point, that.position.scale * scaleChanged);
    that.emit('mousewheel', e);
  },
  touchstart: function touchstart(e) {
    e.preventDefault();

    var that = this;
    var touches = e.touches;

    that.animation.stop();

    if (touches.length === 2) {
      that.pinchstart(e);
    } else if (touches.length === 1) {
      that.dragstart(e);
    }
  },
  touchmove: function touchmove(e) {
    var that = this;
    var touches = e.touches;

    if (touches.length === 2) {
      that.pinchmove(e);
    } else if (touches.length === 1) {
      that.dragmove(e);
    }
  },
  touchend: function touchend(e) {
    var that = this;
    var touches = e.touches;

    if (touches.length) {
      // pinch end
      that.emit('pinchend', e);
      that.dragstart(e);
    } else {
      // drag end
      that.dragend(e);
    }
  },
  dragstart: function dragstart(e) {
    var that = this;
    var touches = e.touches;

    that.last.move = {
      x: touches[0].clientX,
      y: touches[0].clientY
    };
    that.last.dis = {
      time: 0,
      x: 0,
      y: 0
    };
    that.last.time = new Date().getTime();
    that.touchDelay = 3;

    that.emit('dragstart', e);
  },
  dragmove: function dragmove(e) {
    var that = this;
    var touches = e.touches;
    var move = {
      x: touches[0].clientX,
      y: touches[0].clientY
    };
    var x = (move.x - that.last.move.x) * that.canvasRatio;
    var y = (move.y - that.last.move.y) * that.canvasRatio;
    var nowTime = new Date().getTime();

    that.last.dis = {
      x: x,
      y: y,
      time: nowTime - that.last.time
    };
    that.last.time = nowTime;
    that.last.move = move;

    // 延迟防止手误操作
    if (that.touchDelay) {
      that.touchDelay--;
      return;
    }

    that.moveTo(that.position.x + x, that.position.y + y);
    that.emit('dragmove', e);
  },
  dragend: function dragend(e) {
    var that = this;

    if (!that.validation()) {
      // 缓冲动画
      var position = that.position;
      var vx = that.last.dis.x / that.last.dis.time;
      var vy = that.last.dis.y / that.last.dis.time;
      var speed = 0.4;

      if (Math.abs(vx) > speed || Math.abs(vy) > speed) {
        var time = 300;
        var x = position.x + vx * time;
        var y = position.y + vy * time;

        var _that$checkBorder = that.checkBorder({ x: x, y: y }, position.scale, { x: x, y: y }),
            isDraw = _that$checkBorder.isDraw,
            xpos = _that$checkBorder.xpos,
            ypos = _that$checkBorder.ypos;

        if (isDraw) {
          x = xpos + vx * 8;
          y = ypos + vy * 8;
        }

        that.animation = _animate({
          time: time * 2,
          targets: [[position.x, x], [position.y, y]],
          type: 'easeOutCubic',
          running: function running(target) {
            that.setData({ x: target[0], y: target[1] });
            that.draw();
          },
          end: function end() {
            that.validation();
          }
        });
      }
    }

    that.emit('dragend', e);
  },
  pinchstart: function pinchstart(e) {
    var that = this;
    var zoom = makeArray(e.touches).map(function (touch) {
      return { x: touch.clientX, y: touch.clientY };
    });
    var touchCenter = getTouchCenter(zoom);

    that.rect = that.canvas.getBoundingClientRect();
    that.last.zoom = zoom;
    that.last.point = {
      x: (touchCenter.x - that.rect.left) * that.canvasRatio,
      y: (touchCenter.y - that.rect.top) * that.canvasRatio
    };
    that.touchDelay = 5;

    that.emit('pinchstart', e);
  },
  pinchmove: function pinchmove(e) {
    var that = this;
    var zoom = makeArray(e.touches).map(function (touch) {
      return { x: touch.clientX, y: touch.clientY };
    });
    // 双指的中心点
    var touchCenter = getTouchCenter(zoom);
    // 相对于canvas画布的中心点
    var point = {
      x: (touchCenter.x - that.rect.left) * that.canvasRatio,
      y: (touchCenter.y - that.rect.top) * that.canvasRatio
      // 双指两次移动的差值
    };var disX = point.x - that.last.point.x;
    var disY = point.y - that.last.point.y;
    // 双指两次移动间隔的比例
    var scaleChanged = getScale(that.last.zoom, zoom);

    that.last.zoom = zoom;
    that.last.point = point;

    // 延迟防止手误操作
    if (that.touchDelay) {
      that.touchDelay--;
      return;
    }

    that.position.x += disX;
    that.position.y += disY;

    that.scaleTo(point, that.position.scale * scaleChanged);
    that.emit('pinchmove', e);
  }
};

var URL = win.URL && win.URL.createObjectURL ? win.URL : win.webkitURL && win.webkitURL.createObjectURL ? win.webkitURL : null;

/**
 * base64 转 blob
 * @param {String} dataURI base64字符串
 */
function dataURItoBlob(dataURI) {
  var byteString = void 0;

  if (dataURI.split(',')[0].indexOf('base64') >= 0) {
    byteString = win.atob(dataURI.split(',')[1]);
  } else {
    byteString = unescape(dataURI.split(',')[1]);
  }

  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  var ab = new ArrayBuffer(byteString.length);
  var ia = new Uint8Array(ab);

  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  var blob = void 0;
  try {
    blob = new win.Blob([ab], {
      type: mimeString
    });
  } catch (e) {
    // TypeError old chrome and FF
    win.BlobBuilder = win.BlobBuilder || win.WebKitBlobBuilder || win.MozBlobBuilder || win.MSBlobBuilder;

    if (e.name === 'TypeError' && win.BlobBuilder) {
      var bb = new win.BlobBuilder();
      bb.append(ia.buffer);
      blob = bb.getBlob(mimeString);
    } else if (e.name === 'InvalidStateError') {
      // InvalidStateError (tested on FF13 WinXP)
      blob = new win.Blob([ab], {
        type: mimeString
      });
    } else {
      // We're screwed, blob constructor unsupported entirely
    }
  }
  return blob;
}

var isObjectURL = function isObjectURL(url) {
  return (/^blob:/i.test(url)
  );
};

function objectURLToBlob(url, callback) {
  var http = new win.XMLHttpRequest();
  http.open('GET', url, true);
  http.responseType = 'blob';
  http.onload = function (e) {
    if (this.status === 200 || this.status === 0) {
      callback(this.response);
    }
  };
  http.send();
}

function httpURLToArrayBuffer(url, callback, errorCallback) {
  var http = new win.XMLHttpRequest();
  http.onload = function () {
    if (this.status === 200 || this.status === 0) {
      callback(http.response);
    } else {
      errorCallback && errorCallback('Could not load image：' + url);
    }
    http = null;
  };
  http.open('GET', url, true);
  http.responseType = 'arraybuffer';
  http.send(null);
}

function fileToArrayBuffer(file, callback, errorCallback) {
  var fileReader = new win.FileReader();

  fileReader.onload = function (e) {
    callback(e.target.result);
  };
  fileReader.onerror = errorCallback || function (error) {
    console.error('fileToArrayBuffer error: ', error);
  };

  fileReader.readAsArrayBuffer(file);
}

var isBase64Image = function isBase64Image(src) {
  return src.indexOf(';base64,') > 0;
};

/**
 * 获取图片方向
 * @param {Object} binFile ArrayBuffer
 */
function getOrientation(binFile) {
  var view = new DataView(binFile);

  if (view.getUint16(0, false) !== 0xFFD8) return -2;

  var length = view.byteLength;
  var offset = 2;

  while (offset < length) {
    var marker = view.getUint16(offset, false);
    offset += 2;

    if (marker === 0xFFE1) {
      if (view.getUint32(offset += 2, false) !== 0x45786966) {
        return -1;
      }
      var little = view.getUint16(offset += 6, false) === 0x4949;
      offset += view.getUint32(offset + 4, little);
      var tags = view.getUint16(offset, little);
      offset += 2;

      for (var i = 0; i < tags; i++) {
        if (view.getUint16(offset + i * 12, little) === 0x0112) {
          return view.getUint16(offset + i * 12 + 8, little);
        }
      }
    } else if ((marker & 0xFF00) !== 0xFF00) break;else offset += view.getUint16(offset, false);
  }
  return -1;
}

/**
 * https://github.com/stomita/ios-imagefile-megapixel
 * Rendering image element (with resizing) into the canvas element
*/
function renderImageToCanvas(img, canvas, options, doSquash) {
  var iw = img.naturalWidth;
  var ih = img.naturalHeight;
  if (!(iw + ih)) return;
  var width = options.width;
  var height = options.height;
  var ctx = canvas.getContext('2d');

  ctx.save();
  var subsampled = detectSubsampling(img);
  if (subsampled) {
    iw /= 2;
    ih /= 2;
  }
  // size of tiling canvas
  var d = 1024;
  var tmpCanvas = document.createElement('canvas');
  tmpCanvas.width = tmpCanvas.height = d;
  var tmpCtx = tmpCanvas.getContext('2d');
  var vertSquashRatio = doSquash ? detectVerticalSquash(img, iw, ih) : 1;
  var dw = Math.ceil(d * width / iw);
  var dh = Math.ceil(d * height / ih / vertSquashRatio);
  var sy = 0;
  var dy = 0;

  while (sy < ih) {
    var sx = 0;
    var dx = 0;
    while (sx < iw) {
      tmpCtx.clearRect(0, 0, d, d);
      tmpCtx.drawImage(img, -sx, -sy);
      ctx.drawImage(tmpCanvas, 0, 0, d, d, dx, dy, dw, dh);
      sx += d;
      dx += dw;
    }
    sy += d;
    dy += dh;
  }

  ctx.restore();
  tmpCanvas = tmpCtx = null;
}

/**
 * https://github.com/stomita/ios-imagefile-megapixel
 * Detect subsampling in loaded image.
 * In iOS, larger images than 2M pixels may be subsampled in rendering.
 */
function detectSubsampling(img) {
  var iw = img.naturalWidth;
  var ih = img.naturalHeight;

  if (iw * ih > 1024 * 1024) {
    // subsampling may happen over megapixel image
    var canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, -iw + 1, 0);
    // subsampled image becomes half smaller in rendering size.
    // check alpha channel value to confirm image is covering edge pixel or not.
    // if alpha value is 0 image is not covering, hence subsampled.
    return ctx.getImageData(0, 0, 1, 1).data[3] === 0;
  } else {
    return false;
  }
}

/**
 * https://github.com/stomita/ios-imagefile-megapixel
 * Detecting vertical squash in loaded image.
 * Fixes a bug which squash image vertically while drawing into canvas for some images.
 */
function detectVerticalSquash(img, iw, ih) {
  var canvas = document.createElement('canvas');

  canvas.width = 1;
  canvas.height = ih;

  var ctx = canvas.getContext('2d');

  ctx.drawImage(img, 0, 0);

  var data = ctx.getImageData(0, 0, 1, ih).data;
  // search image edge pixel position in case it is squashed vertically.
  var sy = 0;
  var ey = ih;
  var py = ih;

  while (py > sy) {
    var alpha = data[(py - 1) * 4 + 3];
    if (alpha === 0) {
      ey = py;
    } else {
      sy = py;
    }
    py = ey + sy >> 1;
  }

  var ratio = py / ih;

  return ratio === 0 ? 1 : ratio;
}

/**
 * 根据 orientation 改变 canvas 方向
 * @param {Element} canvas 画布
 * @param {Object} ctx 画布上下文
 * @param {Number} width 画布宽度
 * @param {Number} height 画布高度
 * @param {Number} orientation 方向
 */
function transformCoordinate(canvas, ctx, width, height, orientation) {
  // set proper canvas dimensions before transform & export
  if ([5, 6, 7, 8].indexOf(orientation) > -1) {
    canvas.width = height;
    canvas.height = width;
  } else {
    canvas.width = width;
    canvas.height = height;
  }

  // transform context before drawing image
  switch (orientation) {
    case 2:
      ctx.transform(-1, 0, 0, 1, width, 0);break;
    case 3:
      ctx.transform(-1, 0, 0, -1, width, height);break;
    case 4:
      ctx.transform(1, 0, 0, -1, 0, height);break;
    case 5:
      ctx.transform(0, 1, 1, 0, 0, 0);break;
    case 6:
      ctx.transform(0, 1, -1, 0, height, 0);break;
    case 7:
      ctx.transform(0, -1, -1, 0, height, width);break;
    case 8:
      ctx.transform(0, -1, 1, 0, 0, width);break;
    default:
      ctx.transform(1, 0, 0, 1, 0, 0);
  }
}

/**
 * 图片铺满容器
 * @param {Number} imgW 图片宽度
 * @param {Number} imgH 图片高度
 * @param {Number} divW 容器宽度
 * @param {Number} divH 容器高度
 */
function imgCover(imgW, imgH, divW, divH) {
  var imgScale = imgW / imgH;
  var width = divW;
  var height = width / imgScale;
  var x = 0;
  var y = -(height - divH) / 2;

  if (height < divH) {
    height = divH;
    width = imgScale * height;
    x = -(width - divW) / 2;
    y = 0;
  }

  var scale = +(width / imgW).toFixed(4);

  return {
    width: width,
    height: height,
    x: x,
    y: y,
    scale: scale
  };
}

/**
 * 加载图片
 * @param {String} src 路径
 * @param {Function} callback onload 函数
 */
function loadImage(src, callback, errorCallback) {
  var image = new win.Image();

  if (!isBase64Image(src)) {
    image.crossOrigin = '*';
  }

  image.onload = function () {
    callback(image);
  };
  image.onerror = errorCallback || function (error) {
    console.error('loadImage error: ', error);
  };
  image.src = src;

  return image;
}

// 为每种类型设置统一输出的函数
var actions$1 = {
  url: {
    getArrayBuffer: httpURLToArrayBuffer,
    toImage: loadImage
  },
  file: {
    getArrayBuffer: fileToArrayBuffer,
    toImage: function toImage(file, callback, errorCallback) {
      loadImage(URL.createObjectURL(file), callback, errorCallback);
    }
  },
  objectURL: {
    getArrayBuffer: function getArrayBuffer(objectURL, callback, errorCallback) {
      objectURLToBlob(objectURL, function (file) {
        fileToArrayBuffer(file, callback, errorCallback);
      });
    },

    toImage: loadImage
  },
  base64: {
    getArrayBuffer: function getArrayBuffer(base64, callback, errorCallback) {
      fileToArrayBuffer(dataURItoBlob(base64), callback, errorCallback);
    },

    toImage: loadImage
  },
  imageEl: {
    getArrayBuffer: function getArrayBuffer(imageEl, callback, errorCallback) {
      httpURLToArrayBuffer(imageEl.src, callback, errorCallback);
    },
    toImage: function toImage(imageEl, callback) {
      callback(imageEl);
    }
  }

  /**
   * IOS端 canvas 有大小限制，超过了会报错
   * IOS8：2000x2000
   * IOS9：4096x4096
   */
};var maximum = function () {
  if (browser.ios) {
    return {
      8: 4000000,
      9: 16777216
    };
  }
  return null;
}();

/**
 * 将图片转成canvas
 * @param {(string|file|element)} target 目标
 * @param {Function} callback 转换成功回调函数
 * @param {Object} opt 可选项
 */
function imageToCanvas(target, callback, opts) {
  var options = extendDeep({
    orientation: true,
    errorCallback: noop
  }, opts);
  var type = '';

  // file
  if (win.FileReader && (target instanceof win.Blob || target instanceof win.File)) {
    type = 'file';
  } else if (isObjectURL(target)) {
    // objectURL
    type = 'objectURL';
  } else if (target && target.tagName && target.nodeType) {
    // image
    if (target.tagName === 'IMG') {
      type = 'imageEl';
    }
    // canvas
    if (target.tagName === 'CANVAS') {
      callback(target);
      return;
    }
  } else {
    // http/https url
    type = 'url';
  }

  // 将目标转成 image 对象
  actions$1[type].toImage(target, function (image) {
    // 如果需要修正图片方向，则获取当前图片方向
    if (options.orientation) {
      // 获取 arrayBuffer 用于读取 exif 信息，最终得到图片方向
      actions$1[type].getArrayBuffer(target, function (arrayBuffer) {
        var orientation = getOrientation(arrayBuffer);

        check(target, image, orientation);
      }, options.errorCallback);
    } else {
      check(target, image);
    }
  }, options.errorCallback);

  function check(target, image, orientation) {
    var canvas = document.createElement('canvas');
    var imageWidth = image.width;
    var imageHeight = image.height;
    var ctx = canvas.getContext('2d');

    // 是否需要修正图片方向
    function shouldTransformCoordinate(width, height) {
      if (options.orientation) {
        transformCoordinate(canvas, ctx, width, height, orientation);
      } else {
        canvas.width = width;
        canvas.height = height;
      }
    }

    // 判断canvas绘制是否有最大限制，如果是并且图片大于指定宽高则分片绘制防止绘制失败
    if (maximum && maximum[browser.ios.version] && imageWidth * imageHeight > maximum[browser.ios.version]) {
      var max = Math.sqrt(maximum[browser.ios.version]);
      var size = resetSize(image, objectAssign({}, options, {
        maxWidth: max,
        maxHeight: max
      }));

      shouldTransformCoordinate(size.width, size.height);
      renderImageToCanvas(image, canvas, size, true);
    } else {
      shouldTransformCoordinate(imageWidth, imageHeight);
      ctx.drawImage(image, 0, 0);
    }

    callback(canvas);
  }
}

/**
 * 重置宽高比例，判断图片是否大于最大宽度/高度
 * @param {Element} image 图片对象
 * @param {Object} options 选项
 */
function resetSize(image, options) {
  var maxWidth = options.maxWidth,
      maxHeight = options.maxHeight,
      width = options.width,
      height = options.height;

  var imageWidth = image.naturalWidth;
  var imageHeight = image.naturalHeight;

  if (width && !height) {
    height = imageHeight * width / imageWidth << 0;
  } else if (height && !width) {
    width = imageWidth * height / imageHeight << 0;
  } else {
    width = imageWidth;
    height = imageHeight;
  }

  if (maxWidth && imageWidth > maxWidth) {
    width = maxWidth;
    height = imageHeight * width / imageWidth << 0;
  }
  if (maxHeight && height > maxHeight) {
    height = maxHeight;
    width = imageWidth * height / imageHeight << 0;
  }

  return { width: width, height: height };
}

/**
 * 获取 HTML 节点
 * @param {String} selector 选择器
 * @returns {Element} HTML节点
 */
function $(selector) {
  return isString(selector) ? document.querySelector(selector) : selector;
}

/**
 * 判断节点是否存在页面上
 * @param {Element} node 节点
 */
function isInPage(node) {
  return document.body.contains(node);
}

/**
 * 设置CSS样式
 * @param {Object} el 节点
 * @param {Object} css 样式
 */
function setStyle(el, css) {
  for (var prop in css) {
    var value = isNumber(css[prop]) ? css[prop] + 'px' : css[prop];

    if (['transform', 'transformOrigin', 'transition'].indexOf(prop) !== -1) {
      el.style['Webkit' + firstToUpperCase(prop)] = el.style[prop] = value;
    } else {
      el.style[prop] = value;
    }
  }
}

var notwhite = /\S+/g;

/**
 * 设置 className
 * @param {Element} el 节点
 * @param {Object} options 选项
 */
var setClass = function () {
  /**
   * 添加 className
   * @param {String} curClassName 当前类
   * @param {String} className 新类
   */
  function add(curClassName, className) {
    className = Array.isArray(className) ? className.join(' ') : className.match(notwhite).join(' ');

    return curClassName === '' ? className : curClassName + ' ' + className;
  }

  /**
   * 移除 className
   * @param {String} curClassName 当前类
   * @param {String} className 新类
   */
  function remove(curClassName, className) {
    var classNameArr = Array.isArray(className) ? className : className.match(notwhite);

    classNameArr.forEach(function (name) {
      curClassName = curClassName.replace(new RegExp('' + name, 'g'), '');
    });

    return curClassName.trim();
  }

  return function (el, options) {
    var className = el.className;
    if (options.remove) {
      className = remove(className, options.remove);
    }
    if (options.add) {
      className = add(className, options.add);
    }
    el.className = className;
  };
}();

function initActions(canvas) {
  // 图片缩放原点坐标
  canvas.firstOrigin = {
    x: 0,
    y: 0
    // 图片相对于canvas的坐标
  };canvas.position = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    scale: 1
    // 图片数据
  };canvas.image = {
    width: 0,
    height: 0,
    el: null
  };
}

var actions = {
  load: function load(target, callback) {
    var that = this;

    var successCallback = function successCallback(canvas) {
      that.initImageData(canvas);
      that.draw();
      that.renderAction();

      delay(function () {
        callback && callback();
        that.emit('loaded', that);
      });
    };
    var errorCallback = function errorCallback(error) {
      that.emit('error', error);
    };

    imageToCanvas(target, successCallback, { errorCallback: errorCallback });
  },
  initImageData: function initImageData(canvas) {
    var that = this;
    var _that$options = that.options,
        width = _that$options.width,
        height = _that$options.height,
        offset = _that$options.offset,
        maxScale = _that$options.maxScale;

    var image = {
      el: canvas,
      width: canvas.width,
      height: canvas.height

      // 减去偏移量获得实际容器的大小
    };var canvasWidth = width - (offset.left + offset.right);
    var canvasHeight = height - (offset.top + offset.bottom);

    // 通过imgCover实现图片铺满容器，返回图片的坐标位置
    var position = imgCover(image.width, image.height, canvasWidth, canvasHeight);

    // 需要加上偏移量
    position.x += offset.left;
    position.y += offset.top;

    // 图片尺寸比画布小时，修正最大比例和最小比例
    var _maxScale = Math.max(position.scale, maxScale);
    var _minScale = position.scale;

    that.options.maxScale = _maxScale === _minScale ? position.scale * Math.max(maxScale, 1) : maxScale;
    that.options.minScale = _minScale;
    // 图片原点
    that.firstOrigin = {
      x: position.x,
      y: position.y
    };
    that.position = position;
    that.image = image;
  },
  destroy: function destroy() {
    var that = this;

    that.removeEvent();

    if (isInPage(that.canvas)) {
      that.options.el.removeChild(that.canvas);
    }
  },
  draw: function draw() {
    var that = this;
    var context = that.context;
    var _that$options2 = that.options,
        width = _that$options2.width,
        height = _that$options2.height;
    var _that$position = that.position,
        x = _that$position.x,
        y = _that$position.y,
        scale = _that$position.scale;


    context.clearRect(0, 0, width, height);
    context.save();
    that.context.translate(x, y);
    context.scale(scale, scale);
    context.drawImage(that.image.el, 0, 0);
    context.restore();
  },
  setData: function setData(data) {
    var that = this;
    var digits = { x: 1, y: 1, scale: 4 };

    for (var prop in data) {
      that.position[prop] = toFixed(data[prop], digits[prop]);
    }
  },
  moveTo: function moveTo(x, y, transition) {
    var that = this;

    if (transition) {
      that.animate(that.position.scale, x, y);
    } else {
      that.setData({ x: x, y: y });
      that.draw();
    }
  },


  /**
   * 图片缩放，以point点为中心点进行缩放
   * @param {object} point 坐标点
   * @property {number} point.x x坐标
   * @property {number} point.y y坐标
   * @param {number} scale 缩放比例
   */
  scaleTo: function scaleTo(point, scale) {
    var that = this;

    if (scale === that.position.scale) return;

    var scaleChanged = scale / that.position.scale;

    var _calculate = calculate(that.position, that.firstOrigin, point, scale / scaleChanged, scaleChanged),
        x = _calculate.x,
        y = _calculate.y;

    that.setData({ scale: scale });
    that.moveTo(x, y);
  },
  animate: function animate(scale, xpos, ypos) {
    var that = this;

    that.animation = _animate({
      targets: [[that.position.scale, scale], [that.position.x, xpos], [that.position.y, ypos]],
      time: 450,
      type: 'easeOutCubic',
      running: function running(target) {
        that.setData({
          scale: target[0],
          x: target[1],
          y: target[2]
        });
        that.draw();
      }
    });
  }
};

var validation$1 = {
  validation: function validation() {
    var that = this;
    var _that$options = that.options,
        maxScale = _that$options.maxScale,
        minScale = _that$options.minScale;

    var scale = that.position.scale;
    var result = {
      xpos: that.position.x,
      ypos: that.position.y,
      isDraw: false

      // 缩放比例判断
    };if (scale > maxScale) {
      setScale(maxScale);
    } else if (scale < minScale) {
      setScale(minScale);
    } else {
      result = that.checkBorder(that.position, scale, that.position);
    }

    function setScale(newScale) {
      var scaleChanged = newScale / that.position.scale;

      var _calculate = calculate(that.position, that.firstOrigin, that.last.point, scale, scaleChanged),
          x = _calculate.x,
          y = _calculate.y;

      scale = newScale;
      result = that.checkBorder({ x: x, y: y }, newScale, { x: x, y: y });
      result.isDraw = true;
    }

    if (result.isDraw) {
      that.animate(scale, result.xpos, result.ypos);
    }

    return result.isDraw;
  },


  /**
   * 边界值判断
   * @param {Object} curPos 当前位置
   * @param {Number} scale 目标比例
   * @param {Object} position 目标位置
   */
  checkBorder: function checkBorder(curPos, scale, position) {
    var that = this;
    var _that$options2 = that.options,
        width = _that$options2.width,
        height = _that$options2.height,
        offset = _that$options2.offset;

    var imageWidth = scale * that.image.width;
    var imageHeight = scale * that.image.height;
    var w = width - (offset.left + offset.right) - (imageWidth - (offset.left - position.x));
    var h = height - (offset.top + offset.bottom) - (imageHeight - (offset.top - position.y));
    var xpos = curPos.x;
    var ypos = curPos.y;
    var isDraw = false;

    if (ypos > offset.top) {
      // top
      ypos = offset.top;
      isDraw = true;
    } else if (h > 0) {
      // bottom
      ypos = ypos + h;
      isDraw = true;
    }

    if (xpos > offset.left) {
      // left
      xpos = offset.left;
      isDraw = true;
    } else if (w > 0) {
      // right
      xpos = xpos + w;
      isDraw = true;
    }

    return {
      xpos: xpos,
      ypos: ypos,
      isDraw: isDraw
    };
  }
};

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();









var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

var slice$1 = Array.prototype.slice;

var EventEmitter = function () {
  function EventEmitter() {
    classCallCheck(this, EventEmitter);

    this.events = {};
  }

  createClass(EventEmitter, [{
    key: 'on',
    value: function on(eventName, fn, once) {
      var that = this;

      eventName.split(' ').forEach(function (name) {
        if (!that.events[name]) {
          that.events[name] = [];
        }
        fn && that.events[name].push({ fn: fn, once: once });
      });
      return that;
    }
  }, {
    key: 'emit',
    value: function emit(eventName) {
      var that = this;
      var args = slice$1.call(arguments, 1);

      eventName = eventName.split(' ').forEach(function (name) {
        var events = that.events[name];

        if (events) {
          var length = events.length;

          for (var i = 0; i < length; i++) {
            var current = events[i];

            if (current) {
              events[i].fn.apply(that, args);

              if (events[i].once) {
                events.splice(i--, 1);
              }
            }
          }
        }
      });
    }
  }, {
    key: 'off',
    value: function off(eventName, fn) {
      var that = this;
      var events = that.events[eventName];

      if (events) {
        // 没有回调函数则移除所有该事件下的函数
        if (!fn) {
          that.events[eventName] = [];
          return;
        }

        // 有事件名和函数
        var length = events.length;

        for (var i = 0; i < length; i++) {
          if (events[i] && events[i].fn === fn) {
            events.splice(i, 1);
            break;
          }
        }
        return;
      }

      // 没有事件名则移除所有监听函数
      if (!eventName) {
        that.events = {};
      }
    }
  }]);
  return EventEmitter;
}();

var defaults$1 = {
  el: document.body,
  // canvas宽度
  width: VIEW_WIDTH * 2,
  // canvas高度
  height: VIEW_HEIGHT * 2,
  // 最大缩放比例
  maxScale: 2,
  // touch事件绑定对象，默认为canvas
  touchTarget: null,
  // canvas位于容器的偏移量
  offset: {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0
  }
};

var Canvas = function (_EventEmitter) {
  inherits(Canvas, _EventEmitter);

  function Canvas() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    classCallCheck(this, Canvas);

    var _this = possibleConstructorReturn(this, (Canvas.__proto__ || Object.getPrototypeOf(Canvas)).call(this));

    var that = _this;

    if (options.el) {
      options.el = $(options.el);
    }

    that.options = extendDeep({}, defaults$1, options);
    that.init();
    return _this;
  }

  createClass(Canvas, [{
    key: 'init',
    value: function init() {
      var that = this;

      initRender(that);
      initEvent$1(that);
      initActions(that);
    }
  }]);
  return Canvas;
}(EventEmitter);

// 添加原型方法


objectAssign(Canvas.prototype, render$1, events, actions, validation$1);

/**
 * 缩放画布
 * @param {Element} canvas 画布
 * @param {Number} scale 比例
 */


/**
 * 复制 canvas
 * @param {Element} canvas 画布
 */
function copyCanvas(canvas) {
  var newCanvas = document.createElement('canvas');

  newCanvas.width = canvas.width;
  newCanvas.height = canvas.height;
  newCanvas.getContext('2d').drawImage(canvas, 0, 0);

  return newCanvas;
}

/**
 * 处理大图缩小有锯齿的问题
 * @param {Element} canvas 画布
 * @param {Number} scale 比例
 */
function antialisScale(canvas, scale) {
  var originCanvas = copyCanvas(canvas);
  var ctx = originCanvas.getContext('2d');
  var newCanvas = document.createElement('canvas');
  var newCtx = newCanvas.getContext('2d');

  var sourceWidth = originCanvas.width;
  var sourceHeight = originCanvas.height;
  var width = Math.ceil(sourceWidth * scale);
  var height = Math.ceil(sourceHeight * scale);

  newCanvas.width = width;
  newCanvas.height = height;

  // 缩小操作的次数
  var steps = Math.ceil(Math.log(sourceWidth / width) / Math.log(3));
  var value = 0.5;

  // 缩小操作
  // 进行steps次的减半缩小
  for (var i = 0; i < steps; i++) {
    ctx.drawImage(originCanvas, 0, 0, sourceWidth * value, sourceHeight * value);
  }
  // 放大操作
  // 进行steps次的两倍放大
  newCtx.drawImage(originCanvas, 0, 0, originCanvas.width * Math.pow(value, steps), originCanvas.height * Math.pow(value, steps), 0, 0, width, height);

  ctx = null;
  originCanvas = null;

  return newCanvas;
}

/**
 * 裁剪
 */
function drawImage(target, sx, sy, swidth, sheight, x, y, width, height) {
  var canvas = document.createElement('canvas');

  var _width = canvas.width = Math.floor(width);
  var _height = canvas.height = Math.floor(height);

  canvas.getContext('2d').drawImage(target, Math.floor(sx), Math.floor(sy), Math.floor(swidth), Math.floor(sheight), Math.floor(x), Math.floor(y), _width, _height);

  return canvas;
}

/**
 * 默认选项
 */
var defaults$$1 = {
  // 插入节点
  el: document.body,
  // 容器宽度
  viewWidth: VIEW_WIDTH,
  // 容器高度
  viewHeight: VIEW_HEIGHT,
  // 允许缩放的最大比例
  maxScale: 2,
  // 画布比例
  canvasRatio: 2,
  // 按钮文字
  confirmText: '确认',
  cancleText: '取消',
  showClass: 'crop-slide-left',
  hideClass: 'crop-slide-bottom'
};

var Crop = function () {
  function Crop() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    classCallCheck(this, Crop);

    var crop = this;

    crop.options = extendDeep({}, defaults$$1, options);

    var borderSize = Math.min(crop.options.viewWidth, crop.options.viewHeight) * 0.8;

    // 裁剪框数据
    crop.border = {
      x: (crop.options.viewWidth - borderSize) / 2,
      y: (crop.options.viewHeight - borderSize) / 2,
      width: borderSize,
      height: borderSize
    };
    crop.elements = {};

    crop.init();
  }

  createClass(Crop, [{
    key: 'init',
    value: function init() {
      this.initElement();
      this.initCanvas();
      this.initEvent();
    }
  }, {
    key: 'initElement',
    value: function initElement() {
      var crop = this;
      var _crop$options = crop.options,
          showClass = _crop$options.showClass,
          viewWidth = _crop$options.viewWidth,
          viewHeight = _crop$options.viewHeight;

      var element = document.createElement('div');

      element.innerHTML = template(crop.options);

      // 取出带有标记的节点元素
      makeArray(element.querySelectorAll('*')).forEach(function (el) {
        var value = el.getAttribute('data-el');
        if (value) {
          crop.elements[value] = el;
        }
      });

      setStyle(crop.elements.container, {
        width: viewWidth,
        height: viewHeight
      });
      setClass(crop.elements.container, { add: showClass });

      crop.setBorder(crop.border);
    }
  }, {
    key: 'initCanvas',
    value: function initCanvas() {
      var crop = this;
      var _crop$options2 = crop.options,
          canvasRatio = _crop$options2.canvasRatio,
          maxScale = _crop$options2.maxScale,
          viewWidth = _crop$options2.viewWidth,
          viewHeight = _crop$options2.viewHeight;

      var canvasOptions = {
        maxScale: maxScale,
        canvasRatio: canvasRatio,
        el: crop.elements.container,
        touchTarget: crop.elements.container,
        width: viewWidth * canvasRatio,
        height: viewHeight * canvasRatio,
        offset: crop.canvasOffset
      };

      crop.canvas = new Canvas(canvasOptions);
    }
  }, {
    key: 'initEvent',
    value: function initEvent() {
      var crop = this;

      crop.canvas.on('loaded', crop.show.bind(crop));
      crop.canvas.on('loaded', crop.render.bind(crop), true);

      crop.elements.container.addEventListener('touchstart', crop.touchstart = crop.touchstart.bind(crop));
    }
  }, {
    key: 'touchstart',
    value: function touchstart(e) {
      var eventName = e.target.getAttribute('data-touchstart');

      eventName && this[eventName] && this[eventName]();
    }
  }, {
    key: 'onCancle',
    value: function onCancle() {
      this.emit('cancle', this);
    }
  }, {
    key: 'onConfirm',
    value: function onConfirm() {
      this.emit('confirm', this);
    }
  }, {
    key: 'render',
    value: function render() {
      this.options.el.appendChild(this.elements.container);
    }
  }, {
    key: 'get',
    value: function get(options) {
      var crop = this;
      var canvasRatio = crop.options.canvasRatio;
      var _crop$canvas$position = crop.canvas.position,
          scale = _crop$canvas$position.scale,
          x = _crop$canvas$position.x,
          y = _crop$canvas$position.y;

      var clipWidth = crop.border.width * canvasRatio / scale;
      var clipHeight = crop.border.height * canvasRatio / scale;
      var clipX = (crop.border.x * canvasRatio - x) / scale;
      var clipY = (crop.border.y * canvasRatio - y) / scale;
      var count = 3;
      var _canvas = void 0;

      options = objectAssign({
        width: clipWidth,
        height: clipHeight,
        type: 'image/jpeg',
        format: 'base64',
        quality: 0.85
      }, options || {});

      var clipScale = options.width / clipWidth;
      var antialiasing = Math.ceil(Math.log(clipWidth / (clipWidth * clipScale)) / Math.log(count)) >= count;
      var _drawImage = function _drawImage(w, h) {
        return drawImage(crop.canvas.image.el, clipX, clipY, clipWidth, clipHeight, 0, 0, w, h);
      };

      // 是否需要对图片执行抗锯齿处理
      if (antialiasing) {
        _canvas = antialisScale(_drawImage(clipWidth, clipHeight), clipScale);
      } else {
        _canvas = _drawImage(options.width, Math.round(clipHeight * (options.width / clipWidth)));
      }

      var format = {
        base64: function base64() {
          return _canvas.toDataURL(options.type, options.quality);
        },
        file: function file() {
          return dataURItoBlob(format.base64());
        },
        objectUrl: function objectUrl() {
          return URL.createObjectURL(format.file());
        },
        canvas: function canvas() {
          return _canvas;
        }
      };

      if (format[options.format]) {
        return format[options.format]();
      } else {
        throw new Error('Undefined format: ' + options.format + ', Try: base64|file|objectUrl|canvas');
      }
    }

    /**
     * 设置裁剪框样式
     * @param {Object} border 位置大小
     */

  }, {
    key: 'setBorder',
    value: function setBorder(border) {
      var crop = this;
      var x = border.x,
          y = border.y,
          width = border.width,
          height = border.height;
      var _crop$options3 = crop.options,
          canvasRatio = _crop$options3.canvasRatio,
          viewWidth = _crop$options3.viewWidth,
          viewHeight = _crop$options3.viewHeight;

      var maskProps = {
        width: width,
        height: height,
        left: x - viewWidth,
        top: y - viewHeight,
        borderWidth: viewHeight + 'px ' + viewWidth + 'px'
      };
      var offset = {
        left: x * canvasRatio,
        top: y * canvasRatio,
        right: (viewWidth - width - x) * canvasRatio,
        bottom: (viewHeight - height - y) * canvasRatio
      };

      if (crop.canvas) {
        crop.canvas.options.offset = offset;
      }

      setStyle(crop.elements.mask, maskProps);

      crop.border = border;
      crop.canvasOffset = offset;
    }
  }, {
    key: 'load',
    value: function load(target) {
      this.canvas.load(target);
    }
  }, {
    key: 'on',
    value: function on() {
      return this.canvas.on.apply(this.canvas, arguments);
    }
  }, {
    key: 'emit',
    value: function emit() {
      this.canvas.emit.apply(this.canvas, arguments);
    }
  }, {
    key: 'off',
    value: function off() {
      this.canvas.off.apply(this.canvas, arguments);
    }
  }, {
    key: 'show',
    value: function show(transition) {
      var _this = this;

      var el = this.elements.container;
      var duration = transition === false ? 0 : 30;

      // 加定时器保证在其他任务完成之后执行
      delay(function () {
        setClass(el, {
          remove: CROP_HIDE
        });
        delay(function () {
          setClass(el, {
            remove: _this.options.showClass
          });
        }, duration);
      });
    }
  }, {
    key: 'hide',
    value: function hide(transition) {
      var crop = this;
      var el = crop.elements.container;
      var duration = transition === false ? 0 : 300;

      // 加定时器保证在其他任务完成之后执行
      delay(function () {
        setClass(el, {
          add: crop.options.hideClass
        });
        delay(function () {
          setClass(el, {
            add: [CROP_HIDE, crop.options.showClass],
            remove: crop.options.hideClass
          });
        }, duration);
      });
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      var crop = this;
      var container = crop.elements.container;

      crop.canvas.destroy();

      container.removeEventListener('touchstart', crop.touchstart);

      if (isInPage(container)) {
        crop.options.el.removeChild(container);
      }
    }
  }]);
  return Crop;
}();

Crop.imageToCanvas = imageToCanvas;
Crop.Canvas = Canvas;

return Crop;

})));

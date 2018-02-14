
   /*!
    * @name xcrop v1.0.0
    * @github https://github.com/ffx0s/xcrop
    * @license MIT.
    */
  
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.Crop = factory());
}(this, (function () { 'use strict';

/**
 * 空函数
 */
function noop() {}

/**
 * 获取随机uid
 * @returns {String} uid
 */


/**
 * 对象合并
 * @param {Object} target 目标对象
 * @param {Object} object 属性将会合并到目标对象上
 * @returns {Object} 返回目标对象
 */
function extend(target, object) {
  for (var key in object) {
    target[key] = object[key];
  }
  return target;
}

var URL = window.URL && window.URL.createObjectURL ? window.URL : window.webkitURL && window.webkitURL.createObjectURL ? window.webkitURL : null;

function dataURItoBlob(dataURI) {
  var byteString = void 0;

  if (dataURI.split(',')[0].indexOf('base64') >= 0) {
    byteString = window.atob(dataURI.split(',')[1]);
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
    blob = new window.Blob([ab], {
      type: mimeString
    });
  } catch (e) {
    // TypeError old chrome and FF
    window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder;

    if (e.name === 'TypeError' && window.BlobBuilder) {
      var bb = new window.BlobBuilder();
      bb.append(ia.buffer);
      blob = bb.getBlob(mimeString);
    } else if (e.name === 'InvalidStateError') {
      // InvalidStateError (tested on FF13 WinXP)
      blob = new window.Blob([ab], {
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
  var http = new window.XMLHttpRequest();
  http.open('GET', url, true);
  http.responseType = 'blob';
  http.onload = function (e) {
    if (this.status === 200 || this.status === 0) {
      callback(this.response);
    }
  };
  http.send();
}

function httpURLToArrayBuffer(url, callback) {
  var http = new window.XMLHttpRequest();
  http.onload = function () {
    if (this.status === 200 || this.status === 0) {
      callback(http.response);
    } else {
      throw new Error('Could not load image');
    }
    http = null;
  };
  http.open('GET', url, true);
  http.responseType = 'arraybuffer';
  http.send(null);
}

function scaleCanvas(canvas, scale) {
  var newCanvas = document.createElement('canvas');
  var ctx = newCanvas.getContext('2d');
  var width = canvas.width;
  var height = canvas.height;

  newCanvas.width = width * scale;
  newCanvas.height = height * scale;

  ctx.drawImage(canvas, 0, 0, width, height, 0, 0, newCanvas.width, newCanvas.height);

  return newCanvas;
}

function antialisScale(canvas, scale) {
  var newCanvas = document.createElement('canvas');
  var newCtx = newCanvas.getContext('2d');
  var ctx = canvas.getContext('2d');

  var sourceWidth = canvas.width;
  var sourceHeight = canvas.height;
  var width = sourceWidth * scale;
  var height = sourceHeight * scale;

  newCanvas.width = width;
  newCanvas.height = height;

  // 缩小操作的次数
  var steps = Math.ceil(Math.log(sourceWidth / width) / Math.log(2));

  // 缩小操作
  // 进行steps次的减半缩小
  for (var i = 0; i < steps; i++) {
    ctx.drawImage(canvas, 0, 0, sourceWidth * 0.5, sourceHeight * 0.5);
  }
  // 放大操作
  // 进行steps次的两倍放大
  newCtx.drawImage(canvas, 0, 0, canvas.width * Math.pow(0.5, steps), canvas.height * Math.pow(0.5, steps), 0, 0, width, height);

  return newCanvas;
}

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

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
  transformCoordinate(canvas, ctx, width, height, options.orientation);
  var subsampled = detectSubsampling(img);
  if (subsampled) {
    iw /= 2;
    ih /= 2;
  }
  var d = 1024; // size of tiling canvas
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
 * 改变canvas的方向
 * @param {Element} canvas 画布
 * @param {Object} ctx 画布上下文
 * @param {Number} width 画布宽度
 * @param {Number} height 画布高度
 * @param {Number} srcOrientation 方向
 */
function transformCoordinate(canvas, ctx, width, height, srcOrientation) {
  // set proper canvas dimensions before transform & export
  if ([5, 6, 7, 8].indexOf(srcOrientation) > -1) {
    canvas.width = height;
    canvas.height = width;
  } else {
    canvas.width = width;
    canvas.height = height;
  }

  // transform context before drawing image
  switch (srcOrientation) {
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
  var scale = imgW / imgH;
  var width = divW;
  var height = width / scale;
  var x = 0;
  var y = -(height - divH) / 2;

  if (height < divH) {
    height = divH;
    width = scale * height;
    x = -(width - divW) / 2;
    y = 0;
  }

  return {
    width: width,
    height: height,
    x: x,
    y: y
  };
}

/**
 * 将图片转成canvas
 * @param {(string|file|element)} target 目标
 * @param {Function} callback 转换成功回调函数
 * @param {Object} opt 可选项
 */
function imageToCanvas(target, callback, opt) {
  var options = extend({ maxWidth: 2000, maxHeight: 2000 }, opt);

  function imageOrientation(arrayBuffer, file) {
    var orientation = getOrientation(arrayBuffer);
    var isBlob = typeof file !== 'string';
    var src = isBlob ? URL.createObjectURL(file) : file;
    var doSquash = isBlob && file.type === 'image/jpeg';
    var img = new window.Image();
    if (!isBase64Image(src)) {
      img.crossOrigin = '*';
    }
    img.onload = function () {
      createCanvas(img, orientation, callback, doSquash, options);
      isBlob && URL.revokeObjectURL(src);
    };
    img.src = src;
  }

  function handleBinaryFile(file) {
    var fileReader = new window.FileReader();
    fileReader.onload = function (e) {
      imageOrientation(e.target.result, file);
    };
    fileReader.readAsArrayBuffer(file);
  }

  // 文件对象
  if (window.FileReader && (target instanceof window.Blob || target instanceof window.File)) {
    handleBinaryFile(target);
    return;
  }

  // imageElement 或者 canvasElement
  if ((typeof target === 'undefined' ? 'undefined' : _typeof(target)) === 'object' && target.nodeType) {
    if (target.tagName === 'IMG') {
      imageToCanvas(target.src, callback);
    }
    if (target.tagName === 'CANVAS') {
      callback(target);
    }
    return;
  }

  // base64图片
  if (isBase64Image(target)) {
    handleBinaryFile(dataURItoBlob(target));
    return;
  }

  // objectURL
  if (isObjectURL(target)) {
    objectURLToBlob(target, handleBinaryFile);
  } else {
    // http/https图片地址
    httpURLToArrayBuffer(target, function (arrayBuffer) {
      imageOrientation(arrayBuffer, target);
    });
  }
}

function createCanvas(img, orientation, callback, doSquash, options) {
  var canvas = document.createElement('canvas');
  var maxWidth = options.maxWidth,
      maxHeight = options.maxHeight,
      width = options.width,
      height = options.height;

  var imgWidth = img.naturalWidth;
  var imgHeight = img.naturalHeight;
  if (width && !height) {
    height = imgHeight * width / imgWidth << 0;
  } else if (height && !width) {
    width = imgWidth * height / imgHeight << 0;
  } else {
    width = imgWidth;
    height = imgHeight;
  }
  if (maxWidth && imgWidth > maxWidth) {
    width = maxWidth;
    height = imgHeight * width / imgWidth << 0;
  }
  if (maxHeight && height > maxHeight) {
    height = maxHeight;
    width = imgWidth * height / imgHeight << 0;
  }
  renderImageToCanvas(img, canvas, { orientation: orientation, width: width, height: height }, doSquash);
  callback(canvas);
}

/**
 * 简单封装创建节点和绑定移除事件的操作
 */

/**
 * 节点对象
 * @param {String} tagName 节点标签
 * @param {Object} attr 属性
 * @param {Array} children 子节点
 */
function Element(tagName, attr) {
  var children = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

  for (var name in attr) {
    this[name] = attr[name];
  }
  this.tagName = tagName;
  this.children = children;
}

Element.prototype = {
  // 创建节点
  create: function create() {
    this.el = document.createElement(this.tagName);
    this.el.className = this.className;
    this.addEvent();
    return this.el;
  }

  /**
   * 绑定/移除事件方法
   */
};['addEvent', 'removeEvent'].forEach(function (value) {
  Element.prototype[value] = function () {
    for (var eventName in this.events) {
      this.el[value + 'Listener'](eventName, this.events[eventName], false);
    }
  };
});

/**
 * 创建dom节点
 * @param {Object} element Element实例化的对象
 * @param {Function} callback 创建完成回调
 */
function createElement(element) {
  var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : noop;

  if (typeof element === 'string') {
    var _node = document.createTextNode(element);
    callback(element);
    return _node;
  }

  var node = element.create();

  // 如果有子节点，则递归调用创建
  element.children.forEach(function (child) {
    var childNode = createElement(child, callback);
    node.appendChild(childNode);
  });

  callback(element);

  return node;
}

/**
 * 从html中移除dom节点及绑定事件
 * @param {Object} element Element实例化的对象
 * @param {Boolean} flag 是否从html中移除节点
 */
function removeElement(element, flag) {
  if (typeof element === 'string') return;
  element.children.forEach(function (child) {
    removeElement(child, false);
  });
  element.removeEvent();
  if (flag) {
    document.body.removeChild(element.el);
  }
}

/**
 * 渲染样式
 * @param {String} cssText css样式
 * @param {Element} elem css插入节点
 */
function renderStyle(cssText) {
  var elem = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document.getElementsByTagName('head')[0];

  var styleElem = document.createElement('style');
  try {
    styleElem.appendChild(document.createTextNode(cssText));
  } catch (err) {
    styleElem.stylesheet.cssText = cssText;
  }
  elem.appendChild(styleElem);
  return styleElem;
}

function initRender(pinch) {
  pinch.canvas = createCanvas$1(pinch.options.width, pinch.options.height);
  pinch.context = pinch.canvas.getContext('2d');
}

function addRender(Pinch) {
  var proto = Pinch.prototype;

  proto.render = function () {
    var pinch = this;
    var options = pinch.options;
    options.el = typeof options.el === 'string' ? document.querySelector(options.el) : options.el;
    options.el.appendChild(pinch.canvas);
    // 获取canvas位于html里实际的大小
    pinch.rect = pinch.canvas.getBoundingClientRect();
    // 利用canvas的宽度和实际的宽度作为它的大小比例
    pinch.canvasScale = options.width / pinch.rect.width;
  };
}

/**
 * 创建一个宽高为100%的画布
 * @param {Number} width 画布宽度
 * @param {Number} height 画布高度
 */
function createCanvas$1(width, height) {
  var canvas = document.createElement('canvas');

  canvas.width = width;
  canvas.height = height;
  canvas.style.cssText = 'width:100%;height:100%;';

  return canvas;
}

var slice = Array.prototype.slice;

function Observer() {
  this.events = {};
}

Observer.prototype = {
  on: function on(signals, fn) {
    var ob = this;

    signals.split(' ').forEach(function (signal) {
      if (!ob.events[signal]) {
        ob.events[signal] = [];
      }
      fn && ob.events[signal].push(fn);
    });
  },
  emit: function emit(signals) {
    var ob = this;
    var args = slice.call(arguments, 1);

    signals = signals.split(' ').forEach(function (signal) {
      var events = ob.events[signal];
      if (events) {
        events.forEach(function (fn) {
          return fn.apply(ob, args);
        });
      }
    });
  },
  off: function off(signal, fn) {
    var ob = this;

    var events = ob.events[signal];
    if (events) {
      events.forEach(function (fn) {
        return events.splice(events.indexOf(fn), 1);
      });
    }
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

// requestAnimationFrame 兼容处理
var requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
  return window.setTimeout(callback, 1000 / 60);
};

// cancelAnimationFrame 兼容处理
var cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame || function (id) {
  clearTimeout(id);
};

/**
 * 获取当前时间戳
 * @returns {Number} 时间戳
 */
var now = function now() {
  return new Date().getTime();
};

/**
 * 动画执行函数，仅在opiotns.running函数返回数值，不做具体元素的动画操作
 * @param {Object} options 选项
 * @property {Number} [options.time = 500] 在指定时间（ms）内完成动画，默认500ms
 * @property {String} [options.type = 'easeOutQuad'] 动画类型，默认linear
 * @property {Array} options.targets 二维数组，存放起始值与目标值，例：[[0, 100], [100, 0]]，表示起始值0到目标值100的过程中的变化，变化的数值会作为options.running函数的参数返回
 * @property {Function} options.running - options.targets数值变化过程会执行这个函数
 * @property {Function} options.end 结束后的回调函数
 */
var animate = function (options) {
  var timer = null;
  var _options$time = options.time,
      time = _options$time === undefined ? 500 : _options$time,
      _options$type = options.type,
      type = _options$type === undefined ? 'easeOutQuad' : _options$type,
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

function initEvent(pinch) {
  pinch.eventList = ['mousewheel', 'touchstart', 'touchmove', 'touchend'];
  pinch.observer = new Observer();
  // 最后一次触摸操作的参数
  pinch.last = {
    scale: 1,
    point: { x: 0, y: 0 },
    move: { x: 0, y: 0 },
    time: 0,
    dis: { time: 0, x: 0, y: 0 }
  };
  pinch.touchDelay = 3;
  pinch.animation = { stop: noop };
}

function addEvent(Pinch) {
  var proto = Pinch.prototype;

  proto.bindEvent = function () {
    var pinch = this;
    var target = pinch.options.touchTarget || pinch.canvas;
    pinch.eventList.forEach(function (value) {
      target.addEventListener(value, pinch, false);
    });
  };

  proto.handleEvent = function (e) {
    var pinch = this;
    switch (e.type) {
      case 'touchstart':
        pinch.touchstart(e);
        break;
      case 'touchmove':
        pinch.touchmove(e);
        break;
      case 'touchend':
        pinch.touchend(e);
        break;
      // debug
      case 'mousewheel':
        pinch.mousewheel(e);
        break;
    }
  };

  // debug
  proto.mousewheel = function (e) {
    e.preventDefault();
    var pinch = this;
    pinch.rect = pinch.canvas.getBoundingClientRect();
    var point = {
      x: (e.clientX - pinch.rect.left) * pinch.canvasScale,
      y: (e.clientY - pinch.rect.top) * pinch.canvasScale
    };
    var STEP = 0.99;
    var factor = e.deltaY;
    var scaleChanged = Math.pow(STEP, factor);
    pinch.last.point = point;
    pinch.scaleTo(point, pinch.scale * scaleChanged);
    pinch.emit('mousewheel', e);
  };

  proto.touchstart = function (e) {
    e.preventDefault();
    var pinch = this;
    var touches = e.touches;
    pinch.rect = pinch.canvas.getBoundingClientRect();
    pinch.animation.stop();
    if (touches.length === 2) {
      pinch.pinchstart(e);
    } else if (touches.length === 1) {
      pinch.dragstart(e);
    }
  };

  proto.touchmove = function (e) {
    var pinch = this;
    var touches = e.touches;
    if (touches.length === 2) {
      pinch.pinchmove(e);
    } else if (touches.length === 1) {
      pinch.dragmove(e);
    }
  };

  proto.touchend = function (e) {
    var pinch = this;
    var touches = e.touches;
    if (touches.length) {
      // pinch end
      pinch.emit('pinchend', e);
      pinch.dragstart(e);
    } else {
      // drag end
      pinch.dragend(e);
    }
  };

  proto.dragstart = function (e) {
    var pinch = this;
    var touches = e.touches;

    pinch.last.move = {
      x: touches[0].clientX - pinch.rect.left,
      y: touches[0].clientY - pinch.rect.top
    };
    pinch.last.dis = { time: 0, x: 0, y: 0 };
    pinch.last.time = new Date().getTime();
    pinch.touchDelay = 3;
    pinch.emit('dragstart', e);
  };

  proto.dragmove = function (e) {
    var pinch = this;
    var touches = e.touches;
    var move = {
      x: touches[0].clientX - pinch.rect.left,
      y: touches[0].clientY - pinch.rect.top
    };
    var x = (move.x - pinch.last.move.x) * pinch.canvasScale;
    var y = (move.y - pinch.last.move.y) * pinch.canvasScale;
    var nowTime = new Date().getTime();
    pinch.last.dis = { x: x, y: y, time: nowTime - pinch.last.time };
    pinch.last.time = nowTime;
    pinch.last.move = move;
    // 延迟防止手误操作
    if (pinch.touchDelay) {
      pinch.touchDelay--;
      return;
    }
    pinch.moveTo(pinch.position.x + x, pinch.position.y + y);
    pinch.emit('dragmove', e);
  };

  proto.dragend = function (e) {
    var pinch = this;
    if (!pinch.validation()) {
      // 缓冲动画
      var vx = pinch.last.dis.x / pinch.last.dis.time;
      var vy = pinch.last.dis.y / pinch.last.dis.time;
      var speed = 0.5;
      if (Math.abs(vx) > speed || Math.abs(vy) > speed) {
        var time = 200;
        var x = pinch.position.x + vx * time;
        var y = pinch.position.y + vy * time;
        var result = pinch.checkBorder({ x: x, y: y }, pinch.scale, { x: x, y: y });
        if (result.isDraw) {
          x = result.xpos;
          y = result.ypos;
        }
        pinch.animation = animate({
          time: time * 2,
          targets: [[pinch.position.x, x], [pinch.position.y, y]],
          type: 'easeOutStrong',
          running: function running(target) {
            pinch.position.x = target[0];
            pinch.position.y = target[1];
            pinch.draw();
          },
          end: function end() {
            pinch.validation();
          }
        });
      }
    }
    pinch.emit('dragend', e);
  };

  proto.pinchstart = function (e) {
    var pinch = this;
    var zoom = touchEach(e.touches, function (touch) {
      return { x: touch.clientX, y: touch.clientY };
    });
    var touchCenter = Pinch.getTouchCenter(zoom);
    pinch.last.zoom = zoom;
    pinch.last.point = {
      x: (touchCenter.x - pinch.rect.left) * pinch.canvasScale,
      y: (touchCenter.y - pinch.rect.top) * pinch.canvasScale
    };
    pinch.touchDelay = 5;
    pinch.emit('pinchstart', e);
  };

  proto.pinchmove = function (e) {
    var pinch = this;
    var zoom = touchEach(e.touches, function (touch) {
      return { x: touch.clientX, y: touch.clientY };
    });
    // 双指的中心点
    var touchCenter = Pinch.getTouchCenter(zoom);
    // 相对于canvas画布的中心点
    var point = {
      x: (touchCenter.x - pinch.rect.left) * pinch.canvasScale,
      y: (touchCenter.y - pinch.rect.top) * pinch.canvasScale
      // 双指两次移动间隔的差值
    };var disX = point.x - pinch.last.point.x;
    var disY = point.y - pinch.last.point.y;
    // 双指两次移动间隔的比例
    var scaleChanged = Pinch.getScale(pinch.last.zoom, zoom);
    pinch.last.zoom = zoom;
    pinch.last.point = point;
    // 延迟防止手误操作
    if (pinch.touchDelay) {
      pinch.touchDelay--;
      return;
    }
    pinch.position.x += disX;
    pinch.position.y += disY;
    pinch.scaleTo(point, pinch.scale * scaleChanged);
    pinch.emit('pinchmove', e);
  };

  proto.emit = function (name) {
    this.observer.emit.apply(this.observer, arguments);
  };['on', 'off'].forEach(function (value) {
    proto[value] = function (name, fn) {
      this.observer[value](name, fn && fn.bind(this));
    };
  });
}

function touchEach(touches, callback) {
  var arr = [];
  for (var attr in touches) {
    if (typeof +attr === 'number' && !isNaN(+attr)) {
      arr.push(callback(touches[attr], attr));
    }
  }
  return arr;
}

function initActions(pinch) {
  // 缩放比例
  pinch.scale = 1;
  // 图片缩放原点坐标
  pinch.firstOrigin = { x: 0, y: 0
    // 图片相对于canvas的坐标
  };pinch.position = { x: 0, y: 0, width: 0, height: 0
    // 图片数据
  };pinch.image = { width: 0, height: 0, el: null };
}

function addActions(Pinch) {
  var proto = Pinch.prototype;

  // 加载目标图片
  proto.load = function (target, callback) {
    var pinch = this;
    var _pinch$options = pinch.options,
        width = _pinch$options.width,
        height = _pinch$options.height,
        offset = _pinch$options.offset,
        loaded = _pinch$options.loaded,
        maxTargetWidth = _pinch$options.maxTargetWidth,
        maxTargetHeight = _pinch$options.maxTargetHeight,
        maxScale = _pinch$options.maxScale;


    imageToCanvas(target, success, { maxWidth: maxTargetWidth, maxHeight: maxTargetHeight });

    function success(canvas) {
      // image.el为原目标图片的canvas版本，后续画布drawImage会用到
      var image = { el: canvas, width: canvas.width, height: canvas.height
        // 减去偏移量获得实际容器的大小
      };var pinchWidth = width - (offset.left + offset.right);
      var pinchHeight = height - (offset.top + offset.bottom);
      // 通过imgCover实现图片铺满容器，返回图片的坐标位置
      pinch.position = imgCover(image.width, image.height, pinchWidth, pinchHeight);
      // 需要加上偏移量
      pinch.position.x += offset.left;
      pinch.position.y += offset.top;
      // 图片缩放比例
      pinch.scale = pinch.position.width / image.width;
      // 图片尺寸比画布小时，修正最大比例和最小比例
      var _maxScale = Math.max(pinch.scale, maxScale);
      var _minScale = pinch.scale;
      pinch.options.maxScale = _maxScale === _minScale ? pinch.scale * Math.max(maxScale, 1) : maxScale;
      pinch.options.minScale = _minScale;
      pinch.image = image;
      // 图片原点
      pinch.firstOrigin = {
        x: pinch.position.x,
        y: pinch.position.y
      };
      pinch.draw();
      setTimeout(function () {
        callback && callback();
        loaded.call(pinch);
      });
    }
  };

  proto.remove = function () {
    var pinch = this;
    var target = pinch.options.touchTarget || pinch.canvas;

    pinch.eventList.forEach(function (value) {
      target.removeEventListener(value, pinch, false);
    });

    pinch.options.el.removeChild(pinch.canvas);
  };

  proto.draw = function () {
    var pinch = this;
    var options = pinch.options;
    var context = pinch.context;
    var _pinch$position = pinch.position,
        x = _pinch$position.x,
        y = _pinch$position.y;


    context.clearRect(0, 0, options.width, options.height);
    context.save();
    pinch.context.translate(x, y);
    context.scale(pinch.scale, pinch.scale);
    context.drawImage(pinch.image.el, 0, 0, pinch.image.width, pinch.image.height);
    context.restore();
  };

  proto.moveTo = function (xpos, ypos, transition) {
    var pinch = this;
    if (transition) {
      pinch.animate(pinch.scale, xpos, ypos);
    } else {
      pinch.position.x = xpos;
      pinch.position.y = ypos;
      pinch.draw();
    }
  };

  /**
   * 图片缩放函数，以point点为中心点进行缩放
   * @param {object} point 坐标点
   * @property {number} point.x x坐标
   * @property {number} point.y y坐标
   * @param {number} zoom 缩放比例
   */

  proto.scaleTo = function (point, scale) {
    var pinch = this;
    if (scale === pinch.scale) return;
    var scaleChanged = scale / pinch.scale;

    var _Pinch$calculate = Pinch.calculate(pinch.position, pinch.firstOrigin, point, scale / scaleChanged, scaleChanged),
        x = _Pinch$calculate.x,
        y = _Pinch$calculate.y;

    pinch.scale = scale;
    pinch.moveTo(x, y);
  };

  proto.animate = function (scale, xpos, ypos) {
    var pinch = this;
    pinch.animation = animate({
      targets: [[pinch.scale, scale], [pinch.position.x, xpos], [pinch.position.y, ypos]],
      time: 450,
      type: 'easeOutCubic',
      running: function running(target) {
        pinch.scale = target[0];
        pinch.position.x = target[1];
        pinch.position.y = target[2];
        pinch.draw();
      }
    });
  };
}

function addValidation(Pinch) {
  var proto = Pinch.prototype;

  proto.validation = function () {
    var pinch = this;
    var _pinch$options = pinch.options,
        maxScale = _pinch$options.maxScale,
        minScale = _pinch$options.minScale;

    var scale = pinch.scale;
    var result = { xpos: pinch.position.x, ypos: pinch.position.y, isDraw: false
      // 缩放比例判断
    };if (scale > maxScale) {
      setScale(maxScale);
    } else if (scale < minScale) {
      setScale(minScale);
    } else {
      result = pinch.checkBorder(pinch.position, scale, pinch.position);
    }
    function setScale(newScale) {
      var scaleChanged = newScale / pinch.scale;

      var _Pinch$calculate = Pinch.calculate(pinch.position, pinch.firstOrigin, pinch.last.point, scale, scaleChanged),
          x = _Pinch$calculate.x,
          y = _Pinch$calculate.y;

      scale = newScale;
      result = pinch.checkBorder({ x: x, y: y }, newScale, { x: x, y: y });
      result.isDraw = true;
    }

    if (result.isDraw) {
      pinch.animate(scale, result.xpos, result.ypos);
    }
    return result.isDraw;
  };

  /**
   * 边界值判断
   * @param {Object} curPos 当前位置
   * @param {Number} scale 目标比例
   * @param {Object} position 目标位置
   */
  proto.checkBorder = function (curPos, scale, position) {
    var pinch = this;
    var _pinch$options2 = pinch.options,
        width = _pinch$options2.width,
        height = _pinch$options2.height,
        offset = _pinch$options2.offset;

    var imageWidth = scale * pinch.image.width;
    var imageHeight = scale * pinch.image.height;
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
  };
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
 * 以点坐标为原点计进行缩放，计算缩放后位置的函数，返回缩放后的x,y,scale值
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

var addGlobal = function (Pinch) {
  Pinch.getTouchCenter = getTouchCenter;
  Pinch.getDistance = getDistance;
  Pinch.getScale = getScale;
  Pinch.calculate = calculate;
  Pinch.Observer = Observer;
};

function getDefaultOptions$1() {
  return {
    target: null,
    maxTargetWidth: 2000,
    maxTargetHeight: 2000,
    el: null,
    // canvas宽度
    width: 800,
    // canvas高度
    height: 800,
    // 最大缩放比例，最小缩放比例默认为 canvas 与图片大小计算的比例
    maxScale: 2,
    touchTarget: null,
    // canvas位于容器的偏移量
    offset: {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
    },
    loaded: noop
  };
}

function Pinch(el, options) {
  options.el = el;
  this.init(options);
  this.render();
  this.bindEvent();
  this.load(options.target);
}

Pinch.prototype.init = function (options) {
  var pinch = this;

  pinch.options = extend(getDefaultOptions$1(), options);

  initRender(pinch);
  initEvent(pinch);
  initActions(pinch);
};

// 添加静态方法
addGlobal(Pinch);
// 添加渲染相关的原型方法
addRender(Pinch);
// 添加事件相关的原型方法
addEvent(Pinch);
// 添加操作相关的原型方法
addActions(Pinch);
// 添加验证相关的原型方法
addValidation(Pinch);

/**
 * 获取裁剪默认选项
 */
function getDefaultOptions() {
  return {
    // 允许图片的最大宽度
    maxTargetWidth: 2000,
    // 允许图片的最大高度
    maxTargetHeight: 2000,
    // 插入到el节点
    el: document.body,
    // 裁剪框width
    width: 300,
    // 裁剪框height
    height: 300,
    // 图片初始x坐标
    x: undefined,
    // 图片初始y坐标
    y: undefined,
    // 允许缩放的最大比例
    maxScale: 2,
    // canavs画布比例
    canvasScale: 2,
    // 代理触摸事件的节点
    touchTarget: null,
    // 生命周期函数
    created: noop, // 创建完成
    mounted: noop, // 已插入到页面节点
    loaded: noop, // 裁剪的图片加载完成
    // 取消事件回调
    cancle: noop,
    // 确认事件回调
    confirm: noop
  };
}

/**
 * 裁剪对象
 * @param {Object} options 裁剪选项
 */
function Crop(options) {
  this.init(options);
}

Crop.prototype = {
  /**
   * 初始化
   * @param {Object} options 裁剪选项
   */
  init: function init(options) {
    this.options = extend(getDefaultOptions(), options);
    this.create();
  },
  /**
   * 创建dom节点
   */
  create: function create() {
    var crop = this;
    var options = crop.options;
    var el = options.el;

    crop.options.el = el = typeof el === 'string' ? document.querySelector(el) : el;

    var styles = [];
    var width = options.width;
    var height = options.height;
    var docEl = document.documentElement;

    // 裁剪最外层div
    var wrapProps = {
      className: 'crop-wrap',
      width: docEl.clientWidth,
      height: docEl.clientHeight,
      style: function style() {
        return '\n          .' + this.className + ' {\n            position: fixed;\n            left: 0;\n            top: 0;\n            overflow: hidden;\n            width: ' + this.width + 'px;\n            height: ' + this.height + 'px;\n            background: #000;\n            z-index: 99;\n          }\n        ';
      }
      // 遮罩层
    };var maskProps = {
      className: 'crop-mask',
      left: typeof options.x === 'number' ? options.x - wrapProps.width : -(width + wrapProps.width) / 2,
      top: typeof options.y === 'number' ? options.y - wrapProps.height : -(height + wrapProps.height) / 2,
      style: function style() {
        return '\n          .' + this.className + ' {\n            position: absolute; \n            left: ' + this.left + 'px;\n            top: ' + this.top + 'px;\n            width: ' + width + 'px; \n            height: ' + height + 'px; \n            overflow: hidden;\n            border: 1px solid rgba(0, 0, 0, .6);\n            border-width: ' + wrapProps.height + 'px ' + wrapProps.width + 'px;\n            transform: translateZ(0);\n            -webkit-transform: translateZ(0);\n            box-sizing: content-box;\n          }\n          .' + this.className + ':after {\n            position: absolute;\n            left: 0;\n            top: 0;\n            float: left;\n            content: \'\';\n            width: 200%;\n            height: 200%;\n            border: 1px solid #fff;\n            -webkit-box-sizing: border-box;\n            box-sizing: border-box;\n            -webkit-transform: scale(0.5);\n            transform: scale(0.5);\n            -webkit-transform-origin: 0 0;\n            transform-origin: 0 0;\n          }\n        ';
      }
      // 底部按钮外层div
    };var handleProps = {
      className: 'crop-handle',
      style: function style() {
        return '\n          .' + this.className + ' {\n            position: absolute;\n            bottom: 0;\n            left: 0;\n            width: 100%;\n            height: 50px;\n            line-height: 50px;\n            transform: translateZ(0);\n            -webkit-transform: translateZ(0);\n          }\n          .' + this.className + ' > div {\n            height: 100px;\n            width: 80px;\n            color: #fff;\n            font-size: 16px;\n            text-align: center;\n          }\n        ';
      }
      // 取消按钮
    };var cancleProps = {
      className: 'crop-cancle',
      style: function style() {
        return '\n          .' + this.className + ' {\n            float: left;\n          }\n        ';
      },
      events: {
        touchstart: options.cancle.bind(crop)
      }
      // 确认按钮
    };var confirmProps = {
      className: 'crop-confirm',
      style: function style() {
        return '\n          .' + this.className + ' {\n            float: right;\n          }\n        ';
      },
      events: {
        touchstart: options.confirm.bind(crop)
      }

      // 实例化节点对象
    };crop.root = new Element('div', wrapProps, [new Element('div', maskProps), new Element('div', handleProps, [new Element('div', cancleProps, ['取消']), new Element('div', confirmProps, ['确认'])])]);

    // 创建dom节点
    createElement(crop.root, function (element) {
      element.style && styles.push(element.style());
    });
    crop.styles = styles.join('');
    crop.area = { width: width, height: height };

    options.x = wrapProps.width + maskProps.left;
    options.y = wrapProps.height + maskProps.top;

    options.created.call(crop);
  },
  render: function render() {
    var crop = this;
    var options = crop.options;
    if (!Crop.isRenderStyle) {
      renderStyle(crop.styles);
      Crop.isRenderStyle = true;
    }
    options.el.appendChild(crop.root.el);
    initPinch(crop);
    setTimeout(function () {
      options.mounted.call(crop);
    }, 0);
  },
  get: function get() {
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { width: undefined, height: undefined, type: 'image/jpeg', quality: 0.85, format: 'canvas' };

    var crop = this;
    var pinch = crop.pinch;
    var width = config.width,
        height = config.height,
        type = config.type,
        quality = config.quality,
        format = config.format;

    var scale = pinch.options.width / pinch.rect.width;
    var clipWidth = crop.area.width * scale;
    var clipHeight = crop.area.height * scale;
    var defaultCanvas = getDefaultCanvas();

    function getDefaultCanvas() {
      var canvas = document.createElement('canvas');
      var x = pinch.options.offset.left;
      var y = pinch.options.offset.top;
      var ctx = canvas.getContext('2d');
      canvas.width = clipWidth;
      canvas.height = clipHeight;
      ctx.drawImage(pinch.canvas, x, y, clipWidth, clipHeight, 0, 0, clipWidth, clipHeight);
      return canvas;
    }

    var result = {};
    var value = width || height;
    if (value) {
      var clipScale = width ? width / clipWidth : height / clipHeight;
      var newCanvas = value >= 150 ? scaleCanvas(defaultCanvas, clipScale) : antialisScale(defaultCanvas, clipScale);
      result.canvas = newCanvas;
    } else {
      result.canvas = defaultCanvas;
    }

    switch (format) {
      case 'src':
        result.src = result.canvas.toDataURL(type, quality);
        break;
      case 'blob':
        result.blob = dataURItoBlob(result.canvas.toDataURL(type, quality));
        break;
      case 'url':
        result.url = URL.createObjectURL(dataURItoBlob(result.canvas.toDataURL(type, quality)));
    }

    return result;
  },
  load: function load(target) {
    var crop = this;
    crop.options.target = target;
    if (crop.pinch) {
      crop.pinch.load(target);
    } else {
      this.render();
    }
  },
  show: function show() {
    var _this = this;

    // 加定时器保证在其他任务完成之后执行
    setTimeout(function () {
      _this.root.el.style.display = 'block';
    });
  },
  hide: function hide() {
    var _this2 = this;

    // 加定时器保证在其他任务完成之后执行
    setTimeout(function () {
      _this2.root.el.style.display = 'none';
    });
  },
  destroy: function destroy() {
    var crop = this;
    if (crop.pinch) {
      crop.pinch.remove();
      removeElement(crop.root, crop.options.el);
    }
  },
  moveTo: function moveTo(x, y) {
    var transition = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

    var result = this.pinch.checkBorder({ x: x, y: y }, this.pinch.scale, { x: x, y: y });
    if (result.isDraw) {
      x = result.xpos;
      y = result.ypos;
    }
    this.pinch.moveTo(x, y, transition);
  },
  scaleTo: function scaleTo(point, zoom) {
    this.pinch.scaleTo(point, zoom);
  }
};

Crop.isRenderStyle = false;
Crop.loadImage = imageToCanvas;
Crop.Pinch = Pinch;

function initPinch(crop) {
  var _crop$options = crop.options,
      target = _crop$options.target,
      maxTargetWidth = _crop$options.maxTargetWidth,
      maxTargetHeight = _crop$options.maxTargetHeight,
      canvasScale = _crop$options.canvasScale,
      x = _crop$options.x,
      y = _crop$options.y,
      el = _crop$options.el,
      maxScale = _crop$options.maxScale,
      minScale = _crop$options.minScale,
      loaded = _crop$options.loaded;
  var _crop$root = crop.root,
      touchTarget = _crop$root.el,
      width = _crop$root.width,
      height = _crop$root.height;

  var pinchOptions = {
    target: target,
    maxTargetWidth: maxTargetWidth,
    maxTargetHeight: maxTargetHeight,
    el: el,
    maxScale: maxScale,
    minScale: minScale,
    loaded: loaded,
    touchTarget: touchTarget,
    width: width * canvasScale,
    height: height * canvasScale,
    offset: {
      left: x * canvasScale,
      right: (width - crop.area.width - x) * canvasScale,
      top: y * canvasScale,
      bottom: (height - crop.area.height - y) * canvasScale
    }
  };
  crop.pinch = new Pinch(touchTarget, pinchOptions);
}

return Crop;

})));

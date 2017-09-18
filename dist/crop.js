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

function touchEach(touches, callback) {
  var arr = [];
  for (var attr in touches) {
    if (typeof +attr === 'number' && !isNaN(+attr)) {
      arr.push(callback(touches[attr], attr));
    }
  }
  return arr;
}

function initEvent(pinch) {
  pinch.eventList = ['mousewheel', 'touchstart', 'touchmove', 'touchend'];
  pinch.isMove = false;
  pinch.isLock = false;
  pinch.observer = new Observer();
}

function bindEvent(pinch) {
  var target = pinch.options.touchTarget || pinch.canvas;
  pinch.eventList.forEach(function (value) {
    target.addEventListener(value, pinch, false);
  });
}

function addEvent(Pinch) {
  var proto = Pinch.prototype;

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

  proto.mousewheel = function (e) {
    e.preventDefault();

    var pinch = this;
    var zoomIntensity = 0.01;
    var mouse = {
      x: e.clientX - pinch.rect.left,
      y: e.clientY - pinch.rect.top
    };
    var wheel = e.wheelDelta / 520;
    var zoom = Math.exp(wheel * zoomIntensity);

    pinch.scaleTo(mouse, zoom);
    pinch.validation();
    pinch.emit('mousewheel', e);
  };

  proto.touchstart = function (e) {
    e.preventDefault();

    var pinch = this;
    var touches = e.touches;

    if (pinch.isLock) return false;

    if (touches.length === 2) {
      pinch.pinchstart(e);
    } else if (touches.length === 1) {
      pinch.dragstart(e);
    }

    pinch.isMove = true;
  };

  proto.touchmove = function (e) {
    var pinch = this;
    var touches = e.touches;

    if (!pinch.isMove || pinch.isLock) return false;

    if (touches.length === 2) {
      pinch.pinchmove(e);
    } else if (touches.length === 1) {
      pinch.dragmove(e);
    }
  };

  proto.touchend = function (e) {
    var pinch = this;

    if (pinch.isLock) return false;

    pinch.isMove = false;

    pinch.validation();
    pinch.emit('touchend', e);
  };

  proto.dragstart = function (e) {
    var pinch = this;
    var touches = e.touches;

    pinch.dragStart = {
      x: touches[0].pageX - pinch.rect.left,
      y: touches[0].pageY - pinch.rect.top
    };
    pinch.lastMove = {
      x: pinch.position.x - pinch.origin.x,
      y: pinch.position.y - pinch.origin.y
    };

    pinch.emit('touchstart', e);
  };

  proto.dragmove = function (e) {
    var pinch = this;
    var touches = e.touches;
    var move = {
      x: touches[0].pageX - pinch.rect.left - pinch.dragStart.x,
      y: touches[0].pageY - pinch.rect.top - pinch.dragStart.y
    };
    var speed = pinch.canvasScale / pinch.scale;
    var x = pinch.lastMove.x + move.x * speed;
    var y = pinch.lastMove.y + move.y * speed;

    pinch.moveTo(x, y);
    pinch.emit('touchmove', e);
  };

  proto.pinchstart = function (e) {
    var pinch = this;

    pinch.zoomStart = touchEach(e.touches, function (touch) {
      return { x: touch.pageX, y: touch.pageY };
    });

    pinch.zoomCount = 0;

    pinch.emit('pinchstart', e);
  };

  proto.pinchmove = function (e) {
    var pinch = this;

    if (!pinch.isMove) return false;

    pinch.zoomCount++;

    pinch.zoomEnd = touchEach(e.touches, function (touch) {
      return { x: touch.pageX, y: touch.pageY };
    });

    var touchCenter = Pinch.getTouchCenter(pinch.zoomEnd);
    var scale = Pinch.getScale(pinch.zoomStart, pinch.zoomEnd);

    if (pinch.zoomCount <= 2) {
      pinch.lastScale = scale;
      return false;
    }

    var zoom = 1 + scale - pinch.lastScale;
    var move = {
      x: touchCenter.x - pinch.rect.left,
      y: touchCenter.y - pinch.rect.top
    };

    pinch.scaleTo(move, zoom);
    pinch.lastScale = scale;
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

function initRender(pinch) {
  pinch.scale = 1;
  pinch.lastScale = 1;
  pinch.origin = { x: 0, y: 0 };
}

function render$1(pinch) {
  var options = pinch.options;

  options.el = typeof options.el === 'string' ? document.querySelector(options.el) : options.el;
  pinch.canvas = pinch.createCanvas();
  pinch.context = pinch.canvas.getContext('2d');

  getCanvasRect(function (rect) {
    pinch.rect = rect;
    pinch.canvasScale = options.width / pinch.rect.width;
    pinch.load(options.target, function () {
      options.el.appendChild(pinch.canvas);
    });
  });

  function getCanvasRect(callback) {
    var canvas = pinch.createCanvas();
    options.el.appendChild(canvas);
    setTimeout(function () {
      var rect = canvas.getBoundingClientRect();
      options.el.removeChild(canvas);
      canvas = null;
      callback(rect);
    }, 10);
  }
}

function addRender(Pinch) {
  var proto = Pinch.prototype;

  proto.createCanvas = function () {
    var pinch = this;
    var canvas = document.createElement('canvas');

    canvas.width = pinch.options.width;
    canvas.height = pinch.options.height;
    canvas.style.cssText = 'width:100%;height:100%;';

    return canvas;
  };

  proto.load = function (target, callback) {
    var pinch = this;

    imageToCanvas(target, success, { maxWidth: pinch.options.maxTargetWidth, maxHeight: pinch.options.maxTargetHeight });

    function success(canvas) {
      var _pinch$options = pinch.options,
          width = _pinch$options.width,
          height = _pinch$options.height,
          offset = _pinch$options.offset,
          loaded = _pinch$options.loaded;

      var scale = pinch.canvasScale;
      var pinchWidth = width - (offset.left + offset.right) * scale;
      var pinchHeight = height - (offset.top + offset.bottom) * scale;
      pinch.position = imgCover(canvas.width, canvas.height, pinchWidth, pinchHeight);
      pinch.position.x += offset.left * scale;
      pinch.position.y += offset.top * scale;
      pinch.imageCanvas = canvas;
      pinch.draw();
      callback && callback();
      loaded.call(pinch);
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
        y = _pinch$position.y,
        width = _pinch$position.width,
        height = _pinch$position.height;


    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, options.width, options.height);
    context.restore();
    context.drawImage(pinch.imageCanvas, x, y, width, height);
  };

  proto.moveTo = function (_x, _y) {
    var pinch = this;
    var x = _x - (pinch.position.x - pinch.origin.x);
    var y = _y - (pinch.position.y - pinch.origin.y);

    pinch.context.translate(x, y);
    pinch.origin.x -= x;
    pinch.origin.y -= y;
    pinch.draw();
  };

  /**
   * 图片缩放函数，以point点为中心（以左上角为原点（不是以裁剪框为原点））进行缩放.
   * @param {object} point - 坐标点.
   * @property {number} point.x - x坐标.
   * @property {number} point.y - y坐标.
   * @param {number} zoom - 缩放比例.
   */

  proto.scaleTo = function (point, zoom) {
    var pinch = this;
    var context = pinch.context;
    var speed = pinch.canvasScale;
    var scale = pinch.scale;
    var origin = pinch.origin;

    if (zoom > 1 && !pinch.vaildMaxScale() || zoom < 1 && !pinch.vaildMinScale()) {
      return false;
    }

    if (!pinch.vaildMaxScale(scale * zoom)) {
      zoom = pinch.options.maxScale / scale;
    } else if (!pinch.vaildMinScale(scale * zoom)) {
      zoom = pinch.options.minScale / scale;
    }

    context.translate(origin.x, origin.y);
    pinch.origin.x -= point.x * speed / (scale * zoom) - point.x * speed / scale;
    pinch.origin.y -= point.y * speed / (scale * zoom) - point.y * speed / scale;
    context.scale(zoom, zoom);
    context.translate(-pinch.origin.x, -pinch.origin.y);
    pinch.scale *= zoom;

    pinch.draw();
  };
}

/**
 * 缓动函数
 */
var Easing = {
  linear: function linear(t, b, c, d) {
    return c * t / d + b;
  },
  easeInQuad: function easeInQuad(t, b, c, d) {
    return c * (t /= d) * t + b;
  },
  easeOutQuad: function easeOutQuad(t, b, c, d) {
    return -c * (t /= d) * (t - 2) + b;
  },

  easeOutStrong: function easeOutStrong(t, b, c, d) {
    return -c * ((t = t / d - 1) * t * t * t - 1) + b;
  },
  easeInOutQuad: function easeInOutQuad(t, b, c, d) {
    if ((t /= d / 2) < 1) {
      return c / 2 * t * t + b;
    } else {
      return -c / 2 * (--t * (t - 2) - 1) + b;
    }
  },
  easeInCubic: function easeInCubic(t, b, c, d) {
    return c * (t /= d) * t * t + b;
  },
  easeOutCubic: function easeOutCubic(t, b, c, d) {
    return c * ((t = t / d - 1) * t * t + 1) + b;
  },
  easeInOutCubic: function easeInOutCubic(t, b, c, d) {
    if ((t /= d / 2) < 1) {
      return c / 2 * t * t * t + b;
    } else {
      return c / 2 * ((t -= 2) * t * t + 2) + b;
    }
  },
  easeInQuart: function easeInQuart(t, b, c, d) {
    return c * (t /= d) * t * t * t + b;
  },
  easeOutQuart: function easeOutQuart(t, b, c, d) {
    return -c * ((t = t / d - 1) * t * t * t - 1) + b;
  },
  easeInOutQuart: function easeInOutQuart(t, b, c, d) {
    if ((t /= d / 2) < 1) {
      return c / 2 * t * t * t * t + b;
    } else {
      return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
    }
  },
  easeInQuint: function easeInQuint(t, b, c, d) {
    return c * (t /= d) * t * t * t * t + b;
  },
  easeOutQuint: function easeOutQuint(t, b, c, d) {
    return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
  },
  easeInOutQuint: function easeInOutQuint(t, b, c, d) {
    if ((t /= d / 2) < 1) {
      return c / 2 * t * t * t * t * t + b;
    } else {
      return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
    }
  },
  easeInSine: function easeInSine(t, b, c, d) {
    return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
  },
  easeOutSine: function easeOutSine(t, b, c, d) {
    return c * Math.sin(t / d * (Math.PI / 2)) + b;
  },
  easeInOutSine: function easeInOutSine(t, b, c, d) {
    return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
  },
  easeInExpo: function easeInExpo(t, b, c, d) {
    var _ref;
    return (_ref = t === 0) !== null ? _ref : {
      b: c * Math.pow(2, 10 * (t / d - 1)) + b
    };
  },
  easeOutExpo: function easeOutExpo(t, b, c, d) {
    var _ref;
    return (_ref = t === d) !== null ? _ref : b + {
      c: c * (-Math.pow(2, -10 * t / d) + 1) + b
    };
  },
  easeInOutExpo: function easeInOutExpo(t, b, c, d) {
    if (t === 0) {}
    if (t === d) {
      // b + c
    }
    if ((t /= d / 2) < 1) {
      return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
    } else {
      return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
    }
  },
  easeInCirc: function easeInCirc(t, b, c, d) {
    return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
  },
  easeOutCirc: function easeOutCirc(t, b, c, d) {
    return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
  },
  easeInOutCirc: function easeInOutCirc(t, b, c, d) {
    if ((t /= d / 2) < 1) {
      return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
    } else {
      return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
    }
  },
  easeInElastic: function easeInElastic(t, b, c, d) {
    var a, p, s;
    s = 1.70158;
    p = 0;
    a = c;
    if (t === 0) {
      // b
    } else if ((t /= d) === 1) {
      // b + c
    }
    if (!p) {
      p = d * 0.3;
    }
    if (a < Math.abs(c)) {
      a = c;
      s = p / 4;
    } else {
      s = p / (2 * Math.PI) * Math.asin(c / a);
    }
    return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
  },
  easeOutElastic: function easeOutElastic(t, b, c, d) {
    var a, p, s;
    s = 1.70158;
    p = 0;
    a = c;
    if (t === 0) {
      // b
    } else if ((t /= d) === 1) {
      // b + c
    }
    if (!p) {
      p = d * 0.3;
    }
    if (a < Math.abs(c)) {
      a = c;
      s = p / 4;
    } else {
      s = p / (2 * Math.PI) * Math.asin(c / a);
    }
    return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
  },
  easeInOutElastic: function easeInOutElastic(t, b, c, d) {
    var a, p, s;
    s = 1.70158;
    p = 0;
    a = c;
    if (t === 0) {
      // b
    } else if ((t /= d / 2) === 2) {
      // b + c
    }
    if (!p) {
      p = d * (0.3 * 1.5);
    }
    if (a < Math.abs(c)) {
      a = c;
      s = p / 4;
    } else {
      s = p / (2 * Math.PI) * Math.asin(c / a);
    }
    if (t < 1) {
      return -0.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
    } else {
      return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * 0.5 + c + b;
    }
  },
  easeInBack: function easeInBack(t, b, c, d, s) {
    if (s === void 0) {
      s = 1.70158;
    }
    return c * (t /= d) * t * ((s + 1) * t - s) + b;
  },
  easeOutBack: function easeOutBack(t, b, c, d, s) {
    if (s === void 0) {
      s = 1.70158;
    }
    return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
  },
  easeInOutBack: function easeInOutBack(t, b, c, d, s) {
    if (s === void 0) {
      s = 1.70158;
    }
    if ((t /= d / 2) < 1) {
      return c / 2 * (t * t * (((s *= 1.525) + 1) * t - s)) + b;
    } else {
      return c / 2 * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2) + b;
    }
  },
  easeInBounce: function easeInBounce(t, b, c, d) {
    var v;
    v = Easing.easeOutBounce(d - t, 0, c, d);
    return c - v + b;
  },
  easeOutBounce: function easeOutBounce(t, b, c, d) {
    if ((t /= d) < 1 / 2.75) {
      return c * (7.5625 * t * t) + b;
    } else if (t < 2 / 2.75) {
      return c * (7.5625 * (t -= 1.5 / 2.75) * t + 0.75) + b;
    } else if (t < 2.5 / 2.75) {
      return c * (7.5625 * (t -= 2.25 / 2.75) * t + 0.9375) + b;
    } else {
      return c * (7.5625 * (t -= 2.625 / 2.75) * t + 0.984375) + b;
    }
  },
  easeInOutBounce: function easeInOutBounce(t, b, c, d) {
    var v;
    if (t < d / 2) {
      v = Easing.easeInBounce(t * 2, 0, c, d);
      return v * 0.5 + b;
    } else {
      v = Easing.easeOutBounce(t * 2 - d, 0, c, d);
      return v * 0.5 + c * 0.5 + b;
    }
  }
};

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
 * @property {Array} options.targets - 二维数组，存放起始值与目标值，例：[[0, 100], [100, 0]]，表示起始值0到目标值100的过程中的变化，变化的数值会作为options.running函数的参数返回
 * @property {Function} options.running - options.targets数值变化过程会执行这个函数
 * @property {Function} options.end - 结束后的回调函数
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
};

function addValidation(Pinch) {
  var proto = Pinch.prototype;

  proto.validation = function () {
    var pinch = this;
    var options = pinch.options;
    var position = pinch.position;
    var scale = pinch.scale;
    var offsetX = (position.x - pinch.origin.x) * scale;
    var offsetY = (position.y - pinch.origin.y) * scale;
    var _options$offset = options.offset,
        left = _options$offset.left,
        right = _options$offset.right,
        top = _options$offset.top,
        bottom = _options$offset.bottom;

    var canvasScale = pinch.canvasScale;

    var cropLeft = left * canvasScale;
    var cropTop = top * canvasScale;

    var w = options.width - (left + right) * canvasScale - (position.width * scale - (cropLeft - offsetX));
    var h = options.height - (top + bottom) * canvasScale - (position.height * scale - (cropTop - offsetY));

    var x = 0;
    var y = 0;
    var isDraw = false;

    if (offsetX >= cropLeft) {
      x = -(offsetX - cropLeft) / scale;
      pinch.origin.x -= x;
      isDraw = true;
    } else if (w > 0) {
      x = w / scale;
      pinch.origin.x -= x;
      isDraw = true;
    }

    if (offsetY >= cropTop) {
      y = -(offsetY - cropTop) / scale;
      pinch.origin.y -= y;
      isDraw = true;
    } else if (h > 0) {
      y = h / scale;
      pinch.origin.y -= y;
      isDraw = true;
    }

    function initLastAnimate() {
      pinch.lastAnimate = { x: 0, y: 0 };
    }

    if (isDraw) {
      initLastAnimate();
      animate({
        targets: [[0, x], [0, y]],
        time: 150,
        running: pinch._animate.bind(pinch),
        end: function end() {
          pinch.isLock = false;
          initLastAnimate();
        }
      });
    }
  };

  proto.vaildMaxScale = function (scale) {
    return (scale || this.scale) < this.options.maxScale;
  };

  proto.vaildMinScale = function (scale) {
    return (scale || this.scale) > this.options.minScale;
  };

  proto._animate = function (target) {
    var pinch = this;
    var last = pinch.lastAnimate;

    pinch.isLock = true;
    pinch.context.translate(target[0] - last.x, target[1] - last.y);
    pinch.draw();
    pinch.lastAnimate = { x: target[0], y: target[1] };
  };
}

function sum(a, b) {
  return a + b;
}

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

function getDistance(p1, p2, props) {
  props = props || ['x', 'y'];

  var x = p2[props[0]] - p1[props[0]];
  var y = p2[props[1]] - p1[props[1]];
  return Math.sqrt(x * x + y * y);
}

function getScale(start, end) {
  return getDistance(end[0], end[1]) / getDistance(start[0], start[1]);
}

var addGlobal = function (Pinch) {
  Pinch.getTouchCenter = getTouchCenter;
  Pinch.getDistance = getDistance;
  Pinch.getScale = getScale;
  Pinch.Observer = Observer;
};

function getDefaultOptions$1() {
  return {
    target: null,
    maxTargetWidth: 2000,
    maxTargetHeight: 2000,
    el: null,
    width: 800,
    height: 800,
    maxScale: 2,
    minScale: 1,
    touchTarget: null,
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
}

Pinch.prototype.init = function (options) {
  var pinch = this;

  pinch.options = extend(getDefaultOptions$1(), options);

  function initState(pinch) {
    initEvent(pinch);
    initRender(pinch);
  }

  initState(pinch);
  render$1(pinch);
  bindEvent(pinch);
};

addGlobal(Pinch);
addEvent(Pinch);
addRender(Pinch);
addValidation(Pinch);

/**
 * 获取裁剪默认选项
 */
function getDefaultOptions() {
  return {
    // 目标对象，可以是File/Canvas/Image src
    target: null,
    // 允许图片的最大width
    maxTargetWidth: 2000,
    // 允许图片的最大height
    maxTargetHeight: 2000,
    // 插入到el节点
    el: null,
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
    // 允许缩放的最小比例
    minScale: 1,
    // canavs画布比例
    canvasScale: 2,
    // 绑定事件的节点
    touchTarget: null,
    // 生命周期函数
    created: noop, // 创建完成
    mounted: noop, // 已插入到html节点
    loaded: noop, // 裁剪图片加载完成
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
    this.render();
    Crop.count++;
  },
  /**
   * 创建dom节点
   */
  create: function create() {
    var crop = this;
    var options = crop.options;

    var el = options.el;

    options.el = el ? typeof el === 'string' ? document.querySelector(el) : el : document.body;

    var styles = [];
    var width = options.width;
    var height = options.height;
    var docEl = document.documentElement;

    // 裁剪最外层div
    var wrapProps = {
      className: 'crop-wrap',
      width: el ? el.offsetWidth ? el.offsetWidth : docEl.clientWidth : docEl.clientWidth,
      height: el ? el.offsetHeight ? el.offsetHeight : docEl.clientHeight : docEl.clientHeight,
      style: function style() {
        return '\n          .' + this.className + ' {\n            position: fixed;\n            left: 0;\n            top: 0;\n            overflow: hidden;\n            width: ' + this.width + 'px;\n            height: ' + this.height + 'px;\n            background: #000;\n            z-index: 99;\n          }\n        ';
      }
      // 遮罩层
    };var maskProps = {
      className: 'crop-mask',
      left: typeof options.x === 'number' ? options.x - wrapProps.width : -(width + wrapProps.width) / 2,
      top: typeof options.y === 'number' ? options.y - wrapProps.height : -(height + wrapProps.height) / 2,
      style: function style() {
        return '\n          .' + this.className + ' {\n            position: absolute; \n            left: ' + this.left + 'px;\n            top: ' + this.top + 'px;\n            width: ' + width + 'px; \n            height: ' + height + 'px; \n            overflow: hidden;\n            border: 1px solid rgba(0, 0, 0, .6);\n            border-width: ' + wrapProps.height + 'px ' + wrapProps.width + 'px;\n            box-sizing: content-box;\n          }\n          .' + this.className + ':after {\n            position: absolute;\n            left: 0;\n            top: 0;\n            float: left;\n            content: \'\';\n            width: 200%;\n            height: 200%;\n            border: 1px solid #fff;\n            -webkit-box-sizing: border-box;\n            box-sizing: border-box;\n            -webkit-transform: scale(0.5);\n            transform: scale(0.5);\n            -webkit-transform-origin: 0 0;\n            transform-origin: 0 0;\n          }\n        ';
      }
      // 底部按钮外层div
    };var handleProps = {
      className: 'crop-handle',
      style: function style() {
        return '\n          .' + this.className + ' {\n            position: absolute;\n            bottom: 0;\n            left: 0;\n            width: 100%;\n            height: 50px;\n            line-height: 50px;\n            background-color: rgba(0,0,0,.3);\n          }\n          .' + this.className + ' > div {\n            height: 100px;\n            width: 80px;\n            color: #fff;\n            font-size: 16px;\n            text-align: center;\n          }\n        ';
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

    if (Crop.count === 0) {
      renderStyle(crop.styles);
    }
    options.el.appendChild(crop.root.el);

    initPinch(crop);

    setTimeout(options.mounted.call(crop), 0);
  },
  get: function get() {
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { width: undefined, height: undefined, type: 'image/jpeg', quality: 0.85 };

    var crop = this;
    var pinch = crop.pinch;
    var width = config.width,
        height = config.height,
        type = config.type,
        quality = config.quality;

    var scale = pinch.options.width / pinch.rect.width;
    var clipWidth = crop.area.width * scale;
    var clipHeight = crop.area.height * scale;
    var defaultCanvas = getDefaultCanvas();

    function getDefaultCanvas() {
      var canvas = document.createElement('canvas');
      var x = pinch.options.offset.left * scale;
      var y = pinch.options.offset.top * scale;
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
      result = {
        canvas: newCanvas,
        src: newCanvas.toDataURL(type, quality)
      };
    } else {
      result = {
        canvas: defaultCanvas,
        src: defaultCanvas.toDataURL(type, quality)
      };
    }

    result.blob = dataURItoBlob(result.src);
    result.url = URL.createObjectURL(result.blob);

    return result;
  },
  load: function load(target) {
    var crop = this;

    crop.show();
    crop.pinch && crop.pinch.remove();
    crop.options.target = target;
    initPinch(crop);
  },
  show: function show() {
    this.root.el.style.display = 'block';
  },
  hide: function hide() {
    this.root.el.style.display = 'none';
  },
  destroy: function destroy() {
    var crop = this;

    crop.pinch.remove();
    removeElement(crop.root, crop.options.el);
  },
  moveTo: function moveTo(x, y) {
    this.pinch.moveTo(x, y);
  },
  scaleTo: function scaleTo(point, zoom) {
    this.pinch.scaleTo(point, zoom);
  }
};

Crop.count = 0;
Crop.loadImage = imageToCanvas;
Crop.Pinch = Pinch;

function initPinch(crop) {
  function init() {
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
        left: x,
        right: width - crop.area.width - x,
        top: y,
        bottom: height - crop.area.height - y
      }
    };
    crop.pinch = new Pinch(touchTarget, pinchOptions);
  }
  setTimeout(init, 0);
}

return Crop;

})));

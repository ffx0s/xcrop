(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.Crop = factory());
}(this, (function () { 'use strict';

function noop() {}



function bind(fn, ctx) {
  function boundFn(a) {
    var l = arguments.length;
    return l ? l > 1 ? fn.apply(ctx, arguments) : fn.call(ctx, a) : fn.call(ctx);
  }
  boundFn._length = fn.length;
  return boundFn;
}

function extend(to, _from) {
  for (var key in _from) {
    to[key] = _from[key];
  }
  return to;
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





















var get$1 = function get$1(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get$1(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

















var set = function set(object, property, value, receiver) {
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent !== null) {
      set(parent, property, value, receiver);
    }
  } else if ("value" in desc && desc.writable) {
    desc.value = value;
  } else {
    var setter = desc.set;

    if (setter !== undefined) {
      setter.call(receiver, value);
    }
  }

  return value;
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

function Element(tagName, attr) {
  var children = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

  for (var name in attr) {
    this[name] = attr[name];
  }
  this.tagName = tagName;
  this.children = children;
}

Element.prototype = {
  create: function create() {
    this.el = document.createElement(this.tagName);
    this.el.className = this.className;
    this.addEvent();
    return this.el;
  }
};['addEvent', 'removeEvent'].forEach(function (value) {
  Element.prototype[value] = function () {
    for (var eventName in this.events) {
      this.el[value + 'Listener'](eventName, this.events[eventName], false);
    }
  };
});

function createElement(element) {
  var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : noop;

  if (typeof element === 'string') {
    var _node = document.createTextNode(element);
    callback(element);
    return _node;
  }

  var node = element.create();

  element.children.forEach(function (child) {
    var childNode = createElement(child, callback);
    node.appendChild(childNode);
  });

  callback(element);

  return node;
}

function removeElement(element, targetElem) {
  var value = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

  if (typeof element === 'string') return;
  element.children.forEach(function (child) {
    removeElement(child, targetElem, false);
  });
  element.removeEvent();
  if (value) {
    targetElem.removeChild(element.el);
  }
}

function renderStyle(css) {
  var elem = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document.getElementsByTagName('head')[0];

  var styleElem = document.createElement('style');
  try {
    styleElem.appendChild(document.createTextNode(css));
  } catch (err) {
    styleElem.stylesheet.cssText = css;
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
      this.observer[value](name, fn && bind(fn, this));
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

var Tween = {
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
  easeOut: function easeOut(t, b, c, d) {
    // 减速曲线
    return -c * (t /= d) * (t - 2) + b;
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
};

var requestAnimationFrame = function () {
  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
    return window.setTimeout(callback, 1000 / 60);
  };
}();

var cancelAnimationFrame = function () {
  return window.cancelAnimationFrame || window.mozCancelAnimationFrame || function (id) {
    clearTimeout(id);
  };
}();

var now = function now() {
  return new Date().getTime();
};

var animate = function (options) {
  var _options$times = options.times,
      times = _options$times === undefined ? 500 : _options$times,
      _options$type = options.type,
      type = _options$type === undefined ? 'easeOut' : _options$type,
      targets = options.targets,
      animate = options.animate,
      end = options.end;

  var startTime = now();

  function step() {
    var changeTime = now();
    var scale = 1 - Math.max(0, startTime - changeTime + times) / times;
    var value = [];

    targets.forEach(function (target) {
      value.push(Tween[type](scale * times, target[0], target[1] - target[0], times));
    });

    animate(value);

    if (scale === 1) {
      cancelAnimationFrame(animate.timer);
      end && end();
    } else {
      requestAnimationFrame(step);
    }
  }

  cancelAnimationFrame(animate.timer);
  animate.timer = requestAnimationFrame(step);
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
        times: 150,
        animate: bind(pinch._animate, pinch),
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

function getDefaultOptions() {
  return {
    target: null,
    maxTargetWidth: 2000,
    maxTargetHeight: 2000,
    el: null,
    width: 300,
    height: 300,
    x: undefined,
    y: undefined,
    maxScale: 2,
    minScale: 1,
    canvasScale: 2,
    touchTarget: null,
    created: noop,
    mounted: noop,
    loaded: noop,
    cancle: noop,
    confirm: noop
  };
}

function Crop(options) {
  this.init(options);
}

Crop.prototype = {
  init: function init(options) {
    var crop = this;
    crop.options = extend(getDefaultOptions(), options);
    crop.create();
    crop.render();
    Crop.count++;
  },
  create: function create() {
    var crop = this;
    var options = crop.options;

    var el = options.el;

    options.el = el ? typeof el === 'string' ? document.querySelector(el) : el : document.body;

    var styles = [];
    var width = options.width;
    var height = options.height;
    var docEl = document.documentElement;

    var wrapProps = {
      className: setClassName('wrap'),
      width: el ? el.offsetWidth ? el.offsetWidth : docEl.clientWidth : docEl.clientWidth,
      height: el ? el.offsetHeight ? el.offsetHeight : docEl.clientHeight : docEl.clientHeight,
      style: function style() {
        return '\n          .' + this.className + ' {\n            position: fixed;\n            left: 0;\n            top: 0;\n            overflow: hidden;\n            width: ' + this.width + 'px;\n            height: ' + this.height + 'px;\n            background: #000;\n            z-index: 99;\n          }\n        ';
      }
    };
    var maskProps = {
      className: setClassName('mask'),
      left: typeof options.x === 'number' ? options.x - wrapProps.width : -(width + wrapProps.width) / 2,
      top: typeof options.y === 'number' ? options.y - wrapProps.height : -(height + wrapProps.height) / 2,
      style: function style() {
        return '\n          .' + this.className + ' {\n            position: absolute; \n            left: ' + this.left + 'px;\n            top: ' + this.top + 'px;\n            width: ' + width + 'px; \n            height: ' + height + 'px; \n            overflow: hidden;\n            border: 1px solid rgba(0, 0, 0, .6);\n            border-width: ' + wrapProps.height + 'px ' + wrapProps.width + 'px;\n            box-sizing: content-box;\n          }\n          .' + this.className + ':after {\n            position: absolute;\n            left: 0;\n            top: 0;\n            float: left;\n            content: \'\';\n            width: 200%;\n            height: 200%;\n            border: 1px solid #fff;\n            -webkit-box-sizing: border-box;\n            box-sizing: border-box;\n            -webkit-transform: scale(0.5);\n            transform: scale(0.5);\n            -webkit-transform-origin: 0 0;\n            transform-origin: 0 0;\n          }\n        ';
      }
    };

    var handleProps = {
      className: setClassName('handle'),
      style: function style() {
        return '\n          .' + this.className + ' {\n            position: absolute;\n            bottom: 0;\n            left: 0;\n            width: 100%;\n            height: 50px;\n            line-height: 50px;\n            background-color: rgba(0,0,0,.3);\n          }\n          .' + this.className + ' > div {\n            height: 100px;\n            width: 80px;\n            color: #fff;\n            font-size: 16px;\n            text-align: center;\n          }\n        ';
      }
    };
    var cancleProps = {
      className: setClassName('cancle'),
      style: function style() {
        return '\n          .' + this.className + ' {\n            float: left;\n          }\n        ';
      },
      events: {
        touchstart: bind(options.cancle, crop)
      }
    };
    var confirmProps = {
      className: setClassName('confirm'),
      style: function style() {
        return '\n          .' + this.className + ' {\n            float: right;\n          }\n        ';
      },
      events: {
        touchstart: bind(options.confirm, crop)
      }
    };

    crop.root = new Element('div', wrapProps, [new Element('div', maskProps), new Element('div', handleProps, [new Element('div', cancleProps, ['取消']), new Element('div', confirmProps, ['确认'])])]);

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

function setClassName(name) {
  return 'crop-' + name;
}

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

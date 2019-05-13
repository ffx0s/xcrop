import {
  extendDeep, browser, noop,
  objectAssign
} from './shared'

import {
  dataURItoBlob, objectURLToBlob,
  httpURLToArrayBuffer, isObjectURL,
  URL, fileToArrayBuffer
} from './file'

export const isBase64Image = src => src.indexOf(';base64,') > 0

/**
 * 获取图片方向
 * @param {Object} binFile ArrayBuffer
 */
export function getOrientation (binFile) {
  const view = new DataView(binFile)

  if (view.getUint16(0, false) !== 0xFFD8) return -2

  const length = view.byteLength
  let offset = 2

  while (offset < length) {
    const marker = view.getUint16(offset, false)
    offset += 2

    if (marker === 0xFFE1) {
      if (view.getUint32(offset += 2, false) !== 0x45786966) {
        return -1
      }
      const little = view.getUint16(offset += 6, false) === 0x4949
      offset += view.getUint32(offset + 4, little)
      const tags = view.getUint16(offset, little)
      offset += 2

      for (let i = 0; i < tags; i++) {
        if (view.getUint16(offset + (i * 12), little) === 0x0112) {
          return view.getUint16(offset + (i * 12) + 8, little)
        }
      }
    } else if ((marker & 0xFF00) !== 0xFF00) break
    else offset += view.getUint16(offset, false)
  }
  return -1
}

/**
 * https://github.com/stomita/ios-imagefile-megapixel
 * Rendering image element (with resizing) into the canvas element
*/
export function renderImageToCanvas (img, canvas, options, doSquash) {
  let iw = img.naturalWidth
  let ih = img.naturalHeight
  if (!(iw + ih)) return
  const width = options.width
  const height = options.height
  const ctx = canvas.getContext('2d')

  ctx.save()
  const subsampled = detectSubsampling(img)
  if (subsampled) {
    iw /= 2
    ih /= 2
  }
  // size of tiling canvas
  const d = 1024
  let tmpCanvas = document.createElement('canvas')
  tmpCanvas.width = tmpCanvas.height = d
  let tmpCtx = tmpCanvas.getContext('2d')
  let vertSquashRatio = doSquash ? detectVerticalSquash(img, iw, ih) : 1
  const dw = Math.ceil(d * width / iw)
  const dh = Math.ceil(d * height / ih / vertSquashRatio)
  let sy = 0
  let dy = 0

  while (sy < ih) {
    let sx = 0
    let dx = 0
    while (sx < iw) {
      tmpCtx.clearRect(0, 0, d, d)
      tmpCtx.drawImage(img, -sx, -sy)
      ctx.drawImage(tmpCanvas, 0, 0, d, d, dx, dy, dw, dh)
      sx += d
      dx += dw
    }
    sy += d
    dy += dh
  }

  ctx.restore()
  tmpCanvas = tmpCtx = null
}

/**
 * https://github.com/stomita/ios-imagefile-megapixel
 * Detect subsampling in loaded image.
 * In iOS, larger images than 2M pixels may be subsampled in rendering.
 */
function detectSubsampling (img) {
  const iw = img.naturalWidth
  const ih = img.naturalHeight

  if (iw * ih > 1024 * 1024) { // subsampling may happen over megapixel image
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 1
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, -iw + 1, 0)
    // subsampled image becomes half smaller in rendering size.
    // check alpha channel value to confirm image is covering edge pixel or not.
    // if alpha value is 0 image is not covering, hence subsampled.
    return ctx.getImageData(0, 0, 1, 1).data[3] === 0
  } else {
    return false
  }
}

/**
 * https://github.com/stomita/ios-imagefile-megapixel
 * Detecting vertical squash in loaded image.
 * Fixes a bug which squash image vertically while drawing into canvas for some images.
 */
function detectVerticalSquash (img, iw, ih) {
  const canvas = document.createElement('canvas')

  canvas.width = 1
  canvas.height = ih

  const ctx = canvas.getContext('2d')

  ctx.drawImage(img, 0, 0)

  const data = ctx.getImageData(0, 0, 1, ih).data
  // search image edge pixel position in case it is squashed vertically.
  let sy = 0
  let ey = ih
  let py = ih

  while (py > sy) {
    const alpha = data[(py - 1) * 4 + 3]
    if (alpha === 0) {
      ey = py
    } else {
      sy = py
    }
    py = (ey + sy) >> 1
  }

  const ratio = (py / ih)

  return (ratio === 0) ? 1 : ratio
}

/**
 * 根据 orientation 改变 canvas 方向
 * @param {Element} canvas 画布
 * @param {Object} ctx 画布上下文
 * @param {Number} width 画布宽度
 * @param {Number} height 画布高度
 * @param {Number} orientation 方向
 */
export function transformCoordinate (canvas, ctx, width, height, orientation) {
  // set proper canvas dimensions before transform & export
  if ([5, 6, 7, 8].indexOf(orientation) > -1) {
    canvas.width = height
    canvas.height = width
  } else {
    canvas.width = width
    canvas.height = height
  }

  // transform context before drawing image
  switch (orientation) {
    case 2: ctx.transform(-1, 0, 0, 1, width, 0); break
    case 3: ctx.transform(-1, 0, 0, -1, width, height); break
    case 4: ctx.transform(1, 0, 0, -1, 0, height); break
    case 5: ctx.transform(0, 1, 1, 0, 0, 0); break
    case 6: ctx.transform(0, 1, -1, 0, height, 0); break
    case 7: ctx.transform(0, -1, -1, 0, height, width); break
    case 8: ctx.transform(0, -1, 1, 0, 0, width); break
    default: ctx.transform(1, 0, 0, 1, 0, 0)
  }
}

/**
 * 图片铺满容器
 * @param {Number} imgW 图片宽度
 * @param {Number} imgH 图片高度
 * @param {Number} divW 容器宽度
 * @param {Number} divH 容器高度
 */
export function imgCover (imgW, imgH, divW, divH) {
  const imgScale = imgW / imgH
  let width = divW
  let height = width / imgScale
  let x = 0
  let y = -(height - divH) / 2

  if (height < divH) {
    height = divH
    width = imgScale * height
    x = -(width - divW) / 2
    y = 0
  }

  const scale = +(width / imgW).toFixed(4)

  return {
    width,
    height,
    x,
    y,
    scale
  }
}

/**
 * 加载图片
 * @param {String} src 路径
 * @param {Function} callback onload 函数
 */
export function loadImage (src, callback, errorCallback) {
  const image = new win.Image()

  if (!isBase64Image(src)) {
    image.crossOrigin = '*'
  }

  image.onload = () => { callback(image) }
  image.onerror = errorCallback || function (error) { console.error('loadImage error: ', error) }
  image.src = src

  return image
}

// 为每种类型设置统一输出的函数
const actions = {
  url: {
    getArrayBuffer: httpURLToArrayBuffer,
    toImage: loadImage
  },
  file: {
    getArrayBuffer: fileToArrayBuffer,
    toImage (file, callback, errorCallback) {
      loadImage(URL.createObjectURL(file), callback, errorCallback)
    }
  },
  objectURL: {
    getArrayBuffer (objectURL, callback, errorCallback) {
      objectURLToBlob(objectURL, file => {
        fileToArrayBuffer(file, callback, errorCallback)
      })
    },
    toImage: loadImage
  },
  base64: {
    getArrayBuffer (base64, callback, errorCallback) {
      fileToArrayBuffer(dataURItoBlob(base64), callback, errorCallback)
    },
    toImage: loadImage
  },
  imageEl: {
    getArrayBuffer (imageEl, callback, errorCallback) {
      httpURLToArrayBuffer(imageEl.src, callback, errorCallback)
    },
    toImage (imageEl, callback) {
      callback(imageEl)
    }
  }
}

/**
 * IOS端 canvas 有大小限制，超过了会报错
 * IOS8：2000x2000
 * IOS9：4096x4096
 */
const maximum = (() => {
  if (browser.ios) {
    return {
      8: 4000000,
      9: 16777216
    }
  }
  return null
})()

/**
 * 将图片转成canvas
 * @param {(string|file|element)} target 目标
 * @param {Function} callback 转换成功回调函数
 * @param {Object} opt 可选项
 */
export function imageToCanvas (target, callback, opts) {
  const options = extendDeep({
    orientation: true,
    errorCallback: noop
  }, opts)
  let type = ''

  // file
  if (win.FileReader && (target instanceof win.Blob || target instanceof win.File)) {
    type = 'file'
  } else if (isObjectURL(target)) {
    // objectURL
    type = 'objectURL'
  } else if (target && target.tagName && target.nodeType) {
    // image
    if (target.tagName === 'IMG') {
      type = 'imageEl'
    }
    // canvas
    if (target.tagName === 'CANVAS') {
      callback(target)
      return
    }
  } else {
    // http/https url
    type = 'url'
  }

  // 将目标转成 image 对象
  actions[type].toImage(target, image => {
    // 如果需要修正图片方向，则获取当前图片方向
    if (options.orientation) {
      // 获取 arrayBuffer 用于读取 exif 信息，最终得到图片方向
      actions[type].getArrayBuffer(target, arrayBuffer => {
        const orientation = getOrientation(arrayBuffer)

        check(target, image, orientation)
      }, options.errorCallback)
    } else {
      check(target, image)
    }
  }, options.errorCallback)

  function check (target, image, orientation) {
    const canvas = document.createElement('canvas')
    const imageWidth = image.width
    const imageHeight = image.height
    const ctx = canvas.getContext('2d')

    // 是否需要修正图片方向
    function shouldTransformCoordinate (width, height) {
      if (options.orientation) {
        transformCoordinate(canvas, ctx, width, height, orientation)
      } else {
        canvas.width = width
        canvas.height = height
      }
    }

    // 判断canvas绘制是否有最大限制，如果是并且图片大于指定宽高则分片绘制防止绘制失败
    if (
      maximum &&
      maximum[browser.ios.version] &&
      imageWidth * imageHeight > maximum[browser.ios.version]
    ) {
      const max = Math.sqrt(maximum[browser.ios.version])
      const size = resetSize(image, objectAssign({}, options, {
        maxWidth: max,
        maxHeight: max
      }))

      shouldTransformCoordinate(size.width, size.height)
      renderImageToCanvas(image, canvas, size, true)
    } else {
      shouldTransformCoordinate(imageWidth, imageHeight)
      ctx.drawImage(image, 0, 0)
    }

    callback(canvas)
  }
}

/**
 * 重置宽高比例，判断图片是否大于最大宽度/高度
 * @param {Element} image 图片对象
 * @param {Object} options 选项
 */
function resetSize (image, options) {
  let { maxWidth, maxHeight, width, height } = options
  const imageWidth = image.naturalWidth
  const imageHeight = image.naturalHeight

  if (width && !height) {
    height = (imageHeight * width / imageWidth) << 0
  } else if (height && !width) {
    width = (imageWidth * height / imageHeight) << 0
  } else {
    width = imageWidth
    height = imageHeight
  }

  if (maxWidth && imageWidth > maxWidth) {
    width = maxWidth
    height = (imageHeight * width / imageWidth) << 0
  }
  if (maxHeight && height > maxHeight) {
    height = maxHeight
    width = (imageWidth * height / imageHeight) << 0
  }

  return { width, height }
}


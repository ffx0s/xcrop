import { dataURItoBlob, objectURLToBlob, httpURLToArrayBuffer, isObjectURL } from './file'

export const isBase64Image = src => src.indexOf(';base64,') > 0

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

export function resetOrientation (srcBase64, srcOrientation, callback, errorCallback) {
  const img = new window.Image()
  if (!isBase64Image(srcBase64)) {
    img.crossOrigin = '*'
  }
  img.onload = function () {
    const width = img.width
    const height = img.height
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const isMobile = !!navigator.userAgent.match(/AppleWebKit.*Mobile.*/)

    if (isMobile && width * height > 16777216) {
      const message = 'Canvas area exceeds the maximum limit (width * height > 16777216)'
      console.warn(message)
      errorCallback ? errorCallback({ code: 1, message }) : window.alert(message)
      return
    }

    transformCoordinate(canvas, ctx, width, height, srcOrientation)

    // draw image
    ctx.drawImage(img, 0, 0)

    // export canvas
    callback(canvas)
  }

  img.src = srcBase64
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
  transformCoordinate(canvas, ctx, width, height, options.orientation)
  const subsampled = detectSubsampling(img)
  if (subsampled) {
    iw /= 2
    ih /= 2
  }
  const d = 1024 // size of tiling canvas
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
export function detectSubsampling (img) {
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
export function detectVerticalSquash (img, iw, ih) {
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

export function transformCoordinate (canvas, ctx, width, height, srcOrientation) {
  // set proper canvas dimensions before transform & export
  if ([5, 6, 7, 8].indexOf(srcOrientation) > -1) {
    canvas.width = height
    canvas.height = width
  } else {
    canvas.width = width
    canvas.height = height
  }

  // transform context before drawing image
  switch (srcOrientation) {
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

export function imgCover (imgW, imgH, divW, divH) {
  const scale = imgW / imgH
  let width = divW
  let height = width / scale
  let x = 0
  let y = -(height - divH) / 2

  if (height < divH) {
    height = divH
    width = scale * height
    x = -(width - divW) / 2
    y = 0
  }

  return {
    width,
    height,
    x,
    y
  }
}

export function imageToCanvas (target, callback) {
  function imageOrientation (arrayBuffer, file) {
    const orientation = getOrientation(arrayBuffer)
    const src = typeof file !== 'string' ? window.URL.createObjectURL(file) : file
    resetOrientation(src, orientation, callback)
  }

  function handleBinaryFile (file) {
    const fileReader = new window.FileReader()
    fileReader.onload = function (e) {
      imageOrientation(e.target.result, file)
    }
    fileReader.readAsArrayBuffer(file)
  }

  // 文件对象
  if (window.FileReader && (target instanceof window.Blob || target instanceof window.File)) {
    handleBinaryFile(target)
    return
  }

  // imageElement 或者 canvasElement
  if (typeof target === 'object' && target.nodeType) {
    if (target.tagName === 'IMG') {
      imageToCanvas(target.src, callback)
    }
    if (target.tagName === 'CANVAS') {
      callback(target)
    }
    return
  }

  // base64图片
  if (isBase64Image(target)) {
    handleBinaryFile(dataURItoBlob(target))
    return
  }

  // objectURL
  if (isObjectURL(target)) {
    objectURLToBlob(target, handleBinaryFile)
  } else { // http/https图片地址
    httpURLToArrayBuffer(target, function (arrayBuffer) {
      imageOrientation(arrayBuffer, target)
    })
  }
}

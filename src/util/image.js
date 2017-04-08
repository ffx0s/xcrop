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

    // draw image
    ctx.drawImage(img, 0, 0)

    // export canvas
    callback(canvas)
  }

  img.src = srcBase64
}

export function imgCover (imgW, imgH, divW, divH) {
  let scale = imgW / imgH
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

export function imageToCanvas (target, callback, errorCallback) {
  function imageOrientation (arrayBuffer, file) {
    const orientation = getOrientation(arrayBuffer)
    const src = typeof file !== 'string' ? window.URL.createObjectURL(file) : file
    resetOrientation(src, orientation, callback, errorCallback)
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

  // base64图片地址
  if (isBase64Image(target)) {
    handleBinaryFile(dataURItoBlob(target))
    return
  }

  // objectURL地址
  if (isObjectURL(target)) {
    objectURLToBlob(target, handleBinaryFile)
  } else { // http/https图片地址
    httpURLToArrayBuffer(target, function (arrayBuffer) {
      imageOrientation(arrayBuffer, target)
    })
  }
}

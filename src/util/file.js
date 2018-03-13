export const URL = win.URL && win.URL.createObjectURL ? win.URL : win.webkitURL && win.webkitURL.createObjectURL ? win.webkitURL : null

/**
 * base64 转 blob
 * @param {String} dataURI base64字符串
 */
export function dataURItoBlob (dataURI) {
  let byteString

  if (dataURI.split(',')[0].indexOf('base64') >= 0) {
    byteString = win.atob(dataURI.split(',')[1])
  } else {
    byteString = unescape(dataURI.split(',')[1])
  }

  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
  const ab = new ArrayBuffer(byteString.length)
  let ia = new Uint8Array(ab)

  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }

  let blob
  try {
    blob = new win.Blob([ab], {
      type: mimeString
    })
  } catch (e) {
    // TypeError old chrome and FF
    win.BlobBuilder = win.BlobBuilder ||
                   win.WebKitBlobBuilder ||
                      win.MozBlobBuilder ||
                      win.MSBlobBuilder

    if (e.name === 'TypeError' && win.BlobBuilder) {
      let bb = new win.BlobBuilder()
      bb.append(ia.buffer)
      blob = bb.getBlob(mimeString)
    } else if (e.name === 'InvalidStateError') {
      // InvalidStateError (tested on FF13 WinXP)
      blob = new win.Blob([ab], {
        type: mimeString
      })
    } else {
      // We're screwed, blob constructor unsupported entirely
    }
  }
  return blob
}

export const isObjectURL = url => /^blob:/i.test(url)

export function objectURLToBlob (url, callback) {
  const http = new win.XMLHttpRequest()
  http.open('GET', url, true)
  http.responseType = 'blob'
  http.onload = function (e) {
    if (this.status === 200 || this.status === 0) {
      callback(this.response)
    }
  }
  http.send()
}

export function httpURLToArrayBuffer (url, callback, errorCallback) {
  let http = new win.XMLHttpRequest()
  http.onload = function () {
    if (this.status === 200 || this.status === 0) {
      callback(http.response)
    } else {
      errorCallback && errorCallback('Could not load image：' + url)
    }
    http = null
  }
  http.open('GET', url, true)
  http.responseType = 'arraybuffer'
  http.send(null)
}

export function fileToArrayBuffer (file, callback, errorCallback) {
  const fileReader = new win.FileReader()

  fileReader.onload = e => { callback(e.target.result) }
  fileReader.onerror = errorCallback || function (error) { console.error('fileToArrayBuffer error: ', error) }

  fileReader.readAsArrayBuffer(file)
}

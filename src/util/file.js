export const URL = window.URL && window.URL.createObjectURL ? window.URL : window.webkitURL && window.webkitURL.createObjectURL ? window.webkitURL : null

export function dataURItoBlob (dataURI) {
  let byteString

  if (dataURI.split(',')[0].indexOf('base64') >= 0) {
    byteString = window.atob(dataURI.split(',')[1])
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
    blob = new window.Blob([ab], {
      type: mimeString
    })
  } catch (e) {
    // TypeError old chrome and FF
    window.BlobBuilder = window.BlobBuilder ||
                   window.WebKitBlobBuilder ||
                      window.MozBlobBuilder ||
                      window.MSBlobBuilder

    if (e.name === 'TypeError' && window.BlobBuilder) {
      let bb = new window.BlobBuilder()
      bb.append(ia.buffer)
      blob = bb.getBlob(mimeString)
    } else if (e.name === 'InvalidStateError') {
      // InvalidStateError (tested on FF13 WinXP)
      blob = new window.Blob([ab], {
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
  const http = new window.XMLHttpRequest()
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
  let http = new window.XMLHttpRequest()
  http.onload = function () {
    if (this.status === 200 || this.status === 0) {
      callback(http.response)
    } else {
      errorCallback && errorCallback()
      throw new Error('Could not load image')
    }
    http = null
  }
  http.open('GET', url, true)
  http.responseType = 'arraybuffer'
  http.send(null)
}

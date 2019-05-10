/**
 * @see https://gist.github.com/paulirish/1579671
 */
;(function () {
  var lastTime = 0
  var vendors = ['ms', 'moz', 'webkit', 'o']
  for (var x = 0; x < vendors.length && !win.requestAnimationFrame; ++x) {
    win.requestAnimationFrame = win[vendors[x] + 'RequestAnimationFrame']
    win.cancelAnimationFrame =
      win[vendors[x] + 'CancelAnimationFrame'] ||
      win[vendors[x] + 'CancelRequestAnimationFrame']
  }

  if (!win.requestAnimationFrame) {
    win.requestAnimationFrame = function (callback) {
      var currTime = Date.now()
      var timeToCall = Math.max(0, 16 - (currTime - lastTime))
      var id = win.setTimeout(function () {
        callback(currTime + timeToCall)
      }, timeToCall)
      lastTime = currTime + timeToCall
      return id
    }
  }

  if (!win.cancelAnimationFrame) {
    win.cancelAnimationFrame = function (id) {
      clearTimeout(id)
    }
  }
})()

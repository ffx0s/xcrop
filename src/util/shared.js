export function noop () {}

export const uuid = () => Math.random().toString(36).substring(3, 8)

export function bind (fn, ctx) {
  function boundFn (a) {
    const l = arguments.length
    return l
      ? l > 1
        ? fn.apply(ctx, arguments)
        : fn.call(ctx, a)
      : fn.call(ctx)
  }
  boundFn._length = fn.length
  return boundFn
}

export function extend (to, _from) {
  for (const key in _from) {
    to[key] = _from[key]
  }
  return to
}

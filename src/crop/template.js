export default function template (options) {
  const {
    cancleText,
    confirmText
  } = options

  return (
    '<div class="crop-container crop-hide" data-el="container">' +
      '<div class="crop-mask" data-el="mask"></div>' +
      '<div class="crop-handle" data-el="handle">' +
        `<div class="crop-cancle" data-el="cancle" data-touchstart="onCancle">${cancleText}</div>` +
        `<div class="crop-confirm" data-el="confirm" data-touchstart="onConfirm">${confirmText}</div>` +
      '</div>' +
    '</div>'
  )
}

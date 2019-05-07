export default function template (options) {
  const {
    cancleText,
    confirmText
  } = options

  return (
    '<div class="crop-container" data-el="container">' +
      '<div class="crop-zoom" data-el="zoom"></div>' +
      '<div class="crop-mask" data-el="mask"></div>' +
      '<div class="crop-handle" data-el="handle">' +
        `<div class="crop-cancle" data-el="cancle" data-click="onCancle">${cancleText}</div>` +
        `<div class="crop-confirm" data-el="confirm" data-click="onConfirm">${confirmText}</div>` +
      '</div>' +
    '</div>'
  )
}

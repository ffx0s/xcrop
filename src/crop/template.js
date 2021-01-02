export default function template (options) {
  const {
    cancelText,
    confirmText
  } = options

  return (
    '<div class="crop" data-el="container">' +
      '<div class="crop__zoom" data-el="zoom"></div>' +
      '<div class="crop__mask" data-el="mask"></div>' +
      '<div class="crop__handle" data-el="handle">' +
        `<div class="crop__handle-cancel" data-el="cancel" data-click="onCancel">${cancelText}</div>` +
        `<div class="crop__handle-confirm" data-el="confirm" data-click="onConfirm">${confirmText}</div>` +
      '</div>' +
    '</div>'
  )
}

function getCanvasHeight(windowsHeight: number) {
  return windowsHeight - 32 - 64 - 64.5 - 32;
}

function getCanvasWidth(windowsWidth: number) {
  return windowsWidth > 768
    ? Math.floor((windowsWidth - 40) * 0.62)
    : windowsWidth - 20;
}

function getEditorHeight(windowsHeight: number) {
  return windowsHeight - 32 - 64 - 64.5 - 32;
}

function getEditorWidth(windowsWidth: number) {
  return windowsWidth > 768
    ? Math.floor((windowsWidth - 40) * 0.37)
    : windowsWidth - 20;
}

export { getEditorWidth, getEditorHeight, getCanvasWidth, getCanvasHeight };

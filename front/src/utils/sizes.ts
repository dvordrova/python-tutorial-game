import { awardColor, cellColor, fieldColor } from "./constants";
import { ILevel } from "./model";

function getCanvasHeight(windowsHeight: number) {
  return windowsHeight - 158;
}

function getCanvasWidth(windowsWidth: number) {
  return windowsWidth > 680
    ? (windowsWidth - 40) * (15 / 24)
    : windowsWidth - 20;
}

function getEditorHeight(windowsHeight: number) {
  return windowsHeight / 2;
}

function getEditorWidth(windowsWidth: number) {
  return windowsWidth > 680
    ? (windowsWidth - 40) * (9 / 24)
    : windowsWidth - 20;
}

export { getEditorWidth, getEditorHeight, getCanvasWidth, getCanvasHeight };

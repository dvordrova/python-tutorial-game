import { awardColor, cellColor, fieldColor } from "./constants";
import { ILevel } from "./model";

import { sleep } from "./sleep";

function drawAward(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  size: number,
) {
  ctx.beginPath();
  ctx.moveTo(centerX + Math.cos(0) * size, centerY + Math.sin(0) * size);
  for (let i = 1; i <= 5; ++i) {
    ctx.lineTo(
      centerX + (Math.cos((i * 2 * Math.PI) / 5 - Math.PI / 5) * size) / 2,
      centerY + (Math.sin((i * 2 * Math.PI) / 5 - Math.PI / 5) * size) / 2,
    );
    ctx.lineTo(
      centerX + Math.cos((i * 2 * Math.PI) / 5) * size,
      centerY + Math.sin((i * 2 * Math.PI) / 5) * size,
    );
  }
  ctx.closePath();
  ctx.fill();
}

function drawLevel(
  canvasWidth: number,
  canvasHeight: number,
  level: ILevel,
  ctx: CanvasRenderingContext2D,
  leftOffset: number,
  upOffset: number,
  cellSize: number,
  gapBeetween: number,
) {
  console.debug("drawLevel", {
    canvasWidth,
    canvasHeight,
    level,
    ctx,
    leftOffset,
    upOffset,
    cellSize,
    gapBeetween,
  });
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.fillStyle = fieldColor;
  ctx.fillRect(
    leftOffset - gapBeetween,
    upOffset - gapBeetween,
    (cellSize + gapBeetween) * level.width + gapBeetween,
    (cellSize + gapBeetween) * level.height + gapBeetween,
  );
  ctx.fillStyle = cellColor;
  ctx.beginPath();
  for (let x = 0; x < level.width; x++) {
    for (let y = 0; y < level.height; y++) {
      ctx.rect(
        leftOffset + x * (cellSize + gapBeetween),
        upOffset + y * (cellSize + gapBeetween),
        cellSize,
        cellSize,
      );
    }
  }
  console.debug("drawLevel fill");
  ctx.fill();

  ctx.fillStyle = awardColor;
  for (let i = 0; i < level.awards.length; i++) {
    console.debug("drawLevel award", i);
    let award = level.awards[i];
    drawAward(
      ctx,
      leftOffset + award.x * (cellSize + gapBeetween) + cellSize / 2,
      upOffset + award.y * (cellSize + gapBeetween) + cellSize / 2,
      cellSize * 0.5,
    );
  }
}

export { drawAward, drawLevel };

import { awardColor, cellColor, fieldColor, gapBeetween } from "./constants";
import { ILevel, IRobot, Point } from "./model";

import { getCanvasWidth, getCanvasHeight } from "./sizes";

import robotImage from "../assets/vacuum-cleaner-robot.png";

const devicePixelRatio =
  typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

class LevelDrawer {
  ctx?: CanvasRenderingContext2D | null;
  robotImage: HTMLImageElement;
  level?: ILevel;
  width: number = 0;
  height: number = 0;
  cellSize: number = 0;

  constructor(canvasRef: React.RefObject<HTMLCanvasElement>, level?: ILevel) {
    this.ctx = canvasRef?.current?.getContext("2d");
    this.robotImage = new Image();
    this.robotImage.src = robotImage;
    this.robotImage.onload = () => {
      this.redraw();
    };
    this.level = level;
    this.updateCanvasSize();
  }

  updateCellSize() {
    if (!this.level) {
      return;
    }
    this.cellSize = Math.min(
      (this.width - gapBeetween) / this.level.width - gapBeetween,
      (this.height - gapBeetween) / this.level.height - gapBeetween,
    );
  }

  updateCanvasSize() {
    this.width = getCanvasWidth(window.innerWidth);
    this.height = getCanvasHeight(window.innerHeight);
    if (this.level) {
      if (this.level.width / this.level.height < 1) {
        this.width = this.height * (this.level.width / this.level.height);
      } else {
        this.height = this.width * (this.level.height / this.level.width);
      }
    }
    if (!this.ctx) {
      return;
    }
    this.ctx.canvas.width = this.width * devicePixelRatio;
    this.ctx.canvas.height = this.height * devicePixelRatio;
    this.ctx.canvas.style.width = `${this.width}px`;
    this.ctx.canvas.style.height = `${this.height}px`;

    this.ctx.scale(devicePixelRatio, devicePixelRatio);

    this.updateCellSize();
    this.redraw();
  }

  redraw() {
    this.drawLevel();
    if (this.level) {
      this.drawRobots(this.level.robots);
    }
  }

  setLevel(level?: ILevel) {
    this.level = level;
    this.updateCanvasSize();
  }

  drawAward(centerX: number, centerY: number) {
    if (!this.ctx) {
      return;
    }
    let size = this.cellSize / 2;
    this.ctx.beginPath();
    this.ctx.moveTo(centerX + Math.cos(0) * size, centerY + Math.sin(0) * size);
    for (let i = 1; i <= 5; ++i) {
      this.ctx.lineTo(
        centerX + (Math.cos((i * 2 * Math.PI) / 5 - Math.PI / 5) * size) / 2,
        centerY + (Math.sin((i * 2 * Math.PI) / 5 - Math.PI / 5) * size) / 2,
      );
      this.ctx.lineTo(
        centerX + Math.cos((i * 2 * Math.PI) / 5) * size,
        centerY + Math.sin((i * 2 * Math.PI) / 5) * size,
      );
    }
    this.ctx.closePath();
    this.ctx.fill();
  }

  drawLevel() {
    if (!this.ctx || !this.level) {
      return;
    }
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = fieldColor;
    this.ctx.fillRect(
      gapBeetween,
      gapBeetween,
      (this.cellSize + gapBeetween) * this.level.width + gapBeetween,
      (this.cellSize + gapBeetween) * this.level.height + gapBeetween,
    );
    this.ctx.fillStyle = cellColor;
    this.ctx.beginPath();
    for (let x = 0; x < this.level.width; x++) {
      for (let y = 0; y < this.level.height; y++) {
        this.ctx.rect(
          x * (this.cellSize + gapBeetween),
          y * (this.cellSize + gapBeetween),
          this.cellSize,
          this.cellSize,
        );
      }
    }
    console.debug("drawLevel fill");
    this.ctx.fill();
    this.ctx.fillStyle = awardColor;
    for (let i = 0; i < this.level.awards.length; i++) {
      console.debug("drawLevel award", i);
      let award = this.level.awards[i];
      this.drawAward(
        award.x * (this.cellSize + gapBeetween) + this.cellSize / 2,
        award.y * (this.cellSize + gapBeetween) + this.cellSize / 2,
      );
    }
  }

  drawSensor(x: number, y: number) {
    if (!this.ctx) {
      return;
    }
    let radius = (this.cellSize * 22) / 1080;
    for (let i = 1; i <= 3; i++) {
      let opacity = 0.5;
      this.ctx.fillStyle = "rgba(200, 0, 0, " + opacity + ")";
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius * 2 ** i, 0, 2 * Math.PI);
      this.ctx.closePath();
      this.ctx.fill();
    }
  }

  drawSensorUp(left_x: number, top_y: number) {
    this.drawSensor(
      left_x + (this.cellSize * 537) / 1080,
      top_y + (this.cellSize * 199) / 1080,
    );
  }

  drawSensorRight(left_x: number, top_y: number) {
    this.drawSensor(
      left_x + (this.cellSize * 868) / 1080,
      top_y + (this.cellSize * 500.5) / 1080,
    );
  }

  drawSensorDown(left_x: number, top_y: number) {
    this.drawSensor(
      left_x + (this.cellSize * 537) / 1080,
      top_y + (this.cellSize * 800) / 1080,
    );
  }

  drawSensorLeft(left_x: number, top_y: number) {
    this.drawSensor(
      left_x + (this.cellSize * 204) / 1080,
      top_y + (this.cellSize * 500.5) / 1080,
    );
  }

  drawRobots(robots: Point[]) {
    if (!this.ctx) {
      console.debug("drawRobots no ctx");
      return;
    }
    console.debug("drawRobots");
    for (let i = 0; i < robots.length; i++) {
      let x = robots[i].x * (this.cellSize + gapBeetween);
      let y = robots[i].y * (this.cellSize + gapBeetween);
      this.ctx.drawImage(this.robotImage, x, y, this.cellSize, this.cellSize);
    }
  }

  drawRobotsBetweenSteps(
    robots: IRobot[],
    next_robots: IRobot[],
    percentOfStep: number,
  ) {
    if (!this.ctx) {
      return;
    }
    for (let i = 0; i < robots.length; i++) {
      let cur_robot = robots[i];
      let next_robot = next_robots[i];
      let x =
        cur_robot.x * (this.cellSize + gapBeetween) * (1 - percentOfStep) +
        next_robot.x * (this.cellSize + gapBeetween) * percentOfStep;
      let y =
        cur_robot.y * (this.cellSize + gapBeetween) * (1 - percentOfStep) +
        next_robot.y * (this.cellSize + gapBeetween) * percentOfStep;
      this.ctx.drawImage(this.robotImage, x, y, this.cellSize, this.cellSize);

      if (
        cur_robot.sensors.up &&
        (percentOfStep < 0.1 || next_robot.sensors.up)
      ) {
        this.drawSensorUp(x, y);
      }
      if (
        cur_robot.sensors.right &&
        (percentOfStep < 0.1 || next_robot.sensors.right)
      ) {
        this.drawSensorRight(x, y);
      }
      if (
        cur_robot.sensors.down &&
        (percentOfStep < 0.1 || next_robot.sensors.down)
      ) {
        this.drawSensorDown(x, y);
      }
      if (
        cur_robot.sensors.left &&
        (percentOfStep < 0.1 || next_robot.sensors.left)
      ) {
        this.drawSensorLeft(x, y);
      }
    }
  }
}

export { LevelDrawer };

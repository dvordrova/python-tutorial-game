import React, { useRef, useState, useCallback, useEffect } from "react";
import styled from "styled-components";

import { debounce } from "lodash";
import { Slider, Spin } from "antd";
import { getCanvasWidth, getCanvasHeight } from "../utils/sizes";
import { ILevel, ISimulationStep } from "../utils/model";
import {
  robotColor,
  robotColors,
  gapBeetween,
  slowness,
} from "../utils/constants";
import { drawLevel } from "../utils/draw";

const SimulationCanvas = styled.canvas`
  display: block;
  overflow: auto;
  height: 100%;
  width: 100%;
`;

interface ISimulationFieldProps {
  level?: ILevel;
  simulationSteps?: ISimulationStep[];
  toggleSimulation: boolean;
}

const devicePixelRatio =
  typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

export default function SimulationField({
  level,
  simulationSteps,
  toggleSimulation,
}: ISimulationFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cellSize, setCellSize] = useState(50);
  const [radiusRobot, setRadiusRobot] = useState(15);
  const [leftOffset, setLeftOffset] = useState(50);
  const [upOffset, setUpOffset] = useState(50);
  const [sliderRange, setSliderRange] = useState(0);
  const [runningSimulation, setRunningSimulation] = useState(false);
  const [simulationFrameStart, setSimulationFrameStart] = useState(0);
  const [slownessLevel, setSlownessLevel] = useState(0);
  const [height, setHeight] = useState<number>(
    getCanvasHeight(window.innerHeight),
  );
  const [width, setWidth] = useState<number>(getCanvasWidth(window.innerWidth));
  const [sliderValue, setSliderValue] = useState(0);

  const updateSize = useCallback(
    debounce(() => {
      console.log("updateSize canvas", updateSize);
      setWidth(getCanvasWidth(window.innerWidth));
      setHeight(getCanvasHeight(window.innerHeight));
    }, 300),
    [],
  );

  useEffect(() => {
    setSliderRange(simulationSteps ? simulationSteps.length - 1 : 0);
    setSimulationFrameStart(0);
    setRunningSimulation(simulationSteps !== undefined);
  }, [simulationSteps, level]);

  useEffect(() => {
    updateSize();
  }, []);

  const setUpLevelGrid = useCallback(
    (level: ILevel) => {
      let newCellSize = (width - gapBeetween) / level.width - gapBeetween;
      let newUpOffset =
        height / 2 -
        (level.height * (newCellSize + gapBeetween) + gapBeetween) / 2;
      let newLeftOffset = gapBeetween;
      if (newUpOffset < 0) {
        newCellSize = (height - gapBeetween) / level.height - gapBeetween;
        newUpOffset = gapBeetween;
        newLeftOffset =
          width / 2 -
          (level.width * (newCellSize + gapBeetween) + gapBeetween) / 2;
      }
      setCellSize(newCellSize);
      setLeftOffset(newLeftOffset);
      setUpOffset(newUpOffset);
      setRadiusRobot(Math.sqrt((newCellSize * newCellSize) / 2) / 2);
    },
    [height, width],
  );

  const drawStatic = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (!!level) {
        console.log("drawing static Level");
        drawLevel(
          width,
          height,
          level,
          ctx,
          leftOffset,
          upOffset,
          cellSize,
          gapBeetween,
        );

        ctx.fillStyle = robotColor;
        for (let i = 0; i < level.robots.length; i++) {
          ctx.fillStyle = robotColors[i % 4];
          ctx.beginPath();
          let robot = level.robots[i];
          let x =
            leftOffset + robot.x * (cellSize + gapBeetween) + cellSize / 2;
          let y = upOffset + robot.y * (cellSize + gapBeetween) + cellSize / 2;
          ctx.arc(x, y, radiusRobot, 0, 2 * Math.PI);
          ctx.closePath();
          ctx.fill();
        }
      }
    },
    [level, cellSize, radiusRobot, leftOffset, upOffset, height, width],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!!canvas) {
      const context = canvas.getContext("2d");
      if (!!context) {
        drawStatic(context);
      }
    }
  }, [canvasRef, drawStatic]);

  const [spinning, setSpinning] = useState(true);

  useEffect(() => {
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  });

  const drawSimulation = useCallback(
    (ctx: CanvasRenderingContext2D, step: number, percentOfStep: number) => {
      if (!!level) {
        drawLevel(
          width,
          height,
          level,
          ctx,
          leftOffset,
          upOffset,
          cellSize,
          gapBeetween,
        );
      }

      ctx.fillStyle = robotColor;

      if (simulationSteps === undefined) {
        return;
      }

      // count of robots should be constant between steps
      let currentStep = simulationSteps[step];
      let robotsCount = currentStep.robots.length;
      let nextStep =
        simulationSteps[Math.min(step + 1, simulationSteps.length - 1)];

      for (let i = 0; i < robotsCount; i++) {
        ctx.fillStyle = robotColors[i % 4];
        ctx.beginPath();
        let cur_robot = currentStep.robots[i];
        let cur_x =
          leftOffset + cur_robot.x * (cellSize + gapBeetween) + cellSize / 2;
        let cur_y =
          upOffset + cur_robot.y * (cellSize + gapBeetween) + cellSize / 2;

        let next_robot = nextStep.robots[i];
        let next_x =
          leftOffset + next_robot.x * (cellSize + gapBeetween) + cellSize / 2;
        let next_y =
          upOffset + next_robot.y * (cellSize + gapBeetween) + cellSize / 2;

        ctx.arc(
          cur_x * (1 - percentOfStep) + next_x * percentOfStep,
          cur_y * (1 - percentOfStep) + next_y * percentOfStep,
          radiusRobot,
          0,
          2 * Math.PI,
        );
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#AA00AA";
        if (
          cur_robot.sensors.right &&
          (percentOfStep < 0.1 || next_robot.sensors.right)
        ) {
          ctx.beginPath();
          ctx.arc(
            cur_x * (1 - percentOfStep) + next_x * percentOfStep,
            cur_y * (1 - percentOfStep) + next_y * percentOfStep,
            radiusRobot,
            -Math.PI / 4,
            Math.PI / 4,
          );
          ctx.closePath();
          ctx.fill();
        }
        if (
          cur_robot.sensors.down &&
          (percentOfStep < 0.1 || next_robot.sensors.down)
        ) {
          ctx.beginPath();
          ctx.arc(
            cur_x * (1 - percentOfStep) + next_x * percentOfStep,
            cur_y * (1 - percentOfStep) + next_y * percentOfStep,
            radiusRobot,
            Math.PI / 4,
            (3 * Math.PI) / 4,
          );
          ctx.closePath();
          ctx.fill();
        }
        if (
          cur_robot.sensors.left &&
          (percentOfStep < 0.1 || next_robot.sensors.left)
        ) {
          ctx.beginPath();
          ctx.arc(
            cur_x * (1 - percentOfStep) + next_x * percentOfStep,
            cur_y * (1 - percentOfStep) + next_y * percentOfStep,
            radiusRobot,
            (3 * Math.PI) / 4,
            (5 * Math.PI) / 4,
          );
          ctx.closePath();
          ctx.fill();
        }
        if (
          cur_robot.sensors.up &&
          (percentOfStep < 0.1 || next_robot.sensors.up)
        ) {
          ctx.beginPath();
          ctx.arc(
            cur_x * (1 - percentOfStep) + next_x * percentOfStep,
            cur_y * (1 - percentOfStep) + next_y * percentOfStep,
            radiusRobot,
            (5 * Math.PI) / 4,
            (7 * Math.PI) / 4,
          );
          ctx.closePath();
          ctx.fill();
        }
      }
    },
    [
      level,
      cellSize,
      radiusRobot,
      leftOffset,
      upOffset,
      simulationSteps,
      height,
      width,
    ],
  );

  useEffect(() => {
    console.debug("useEffect runningSimulation", {
      slownessLevel,
      drawSimulation,
      canvasRef,
      runningSimulation,
      simulationSteps,
      simulationFrameStart,
      toggleSimulation,
    });
    let frameCount = 0;
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!runningSimulation || !canvas) {
      console.debug("not drawing simulation: ", { runningSimulation, canvas });
      return;
    }
    const context = canvas.getContext("2d");

    if (!context) {
      console.debug("not drawing simulation: ", { context });
      return;
    }

    if (!simulationSteps) {
      console.debug("not drawing simulation: ", { simulationSteps });
      return;
    }

    const render = () => {
      console.debug("render function called");
      frameCount++;
      let simulationStep =
        simulationFrameStart + Math.floor(frameCount / slowness[slownessLevel]);
      let percentOfStep =
        (frameCount % slowness[slownessLevel]) / slowness[slownessLevel];
      if (simulationStep < simulationSteps.length) {
        setSliderValue(simulationStep);
        drawSimulation(context, simulationStep, percentOfStep);
        animationFrameId = window.requestAnimationFrame(render);
      } else {
        setRunningSimulation(false);
      }
    };
    render();
    return () => {
      console.log(`cancelingAnimationFrame ${animationFrameId}`);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [
    slownessLevel,
    drawSimulation,
    canvasRef,
    runningSimulation,
    simulationSteps,
    simulationFrameStart,
    toggleSimulation,
  ]);

  // useEffect(() => {

  // }, [canvasRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      // Set the drawing surface dimensions
      canvas.width = width * devicePixelRatio;
      canvas.height = height * devicePixelRatio;

      // Adjust the display size (via CSS) to match your original dimensions
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      //   const canvas = canvasRef.current;
      //   // If you're drawing on the canvas, remember to scale your context
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (!!ctx) {
          ctx.scale(devicePixelRatio, devicePixelRatio);
        }
      }
    }
  }, [width, height, canvasRef]);

  useEffect(() => {
    setRunningSimulation(false);
    setSpinning(level === undefined);
    if (!!level) {
      setUpLevelGrid(level);
    }
  }, [level]);

  const clickSlider = useCallback(
    debounce((value) => {
      setSliderValue(value);
      setSimulationFrameStart(value);
      setRunningSimulation(true);
    }, 300),
    [],
  );

  return (
    <>
      <Slider
        value={sliderValue}
        disabled={!simulationSteps}
        max={sliderRange}
        onChange={clickSlider}
        tooltip={{ open: false }}
      />
      <Spin tip="Loading..." spinning={spinning}>
        <SimulationCanvas ref={canvasRef} />
      </Spin>
    </>
  );
}

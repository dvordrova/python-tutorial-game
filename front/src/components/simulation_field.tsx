import React, { useRef, useState, useCallback, useEffect } from "react";
import styled from "styled-components";

import { debounce } from "lodash";
import { Slider, Spin, Flex, Radio, Typography } from "antd";

import { ILevel, ISimulationStep } from "../utils/model";
import { LevelDrawer } from "../utils/draw";

const { Title } = Typography;

// display: block;
// overflow: auto;
const SimulationCanvas = styled.canvas`
  @media (max-width: 992px) {
    max-width: 100vw;
    height: 100vh;
    max-height: 100vh;
  }

  @media (min-width: 992px) {
    max-width: calc(62vw - 30px);
  }
`;

const SlownessRadioGroup = styled(Radio.Group)`
  margin-bottom: 16px;
`;

const SpeedTitle = styled(Title)`
  display: inline;
  margin-right: 16px;
`;

interface ISimulationFieldProps {
  level?: ILevel;
  simulationSteps?: ISimulationStep[];
  toggleSimulation: boolean;
}

const slownessOptions = [
  { label: "x1", value: 50 / 1 },
  { label: "x2", value: 50 / 2 },
  { label: "x5", value: 50 / 5 },
];

const devicePixelRatio =
  typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

export default function SimulationField({
  level,
  simulationSteps,
  toggleSimulation,
}: ISimulationFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [sliderRange, setSliderRange] = useState(0);
  const [runningSimulation, setRunningSimulation] = useState(false);
  const [simulationFrameStart, setSimulationFrameStart] = useState(0);
  const [slowness, setSlowness] = useState(50);
  const [sliderValue, setSliderValue] = useState(0);
  const [levelDrawer, setLevelDrawer] = useState<LevelDrawer>();

  // level drawer setters
  useEffect(() => {
    setLevelDrawer(new LevelDrawer(canvasRef, level));
    if (toggleSimulation) {
      setRunningSimulation(false);
      setSimulationFrameStart(0);
      setSliderValue(0);
    }
  }, [canvasRef, level, toggleSimulation]);

  // scale canvas
  useEffect(() => {
    const ctx = canvasRef?.current?.getContext("2d");
    if (ctx) {
      console.log("scale", { canvas: canvasRef.current, devicePixelRatio });
      ctx.scale(devicePixelRatio, devicePixelRatio);
      levelDrawer?.updateCanvasSize();
    }
  }, [canvasRef, levelDrawer]);
  const updateSize = debounce(() => {
    if (levelDrawer !== undefined) {
      levelDrawer.updateCanvasSize();
    }
  }, 300);
  useEffect(() => {
    setSliderRange(simulationSteps ? simulationSteps.length - 1 : 0);
    setSimulationFrameStart(0);
    setRunningSimulation(simulationSteps !== undefined);
  }, [simulationSteps, level, toggleSimulation]);

  useEffect(() => {
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  });

  const drawSimulation = useCallback(
    (step: number, percentOfStep: number) => {
      if (!levelDrawer) {
        return;
      }
      levelDrawer.drawLevel();
      if (level?.walls) {
        levelDrawer.drawWalls(level.walls);
      }

      if (simulationSteps === undefined) {
        return;
      }

      // count of robots should be constant between steps
      let currentStep = simulationSteps[step];
      let nextStep =
        simulationSteps[Math.min(step + 1, simulationSteps.length - 1)];

      // draw robots
      levelDrawer.drawRobotsBetweenSteps(
        currentStep.robots,
        nextStep.robots,
        percentOfStep,
      );
    },
    [level, levelDrawer, simulationSteps],
  );

  useEffect(() => {
    console.debug("useEffect runningSimulation", {
      slowness,
      drawSimulation,
      runningSimulation,
      simulationSteps,
      simulationFrameStart,
      toggleSimulation,
    });
    let frameCount = 0;
    let animationFrameId: number;
    if (!runningSimulation || !simulationSteps) {
      console.debug("not drawing simulation: ", {
        runningSimulation,
        simulationSteps,
      });
      return;
    }

    const render = () => {
      console.debug("render function called");
      frameCount++;
      let simulationStep =
        simulationFrameStart + Math.floor(frameCount / slowness);
      let percentOfStep = (frameCount % slowness) / slowness;
      if (simulationStep < simulationSteps.length) {
        setSliderValue(simulationStep);
        drawSimulation(simulationStep, percentOfStep);
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
    slowness,
    drawSimulation,
    runningSimulation,
    simulationSteps,
    simulationFrameStart,
    toggleSimulation,
  ]);

  const clickSlider = debounce((value) => {
    setSliderValue(value);
    setSimulationFrameStart(value);
    setRunningSimulation(true);
  }, 300);

  const onSlownessChange = (e: any) => {
    setSlowness(e.target.value);
  };

  return (
    <>
      <Slider
        value={sliderValue}
        disabled={!simulationSteps}
        max={sliderRange}
        onChange={clickSlider}
        tooltip={{ open: false }}
      />
      <SpeedTitle level={4}>Скорость</SpeedTitle>
      <SlownessRadioGroup
        options={slownessOptions}
        onChange={onSlownessChange}
        value={slowness}
        optionType="button"
      />
      <Flex justify="center">
        <Spin tip="Loading..." spinning={level === undefined}>
          <SimulationCanvas ref={canvasRef} />
        </Spin>
      </Flex>
    </>
  );
}

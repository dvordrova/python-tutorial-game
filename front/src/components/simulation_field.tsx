import React, { useRef, useState, useCallback, useEffect } from "react";
import styled from "styled-components";

import { debounce, cloneDeep } from "lodash";
import { Slider, Spin, Flex } from "antd";

import { ILevel, ISimulationStep } from "../utils/model";
import { gapBeetween, slowness } from "../utils/constants";
import { LevelDrawer } from "../utils/draw";

// display: block;
const SimulationCanvas = styled.canvas`
  overflow: auto;
  height: 100%;
  width: 100%;
`;

interface ISimulationFieldProps {
  level?: ILevel;
  simulationSteps?: ISimulationStep[];
  toggleSimulation: boolean;
}

export default function SimulationField({
  level,
  simulationSteps,
  toggleSimulation,
}: ISimulationFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [sliderRange, setSliderRange] = useState(0);
  const [runningSimulation, setRunningSimulation] = useState(false);
  const [simulationFrameStart, setSimulationFrameStart] = useState(0);
  const [slownessLevel, setSlownessLevel] = useState(1);
  const [sliderValue, setSliderValue] = useState(0);
  const [levelDrawer, setLevelDrawer] = useState<LevelDrawer>();

  // level drawer setters
  useEffect(() => {
    setLevelDrawer(new LevelDrawer(canvasRef));
  }, [canvasRef]);

  useEffect(() => {
    if (levelDrawer) {
      levelDrawer.setLevel(level);
    }
  }, [level]);
  const updateSize = useCallback(
    debounce(() => {
      if (levelDrawer !== undefined) {
        levelDrawer.updateCanvasSize();
      }
    }, 300),
    [levelDrawer],
  );

  useEffect(() => {
    setSliderRange(simulationSteps ? simulationSteps.length - 1 : 0);
    setSimulationFrameStart(0);
    setRunningSimulation(simulationSteps !== undefined);
  }, [simulationSteps, level, toggleSimulation]);

  useEffect(() => {
    if (!levelDrawer) {
      return;
    }
    levelDrawer.setLevel(level);
  }, [level]);

  const [spinning, setSpinning] = useState(true);

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
    [level, simulationSteps],
  );

  useEffect(() => {
    console.debug("useEffect runningSimulation", {
      slownessLevel,
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
        simulationFrameStart + Math.floor(frameCount / slowness[slownessLevel]);
      let percentOfStep =
        (frameCount % slowness[slownessLevel]) / slowness[slownessLevel];
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
    slownessLevel,
    drawSimulation,
    runningSimulation,
    simulationSteps,
    simulationFrameStart,
    toggleSimulation,
  ]);

  useEffect(() => {
    setRunningSimulation(false);
    setSpinning(level === undefined);
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
      <Flex justify="center">
        <Spin tip="Loading..." spinning={spinning}>
          <SimulationCanvas ref={canvasRef} />
        </Spin>
      </Flex>
    </>
  );
}

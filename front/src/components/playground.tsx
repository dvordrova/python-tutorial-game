import React, { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Row, Col, Button, Spin, Card, Progress } from "antd";

import {
  ILevel,
  RequestState,
  SimulationRunResult,
  ISimulationStep,
} from "../utils/model";

import SimulationField from "./simulation_field";
import Editor from "./editor";
import { runLevel } from "../service/http";

// const PlayGroundRowWrapper = styled.div`
//   display: flex;
//   flex-direction: row;
//   flex-wrap: wrap;
// `;

// const PlayGroundColumnWrapper = styled.div`
//   display: flex;
//   flex-direction: column;
//   margin: 10px 10px 0px 10px;
// `;

interface IPlayGroundProps {
  level?: ILevel;
}

export default function PlayGround({ level }: IPlayGroundProps) {
  const [loadingRun, setLoadingRun] = useState(false);
  const [errorReason, setErrorReason] = useState<string>();
  const [code, setCode] = useState(localStorage.getItem("code") || "");
  const [codeChanged, setCodeChanged] = useState(true);
  const [simulationRunResult, setSimulationRunResult] =
    useState<SimulationRunResult>();
  const [runRequestFailed, setRunRequestFailed] = useState(false);
  const [simulationSteps, setSimulationSteps] = useState<ISimulationStep[]>();
  const [toggleSimulation, setToggleSimulation] = useState(false);
  const [simulationWasRun, setSimulationWasRun] = useState(false);

  useEffect(() => {
    localStorage.setItem("code", code);
    setCodeChanged(true);
  }, [code]);

  const handleClick = useCallback(
    (_: any) => {
      if (level == undefined) {
        return;
      }
      if (!codeChanged) {
        setToggleSimulation(!toggleSimulation);
        return;
      }
      setLoadingRun(true);
      setCodeChanged(false);
      setSimulationSteps(undefined);
      runLevel({ level_id: level.id, code: code }).then((data) => {
        if (data.state === RequestState.Error) {
          setRunRequestFailed(true);
          setErrorReason(data.reason);
          setLoadingRun(false);
          return;
        }
        setRunRequestFailed(false);
        if (data.steps) {
          setSimulationSteps(data.steps);
          // for mobile
          window.scrollTo(0, 0);
        }
        setSimulationRunResult(data.result);
        setLoadingRun(false);
      });
    },
    [code, codeChanged, level, toggleSimulation],
  );

  return (
    <Row>
      <Col
        xs={{ flex: "100%" }}
        sm={{ flex: "100%" }}
        md={{ flex: "62%" }}
        lg={{ flex: "62%" }}
        xl={{ flex: "62%" }}
      >
        <SimulationField
          level={level}
          simulationSteps={simulationSteps}
          toggleSimulation={toggleSimulation}
        />
      </Col>

      <Col
        xs={{ flex: "100%" }}
        sm={{ flex: "100%" }}
        md={{ flex: "18%" }}
        lg={{ flex: "18%" }}
        xl={{ flex: "18%" }}
      >
        <Editor code={code} setCode={setCode} />
        <br />
        <Spin spinning={loadingRun}>
          <Button
            type="primary"
            htmlType="submit"
            shape="round"
            size="large"
            onClick={handleClick}
            disabled={code === ""}
          >
            {simulationWasRun && codeChanged === false && !runRequestFailed
              ? "Рестарт"
              : "Старт"}
          </Button>
          {runRequestFailed && !!errorReason && (
            <>
              <br />
              <Card title="Ошибка">
                <p>{errorReason}</p>
              </Card>
            </>
          )}
          {!runRequestFailed &&
            simulationRunResult === SimulationRunResult.Win && (
              <Progress percent={100} size="small" />
            )}
          {!runRequestFailed &&
            simulationRunResult === SimulationRunResult.Lose && (
              <Progress percent={70} size="small" status="exception" />
            )}
        </Spin>
      </Col>
    </Row>
  );
}

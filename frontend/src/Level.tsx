import React, { useCallback, useEffect, useRef, useState } from 'react';
import 'antd/dist/antd.css';
import './App.css';
import { Button, Spin, Card, Progress, Slider } from 'antd';
import axios from 'axios';
import AceEditor from "react-ace";
import debounce from "lodash/debounce"

import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/theme-solarized_dark";


import {
    useParams
} from "react-router-dom";
import {
    RequestState, SimulationRunResult, ISimulationStep,
    ILevel, ILevelDescription, IRunLevelRequest, IRunDescription
} from './model';
import { gapBeetween, robotColor, robotColors, slowness } from './constants';
import { getCanvasHeight, getCanvasWidth, getEditorHeight, getEditorWidth, drawLevel } from './helpers'

interface LevelProps {
    setMenuSelectedItems: (number) => void
}

export default function Level(props: LevelProps) {
    const { levelId } = useParams();
    useEffect(() => {
        props.setMenuSelectedItems([levelId.toString()])
        localStorage.setItem('level', levelId)
    }, [levelId])

    const [level, setLevel] = useState<ILevel>()
    const [spinning, setSpinning] = useState(true)

    const [loadingRun, setLoadingRun] = useState(false)
    const [runningSimulation, setRunningSimulation] = useState(false)
    const [simulationSteps, setSimulationSteps] = useState<ISimulationStep[]>([])
    const [runRequestFailed, setRunRequestFailed] = useState(false)
    const [errorReason, setErrorReason] = useState<string>()
    const [simulationRunResult, setSimulationRunResult] = useState<SimulationRunResult>()

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [height, setHeight] = useState<number>(getCanvasHeight(window.innerHeight));
    const [width, setWidth] = useState<number>(getCanvasWidth(window.innerWidth));
    const [cellSize, setCellSize] = useState(50)
    const [radiusRobot, setRadiusRobot] = useState(15)
    const [leftOffset, setLeftOffset] = useState(50)
    const [upOffset, setUpOffset] = useState(50)

    const [editorLoaded, setEditorLoaded] = useState(false)
    const [code, setCode] = useState(localStorage.getItem('code') || "");
    const [codeChanged, setCodeChanged] = useState(false)
    const [editorHeight, setEditorHeight] = useState<number>(getEditorHeight(window.innerHeight));
    const [editorWidth, setEditorWidth] = useState<number>(getEditorWidth(window.innerWidth));

    const [sliderValue, setSliderValue] = useState(0)
    const [sliderRange, setSliderRange] = useState(0)
    const [simulationFrameStart, setSimulationFrameStart] = useState(0)
    const [toggleSimulation, setToggleSimulation] = useState(false)
    const [simulationWasRun, setSimulationWasRun] = useState(false)
    const [slownessLevel, setSlownessLevel] = useState(0)

    const updateSize = useCallback(debounce(() => {
        setWidth(getCanvasWidth(window.innerWidth));
        setHeight(getCanvasHeight(window.innerHeight));
        setEditorWidth(getEditorWidth(window.innerWidth));
        setEditorHeight(getEditorHeight(window.innerHeight))
    }, 300), [setWidth, setHeight, setEditorWidth, setEditorHeight]);

    useEffect(() => {
        console.log('updateSize', updateSize)
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, [updateSize])


    const setUpLevelGrid = useCallback((level: ILevel) => {
        let newCellSize = (width - gapBeetween) / level.width - gapBeetween
        let newUpOffset = height / 2 - (level.height * (newCellSize + gapBeetween) + gapBeetween) / 2
        let newLeftOffset = gapBeetween
        if (newUpOffset < 0) {
            newCellSize = (height - gapBeetween) / level.height - gapBeetween
            newUpOffset = gapBeetween
            newLeftOffset = width / 2 - (level.width * (newCellSize + gapBeetween) + gapBeetween) / 2
        }
        setCellSize(newCellSize);
        setLeftOffset(newLeftOffset);
        setUpOffset(newUpOffset)
        setRadiusRobot(Math.sqrt(newCellSize*newCellSize/2)/2)
    }, [height, width])

    const drawStatic = useCallback((ctx: CanvasRenderingContext2D) => {
        if (!!level) {
            console.log('drawing static Level')
            drawLevel(width, height, level, ctx, leftOffset, upOffset, cellSize, gapBeetween)

            ctx.fillStyle = robotColor
            for (let i = 0; i < level.robots.length; i++) {
                ctx.fillStyle = robotColors[i % 4]
                ctx.beginPath()
                let robot = level.robots[i]
                let x = leftOffset + robot.x * (cellSize + gapBeetween) + cellSize / 2
                let y = upOffset + robot.y * (cellSize + gapBeetween) + cellSize / 2
                ctx.arc(x, y, radiusRobot, 0, 2 * Math.PI)
                ctx.closePath()
                ctx.fill()
            }
        }
    }, [level, cellSize, radiusRobot, leftOffset, upOffset, height, width])


    const drawSimulation = useCallback((ctx: CanvasRenderingContext2D, step: number, percentOfStep) => {
        if (!!level) {
            drawLevel(width, height, level, ctx, leftOffset, upOffset, cellSize, gapBeetween)
        }

        ctx.fillStyle = robotColor

        // count of robots should be constant between steps
        let currentStep = simulationSteps[step]
        let robotsCount = currentStep.robots.length
        let nextStep = simulationSteps[Math.min(step + 1, simulationSteps.length - 1)]

        for (let i = 0; i < robotsCount; i++) {
            ctx.fillStyle = robotColors[i % 4]
            ctx.beginPath()
            let cur_robot = currentStep.robots[i]
            let cur_x = leftOffset + cur_robot.x * (cellSize + gapBeetween) + cellSize / 2
            let cur_y = upOffset + cur_robot.y * (cellSize + gapBeetween) + cellSize / 2


            let next_robot = nextStep.robots[i]
            let next_x = leftOffset + next_robot.x * (cellSize + gapBeetween) + cellSize / 2
            let next_y = upOffset + next_robot.y * (cellSize + gapBeetween) + cellSize / 2

            ctx.arc(
                cur_x * (1 - percentOfStep) + next_x * percentOfStep,
                cur_y * (1 - percentOfStep) + next_y * percentOfStep,
                radiusRobot,
                0,
                2 * Math.PI
            )
            ctx.closePath()
            ctx.fill()
            
            ctx.fillStyle = '#AA00AA'
            if (cur_robot.sensors.right && (percentOfStep < 0.1 || next_robot.sensors.right)) {
                ctx.beginPath()
                ctx.arc(
                    cur_x * (1 - percentOfStep) + next_x * percentOfStep,
                    cur_y * (1 - percentOfStep) + next_y * percentOfStep,
                    radiusRobot,
                    - Math.PI / 4,
                    Math.PI / 4
                )
                ctx.closePath()
                ctx.fill()
            }
            if (cur_robot.sensors.down && (percentOfStep < 0.1 || next_robot.sensors.down)) {
                ctx.beginPath()
                ctx.arc(
                    cur_x * (1 - percentOfStep) + next_x * percentOfStep,
                    cur_y * (1 - percentOfStep) + next_y * percentOfStep,
                    radiusRobot,
                    Math.PI / 4,
                    3 * Math.PI / 4,
                )
                ctx.closePath()
                ctx.fill()
            }
            if (cur_robot.sensors.left && (percentOfStep < 0.1 || next_robot.sensors.left)) {
                ctx.beginPath()
                ctx.arc(
                    cur_x * (1 - percentOfStep) + next_x * percentOfStep,
                    cur_y * (1 - percentOfStep) + next_y * percentOfStep,
                    radiusRobot,
                    3 * Math.PI / 4,
                    5 * Math.PI / 4
                )
                ctx.closePath()
                ctx.fill()
            }
            if (cur_robot.sensors.up && (percentOfStep < 0.1 || next_robot.sensors.up)) {
                ctx.beginPath()
                ctx.arc(
                    cur_x * (1 - percentOfStep) + next_x * percentOfStep,
                    cur_y * (1 - percentOfStep) + next_y * percentOfStep,
                    radiusRobot,
                    5 * Math.PI / 4,
                    7 * Math.PI / 4
                )
                ctx.closePath()
                ctx.fill()
            }
        }
    }, [level, cellSize, radiusRobot, leftOffset, upOffset, simulationSteps, height, width])

    useEffect(() => {
        if (!!level) {
            setUpLevelGrid(level)
        }
    }, [level, setUpLevelGrid])

    useEffect(() => {
        setRunningSimulation(false)
        setSimulationSteps([])
        setSimulationWasRun(false)
        setRunRequestFailed(false)
        
        axios.get<ILevelDescription>(`/api/level/${levelId}`).then((response) => {
            setSpinning(false);
            if (!!response.data.level) {
                setLevel(response.data.level)
            } else {
                console.error(response.data.state, response.data.reason);
            }
        });
    }, [levelId])

    useEffect(() => {
        const canvas = canvasRef.current
        if (!!canvas) {
            const context = canvas.getContext('2d')
            if (!!context) {
                drawStatic(context)
            }
        }

    }, [canvasRef, drawStatic])

    useEffect(() => {
        let frameCount = 0
        let animationFrameId
        const canvas = canvasRef.current
        if (runningSimulation && !!canvas) {
            console.log('runningSimulation && !!canvas')
            const context = canvas.getContext('2d')

            if (!!context) {
                const render = () => {
                    frameCount++
                    let simulationStep = simulationFrameStart + Math.floor(frameCount / slowness[slownessLevel])
                    let percentOfStep = (frameCount % slowness[slownessLevel]) / slowness[slownessLevel]
                    if (simulationStep < simulationSteps.length) {
                        setSliderValue(simulationStep)
                        drawSimulation(context, simulationStep, percentOfStep)
                        animationFrameId = window.requestAnimationFrame(render)
                    } else {
                        setRunningSimulation(false)
                    }
                }
                render()
                return () => {
                    console.log(`cancelingAnimationFrame ${animationFrameId}`)
                    window.cancelAnimationFrame(animationFrameId)
                }
            }
        }
    }, [slownessLevel, drawSimulation, canvasRef, runningSimulation, simulationSteps, setSliderValue, simulationFrameStart, toggleSimulation])

    const runSimulation = useCallback((startStep) => {
        if (simulationWasRun && codeChanged === false && !runRequestFailed) {
            setSimulationFrameStart(startStep)
            setToggleSimulation(!toggleSimulation)
            window.scrollTo(0, 0)
            setRunningSimulation(true)
        } else {
            let request: IRunLevelRequest = { code, "level_id": levelId }
            console.log(request)
            setLoadingRun(true)
            axios.post<IRunDescription>("/api/level/run", request).then((response) => {
                setLoadingRun(false)
                console.log(response.data)
                setErrorReason(response.data.reason)
                setSimulationRunResult(response.data.result)
                if (response.data.state === RequestState.Error) {
                    setRunRequestFailed(true);
                } else {
                    setSimulationWasRun(true)
                    setRunRequestFailed(false);
                    if (!!response.data.steps) {    
                        setSimulationFrameStart(startStep)
                        setSimulationSteps(response.data.steps)
                        setSliderRange(response.data.steps.length - 1)
                        setRunningSimulation(true)
                        window.scrollTo(0, 0)
                    }
                }
                setCodeChanged(false)
            });
        }
    }, [simulationWasRun, code, levelId, codeChanged, runRequestFailed, toggleSimulation])

    const handleCodeChange = useCallback((value, _) => {
        setCode(value)
        localStorage.setItem('code', value)
        setCodeChanged(true)
    }, [])

    const clickSlider = useCallback(debounce((value) => {
        setSliderValue(value)
        runSimulation(value)
    }, 300), [setSliderValue, runSimulation])

    return (
        <div className='container-row'>
            <div className='container-column'>
                <Slider value={sliderValue} disabled={!simulationSteps} max={sliderRange} onChange={clickSlider} tooltipVisible={false}/>
                <Spin tip="Loading..." spinning={spinning}>
                    <canvas
                        ref={canvasRef}
                        height={height}
                        width={width}
                    />
                </Spin>
            </div>
            <div className='container-column'>
                <Spin tip="Editor loading..." spinning={!editorLoaded}>
                    <AceEditor
                        value={code}
                        placeholder="Ваш python код здесь"
                        mode="python"
                        theme="solarized_dark"
                        name="blah2"
                        onLoad={() => setEditorLoaded(true)}
                        onChange={handleCodeChange}
                        fontSize={16}
                        showPrintMargin={true}
                        showGutter={true}
                        highlightActiveLine={true}
                        setOptions={{
                            enableBasicAutocompletion: true,
                            enableLiveAutocompletion: true,
                            enableSnippets: false,
                            showLineNumbers: true,
                            tabSize: 2,
                        }}
                        wrapEnabled={true}
                        width={`${editorWidth}px`}
                        height={`${editorHeight}px`}
                    />
                </Spin>
                <br />
                <Spin spinning={loadingRun}>
                    <Button
                        type="primary"
                        htmlType="submit"
                        shape="round"
                        size="large"
                        onClick={(event) => runSimulation(0)}
                        disabled={code === ""}
                    >
                        {
                            (simulationWasRun && codeChanged === false && !runRequestFailed)
                                ? "Рестарт"
                                : "Старт"
                        }
                    </Button>
                    {runRequestFailed && !!errorReason &&
                        <>
                            <br />
                            <Card title="Ошибка">
                                <p>{errorReason}</p>
                            </Card>
                        </>
                    }
                    {!runRequestFailed && (simulationRunResult === SimulationRunResult.Win) &&
                        <Progress percent={100} size="small" />
                    }
                    {!runRequestFailed && (simulationRunResult === SimulationRunResult.Lose) &&
                        <Progress percent={70} size="small" status="exception" />
                    }
                </Spin>
            </div>
        </div>
    );
}


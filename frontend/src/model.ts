enum RequestState {
    Error = "error",
    Success = "success"
}

interface Point {
    x: number,
    y: number
}

interface ILevel {
    width: number,
    height: number,
    robots: Array<Point>,
    awards: Array<Point>
}

interface ILevelDescription {
    state: RequestState,
    level?: ILevel,
    reason?: string
}

interface IRunLevelRequest {
    level_id: number,
    code: string
}

interface ISensors {
    up: boolean,
    down: boolean,
    left: boolean,
    right: boolean
}


interface IRobot {
    x: number,
    y: number,
    sensors: ISensors
}

interface ISimulationStep {
    robots: IRobot[]
}

enum SimulationRunResult {
    Win = "win",
    Lose = "lose"
}

interface IRunDescription {
    state: RequestState,
    steps?: ISimulationStep[],
    result?: SimulationRunResult,
    reason?: string
}

export type {
    IRunDescription,
    ISimulationStep,
    IRunLevelRequest,
    ILevelDescription,
    ILevel
};

export {
    SimulationRunResult,
    RequestState,
}
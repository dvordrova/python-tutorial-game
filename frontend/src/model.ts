enum IState {
    Error = "error",
    Success = "success"
}

interface Point {
    x: number,
    y: number
}

export interface ILevel {
    width: number,
    height: number,
    robots: Array<Point>,
    awards: Array<Point>
}

export interface ILevelDescription {
    state: IState,
    level?: ILevel,
    reason?: string
}
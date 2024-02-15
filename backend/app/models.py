from enum import Enum
from typing import List, Optional

from pydantic import BaseModel



class State(str, Enum):
    error = 'error'
    success = 'success'

class Point(BaseModel):
    x: int
    y: int

class Level(BaseModel):
    id: int
    width: int
    height: int
    robots: List[Point]
    awards: List[Point]

class GetLevelsInfoResponse(BaseModel):
    count: int

class GetLevelResponse(BaseModel):
    state: State
    level:Optional[Level]
    reason: Optional[str]

class RunLevelRequest(BaseModel):
    level_id: int
    code: str

class RunResult(str, Enum):
    win = 'win'
    lose = 'lose'

class Sensors(BaseModel):
    up: bool
    down: bool
    left: bool
    right: bool

class Robot(BaseModel):
    x: int
    y: int
    sensors: Sensors

class Step(BaseModel):
    robots: List[Robot]
    number: int

class RunLevelResponse(BaseModel):
    state: State
    steps: Optional[List[Step]]
    result: Optional[RunResult]
    reason: Optional[str]

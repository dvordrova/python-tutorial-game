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
    width: int
    height: int
    robots: List[Point]
    awards: List[Point]

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

class Step(BaseModel):
    robots: List[Point]
    number: int

class RunLevelResponse(BaseModel):
    state: State
    steps: Optional[List[Step]]
    result: Optional[RunResult]
    reason: Optional[str]

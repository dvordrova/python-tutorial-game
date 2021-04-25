import time

from fastapi import FastAPI

from app.levels import levels
from app.models import Level, GetLevelResponse, RunLevelRequest, RunLevelResponse
from app.award import Award
from app.field import Field
from app.robot import Robot, NO_MOVEMENT

from icecream import ic

app = FastAPI()


@app.get("/api/level/{level_id}", response_model=GetLevelResponse)
async def get_level(level_id: int):
    time.sleep(0.2)
    if level_id in levels:
        return {
            'state': 'success',
            'level': levels[level_id]
        }
    else:
        return {
            'state': 'error',
            'reason': 'level not found'
        }

@app.post("/api/level/run", response_model=RunLevelResponse)
async def run_level(request: RunLevelRequest):
    level = levels.get(request.level_id)
    if not level:
        return {
            'state': 'error',
            'reason': 'level not found'
        }
    level = Level(**level)
    
    field=Field(
        width=level.width,
        height=level.height,
        robots=[
            Robot(x=r.x, y=r.y, velocity=NO_MOVEMENT, prepared_user_code=request.code)
            for r in level.robots
        ],
        awards=[
            Award(5, 1) for r in level.awards
        ]
    )
    steps = [
        {
            'number': 0,
            'robots': [{'x': robot.x, 'y': robot.y} for robot in level.robots]
        }
    ]
    try:
        while field.can_do_steps:
            ic(field.steps, field)
            field.make_step()

            step_record = {
                'number': field.steps,
                'robots': [
                    {'x': robot.x, 'y': robot.y}
                    for robot in field.robots
                ]
            }
            steps.append(step_record)

    except Exception as e:
        return {
            'state': 'error',
            'reason': str(e)
        }
    return {
        'state': 'success',
        'result': field.result,
        'steps': steps
    }

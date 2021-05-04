from fastapi import FastAPI

from app.levels import levels
from app.models import Level, GetLevelResponse, RunLevelRequest, RunLevelResponse, GetLevelsInfoResponse
from app.award import Award
from app.field import Field
from app.robot import Robot, NO_MOVEMENT
from app.utils import validate
from copy import copy

MAX_LENGTH_OF_SOURCE_CODE = 1000

app = FastAPI()


@app.get("/api/levels", response_model=GetLevelsInfoResponse)
async def get_levels_info():
    return {
        'count': len(levels)
    }


@app.get("/api/level/{level_id}", response_model=GetLevelResponse)
async def get_level(level_id: int):
    if level_id < len(levels):
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
    if len(request.code) > MAX_LENGTH_OF_SOURCE_CODE:
        # TODO
        pass
    if request.level_id >= len(levels):
        return {
            'state': 'error',
            'reason': 'level not found'
        }
    level = Level(**levels[request.level_id])

    validate_result = validate(request.code)
    if not validate_result['ok']:
        return {
            'state': 'error',
            'reason': validate_result['reason']
        }

    
    field=Field(
        width=level.width,
        height=level.height,
        robots=[
            Robot(x=r.x, y=r.y, velocity=NO_MOVEMENT)
            for r in level.robots
        ],
        awards=[
            Award(r.x, r.y) for r in level.awards
        ],
        prepared_user_code=request.code
    )
    steps = [
        {
            'number': 0,
            'robots': [
                {'x': robot.x, 'y': robot.y}
                for robot in level.robots]
        }
    ]
    try:
        while field.can_do_steps:
            field.fill_sensors()
            for i, robot in enumerate(field.robots):
                steps[-1]['robots'][i]['sensors'] = copy(robot.sensors)
            field.make_step()

            step_record = {
                'number': field.steps,
                'robots': [{'x': robot.x, 'y': robot.y} for robot in field.robots]
            }
            steps.append(step_record)
    
        for i, robot in enumerate(field.robots):
            steps[-1]['robots'][i]['sensors'] = copy(robot.sensors)

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

from dataclasses import dataclass
from typing import List

from icecream import ic

from app.award import Award
from app.robot import Robot

@dataclass(repr=False)
class Field:
    robots: List[Robot]
    awards: List[Award]
    width: int = 5
    height: int = 5

    steps: int = 0
    max_steps: int = 10
    state: str = 'run'

    @property
    def can_do_steps(self):
        return self.state == 'run' and self.steps < self.max_steps and \
            any(robot.movable for robot in self.robots)
    
    def _check_robot(self, robot: Robot):
        ic(robot)
        if robot.x < 0 or robot.x >= self.width or \
            robot.y < 0 or robot.y >= self.height:
            robot.make_step_back()
            return
        for other_robot in self.robots:
            if robot.collides(other_robot):
                robot.make_step_back()
                return
        remained_awards = []
        for award in self.awards:
            if award.x == robot.x and award.y == robot.y:
                robot.movable = False
            else:
                remained_awards.append(award)
        self.awards = remained_awards
    
    def _feel_sensors(self, robot: Robot):
        robot.sensors['up'] = robot.y == 0
        robot.sensors['right'] = robot.x == self.width - 1
        robot.sensors['down'] = robot.y == self.height - 1
        robot.sensors['left'] = robot.x == 0

        for other_robot in self.robots:
            if other_robot == (robot.x - 1, robot.y):
                robot.sensors['left'] = True
            if other_robot == (robot.x + 1, robot.y):
                robot.sensors['right'] = True
            if other_robot == (robot.x, robot.y - 1):
                robot.sensors['up'] = True
            if other_robot == (robot.x, robot.y + 1):
                robot.sensors['down'] = True


    def make_step(self):
        for robot in self.robots:
            self._feel_sensors(robot)
            robot.make_step(self.steps)
            self._check_robot(robot)
        self.steps += 1
    
    def __repr__(self):
        res = ''
        for y in range(self.height):
            for x in range(self.width):
                if any(robot == (x, y) for robot in self.robots):
                    res += 'R'
                elif any(a.x == x and a.y == y for a in self.awards):
                    res += 'A'
                else:
                    res += '‧'
            res += '\n'
        return res
    
    @property
    def result(self):
        if self.awards:
            return 'lose'
        else:
            return 'win'

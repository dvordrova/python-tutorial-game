from dataclasses import dataclass, field
from typing import List


from app.award import Award
from app.robot import Robot, MOVEMENTS

@dataclass(repr=False)
class Field:
    robots: List[Robot]
    awards: List[Award]
    width: int = 5
    height: int = 5

    steps: int = 0
    max_steps: int = 500
    state: str = 'run'

    prepared_user_code: str = field(default='None', repr=False)
    help_code: str = field(default='\nrobot.velocity = velocity', repr=False)

    count_of_no_movements_cycles: int = 0
    max_count_of_no_movements_cycles: int = 5

    @property
    def can_do_steps(self):
        return self.state == 'run' and self.steps < self.max_steps and \
            self.count_of_no_movements_cycles < self.max_count_of_no_movements_cycles and \
            any(robot.movable for robot in self.robots)
    
    def _check_robot(self, robot: Robot):
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
        if not self.awards:
            self.state = 'stop'
    
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

    def fill_sensors(self):
        for robot in self.robots:
            self._feel_sensors(robot)

    def make_step(self):
        was_movements = False
        for robot in self.robots:
            exec(
                self.prepared_user_code + self.help_code,
                {},
                {'robot': robot, 'step': self.steps, 'velocity': robot.velocity, **MOVEMENTS}
            )
            robot.make_step(self.steps)
            self._check_robot(robot)
            if robot.x != robot.prev_x or robot.y != robot.prev_y:
                was_movements = True
        if not was_movements:
            self.count_of_no_movements_cycles += 1
        self.steps += 1
    
    @property
    def result(self):
        if self.awards:
            return 'lose'
        else:
            return 'win'

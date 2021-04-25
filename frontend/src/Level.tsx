import React, { useEffect, useRef, useState } from 'react';
import 'antd/dist/antd.css';
import './App.css';
import { Row, Col, Form, Input, Button, Spin } from 'antd';
import axios from 'axios';

import {
    useParams
} from "react-router-dom";
import { ILevel, ILevelDescription } from './model';

export default function Level(props) {
    const { id: levelId } = useParams();

    const [level, setLevel] = useState<ILevel>()
    const [spinning, setSpinning] = useState(true)

    axios.get<ILevelDescription>(`/api/level/${levelId}`).then((response) => {
        setSpinning(false);
        if (!!response.data.level) {
            setLevel(response.data.level)
        } else {
            console.log(response.data.state, response.data.reason);
        }
    })

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [height, setHeight] = useState(window.innerHeight);
    const [width, setWidth] = useState(window.innerWidth * (3 / 5));

    const draw = (ctx: CanvasRenderingContext2D) => {
        let cellColor = '#380606'
        let awardColor = '#fffc42'
        let robotColor = '#42a8c2'
        if (!!level) {
            const cellSize = 50
            const radiusRobot = 15
            const leftOffset = 50
            const upOffset = 50
            ctx.fillStyle = cellColor
            ctx.beginPath()
            for (let x = 0; x < level.width; x++) {
                for (let y = 0; y < level.height; y++) {
                    ctx.rect(leftOffset + x * (cellSize + 1), upOffset + y * (cellSize + 1), cellSize, cellSize)
                }
            }
            ctx.fill()

            ctx.beginPath()
            ctx.fillStyle = awardColor
            for (let i = 0; i < level.awards.length; i++) {
                let award = level.awards[i]
                let x = leftOffset + award.x * (cellSize + 1) + cellSize / 2
                let y = upOffset + award.y * (cellSize + 1) + cellSize / 2
                ctx.arc(x, y, radiusRobot, 0, 3 * 3.14)
            }
            ctx.fill()

            ctx.beginPath()
            ctx.fillStyle = robotColor
            for (let i = 0; i < level.robots.length; i++) {
                let robot = level.robots[i]
                let x = leftOffset + robot.x * (cellSize + 1) + cellSize / 2
                let y = upOffset + robot.y * (cellSize + 1) + cellSize / 2
                ctx.arc(x, y, radiusRobot, 0, 3 * 3.14)
            }
            ctx.fill()
        }
    }

    useEffect(() => {
        const canvas = canvasRef.current
        let frameCount = 0
        let animationFrameId
        if (!!canvas) {
            const context = canvas.getContext('2d')

            if (!!context) {
                const render = () => {
                    frameCount++
                    draw(context)
                    animationFrameId = window.requestAnimationFrame(render)
                }
                render()
            }
        }
    }, [draw, canvasRef])

    const layout = {
        labelCol: { span: 8 },
        wrapperCol: { span: 16 },
    };

    return (
        <Spin tip="Loading..." spinning={spinning}>
            <Row>
                <Col flex={3}>
                    <canvas
                        ref={canvasRef}
                        height={height}
                        width={width}
                    />
                </Col>
                <Col flex={2}>
                    <Form {...layout} name="nest-messages">
                        <Form.Item name={['user', 'introduction']} label="Код">
                            <Input.TextArea />
                        </Form.Item>
                        <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 8 }}>
                            <Button type="primary" htmlType="submit">
                                Старт
                            </Button>
                        </Form.Item>
                    </Form>
                </Col>
            </Row>
        </Spin>
    );
}
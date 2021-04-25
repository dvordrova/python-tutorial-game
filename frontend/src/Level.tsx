import React, { useEffect, useRef, useState } from 'react';
import 'antd/dist/antd.css';
import './App.css';
import { Row, Col, Form, Input, Button } from 'antd';
import axios from 'axios';

import {
    useParams
  } from "react-router-dom";

export default function Level(props) {
    const { id: levelId } = useParams();

    console.log(axios.get(`http://localhost:8080/level/${levelId}`));

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [height, setHeight] = useState(window.innerHeight);
    const [width, setWidth] = useState(window.innerWidth * (3 / 5));
  
    const draw = (ctx: any) => {
      ctx.fillStyle = '#000000'
      ctx.beginPath()
      ctx.arc(50, 100, 20, 0, 2 * Math.PI)
      ctx.fill()
    }
  
    useEffect(() => {
      const canvas = canvasRef.current
      if (!!canvas) {
        const context = canvas.getContext('2d')
  
        //Our draw come here
        draw(context)
      }
    }, [draw, canvasRef])
  
    const layout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
    };
  
    return (
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
            <Form.Item name={['user', 'introduction']} label="Introduction">
              <Input.TextArea />
            </Form.Item>
            <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 8 }}>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Form.Item>
          </Form>
        </Col>
      </Row>
    );
}
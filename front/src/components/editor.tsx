import React, { useState, useCallback, useEffect } from "react";
import AceEditor from "react-ace";

import { debounce } from "lodash";
import { Spin } from "antd";
import { getEditorWidth, getEditorHeight } from "../utils/sizes";

import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/theme-github_dark";

interface EdirotProps {
  code: string;
  setCode: (value: string) => void;
}

export default function Editor({ code, setCode }: EdirotProps) {
  const [height, setHeight] = useState<number>(
    getEditorHeight(window.innerHeight),
  );
  const [width, setWidth] = useState<number>(getEditorWidth(window.innerWidth));
  const [editorLoaded, setEditorLoaded] = useState(false);

  const updateSize = debounce(() => {
    setWidth(getEditorWidth(window.innerWidth));
    setHeight(getEditorHeight(window.innerHeight));
  }, 300);

  const handleCodeChange = useCallback(
    (value: string, _: any) => {
      setCode(value);
    },
    [setCode],
  );

  useEffect(() => {
    console.log("updateSize editor", updateSize);
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [updateSize]);

  return (
    <>
      <Spin tip="Editor loading..." spinning={!editorLoaded}>
        <AceEditor
          value={code}
          placeholder="Ваш python код здесь"
          mode="python"
          theme="github_dark"
          name="blah2"
          onLoad={() => setEditorLoaded(true)}
          onChange={handleCodeChange}
          fontSize={16}
          showPrintMargin={true}
          showGutter={true}
          highlightActiveLine={true}
          setOptions={{
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
            enableSnippets: false,
            showLineNumbers: true,
            tabSize: 2,
          }}
          wrapEnabled={true}
          width={`${width}px`}
          height={`${height}px`}
          style={{ lineHeight: "2.0" }}
        />
      </Spin>
    </>
  );
}

// App.tsx
import React, { useEffect, useRef, useState } from "react";
import "./styles.css";
import Timeline from "./components/Timeline";
import PreviewWindow from "./components/PreviewWindow";
import TextEditor from "./components/TextEditor";
import Resizable from "./components/Resizer";

import { obj_text, obj_rect, obj_time } from "./components/objects";
interface BaseObject {
    length: Function;
    text: Function;
    textcolor: Function;
    color: Function;
    getframe: Function;
}
const App: React.FC = () => {
    const [currentFrame, setCurrentFrame] = useState(0); // 再生位置の状態を追加
    const [isPlaying, setIsPlaying] = useState(false);
    const VideoFPS = 30;
    const frameRef = useRef(null); // currentFrame の更新を制御するために useRef を使用

    useEffect(() => {
        const togglePlay = (event) => {
            if (event.code === "Space") {
                event.preventDefault();
                setIsPlaying((prev) => !prev);
            }
        };

        window.addEventListener("keydown", togglePlay);
        return () => {
            window.removeEventListener("keydown", togglePlay);
        };
    });
    useEffect(() => {
        if (isPlaying) {
            frameRef.current = setInterval(() => {
                setCurrentFrame((prevFrame) => prevFrame + 1);
            }, 1000 / VideoFPS);
        } else {
            clearInterval(frameRef.current);
        }

        return () => clearInterval(frameRef.current);
    }, [isPlaying]);
    var timeline: [BaseObject, ...(number | string)[]][] = [
        [obj_rect, 10, 1, 30, 800, 300, "#ff5"],
        [obj_rect, 100, 100, 30, 800, 300, "#ff5"],
        [obj_text, 0, 120, "HELLO!!", 50, 900, 200, 50, 50],
        [obj_rect, 120, 100, 90, 500, 700, "#f06"],
        [obj_time, 80, 1000, 30, 500, 100, "#f06"],
        [obj_text, 10, 1000, "Neknaj Video Generator", 300, 600, 100, 50, 50],
        [obj_text, 30, 300, "bem130", 1400, 600, 70, 50, 50],
        [obj_text, 30, 300, "bem130", 1400, 600, 70, 50, 50],
        [obj_text, 30, 300, "bem130", 1400, 600, 70, 50, 50],
        [obj_text, 30, 300, "bem130", 1400, 600, 70, 50, 50],
        [obj_text, 30, 300, "bem130", 1400, 600, 70, 50, 50],
        [obj_text, 30, 300, "bem130", 1400, 600, 70, 50, 50],
    ];

    return (
        <div className="App w-full h-dvh flex flex-col">
            <Resizable orientation="vertical">
                {[
                    // 最初の子要素としての関数
                    (size) => (
                        <div className="flex w-full">
                            <Resizable orientation="horizontal">
                                {[
                                    // 内側の Resizable の最初の子要素
                                    (innerSize) => (
                                        <div id="imgOutArea" className="w-full">
                                            <PreviewWindow
                                                timeline={timeline}
                                                currentFrame={currentFrame}
                                                size={[size, innerSize]}
                                            />
                                        </div>
                                    ),
                                    // 内側の Resizable の二番目の子要素
                                    <TextEditor />, // 直接Reactエレメントを渡す場合、この部分は関数でラップする必要があるかもしれません
                                ]}
                            </Resizable>
                        </div>
                    ),
                    // 二番目の子要素としての関数
                    <div className="w-full">
                        <Timeline
                            timeline={timeline}
                            isPlaying={isPlaying}
                            currentFrame={currentFrame}
                            setCurrentFrame={setCurrentFrame}
                        />
                    </div>,
                ]}
            </Resizable>
        </div>
    );
};

export default App;

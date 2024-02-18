import React, { useState, useCallback, ReactNode } from "react";

interface ResizableProps {
    orientation: "horizontal" | "vertical";
    children: ReactNode | [ReactNode, ReactNode]; // ReactNode は関数コンポーネントまたは JSX エレメントを含む
    onResize: (size: number) => void | undefined;
}

const Resizable: React.FC<ResizableProps> = ({ orientation, children, onResize }) => {
    const [size, setSize] = useState(50); // パーセンテージで初期サイズを設定

    const startResize = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            e.preventDefault();
            // マウスダウン時の座標
            const startX = e.clientX;
            const startY = e.clientY;
            const startSize = size;

            const doResize = (moveEvent: MouseEvent) => {
                let newSize;
                if (orientation === "horizontal") {
                    const dx = moveEvent.clientX - startX;
                    const percentX = (dx / window.innerWidth) * 100;
                    newSize = Math.min(100, Math.max(0, startSize + percentX));
                } else {
                    const dy = moveEvent.clientY - startY;
                    const percentY = (dy / window.innerHeight) * 100;
                    newSize = Math.min(100, Math.max(0, startSize + percentY));
                }
                setSize(newSize);
                onResize(newSize);
            };

            const stopResize = () => {
                document.removeEventListener("mousemove", doResize);
                document.removeEventListener("mouseup", stopResize);
            };

            document.addEventListener("mousemove", doResize);
            document.addEventListener("mouseup", stopResize);
        },
        [size, orientation]
    );

    return (
        <div
            className={`h-full flex ${
                orientation === "horizontal" ? "flex-row w-full" : "flex-col h-full"
            }`}
        >
            <div className="flex-grow" style={{ flexBasis: `${size}%` }}>
                {children[0]}
            </div>
            <div
                className={`bg-gray-500 ${
                    orientation === "horizontal" ? "cursor-e-resize" : "cursor-ns-resize"
                }`}
                onMouseDown={startResize}
                style={{
                    width: orientation === "horizontal" ? "4px" : "100%",
                    height: orientation === "vertical" ? "4px" : "100%",
                }}
            ></div>
            <div className="flex-grow" style={{ flexBasis: `${100 - size}%` }}>
                {children[1]}
            </div>
        </div>
    );
};

export default Resizable;

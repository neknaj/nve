import { useRef } from "react";

const renderPlaybackBar = ({ isPlaying, currentFrame, setCurrentFrame, TimelineXScale, Ref }) => {
    const dragRef = useRef(null);
    const scrollOffset = Ref.current ? Ref.current.scrollLeft : 0;
    const playbackBarStyle = {
        position: "sticky",
        top: 0,
        height: "100%",
        width: "2px",
        backgroundColor: "red",
        zIndex: 15,
        left: `${currentFrame * TimelineXScale - scrollOffset}px`,
    } as React.CSSProperties;

    const handleMouseMove = (event) => {
        if (dragRef.current.isDragging) {
            const dx = event.clientX - dragRef.current.start;
            // スクロールオフセットとスケールを考慮して currentFrame を更新
            const newFrame = currentFrame + Math.floor(dx / TimelineXScale);
            setCurrentFrame(Math.max(0, newFrame)); // currentFrame を 0 以下にはしない
        }
    }; // マウスアップイベントをハンドルする関数
    const handleMouseUp = () => {
        dragRef.current.isDragging = false;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
    };
    const handleMouseDown = (event) => {
        if (!isPlaying) {
            dragRef.current.isDragging = true;
            dragRef.current.start = event.clientX;
            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
        }
    }; // マウスムーブイベントをハンドルする関数

    return (
        <div
            style={playbackBarStyle}
            onMouseDown={handleMouseDown}
            className="cursor-e-resize"
        ></div>
    );
};
export default renderPlaybackBar;

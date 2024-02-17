// components/Timeline.tsx
import React, { useState, useEffect, useRef } from "react";
import TimelineObject from "./TimelineObject";
const Timeline = ({ timeline, isPlaying, currentFrame, setCurrentFrame }) => {
    const [timelineObjects, setTimelineObjects] = useState([]);
    const [lastObjFrame, setLastObjFrame] = useState(0);
    const [TLcache, setTLcache] = useState([]);
    const [exportRange, setExportRange] = useState({ start: 0, end: 0 });
    const [TimelineXScale, setTimelineXScale] = useState(1);
    const [TimelineYScale, setTimelineYScale] = useState(1);
    const [TimelineXoffset, setTimelineXoffset] = useState(0);
    const [TimelineYoffset, setTimelineYoffset] = useState(0);

    const [TimelineScale, setTimelineScale] = useState([0, 0]);
    const Ref = useRef(null);
    const dragRef = useRef({ isDragging: false, start: 0 });

    useEffect(() => {
        makeTLObjects(); // コンポーネントがマウントされた後にタイムラインオブジェクトを生成
    }, [timeline]); // timeline が変更された場合に再生成
    useEffect(() => {
        // スクロールイベントリスナーを追加
        Ref.current.addEventListener("scroll", handleScroll);
        Ref.current?.addEventListener("wheel", handleWheel, { passive: false });

        return () => {
            if (Ref.current) {
                Ref.current.removeEventListener("wheel", handleWheel, { passive: false });
                Ref.current.removeEventListener("scroll", handleScroll);
            }
        };
    });

    const handleScroll = () => {
        // スクロール位置に基づいて背景位置を調整
        const scrollLeft = Ref.current ? Ref.current.scrollLeft : 0;
        const scrollTop = Ref.current ? Ref.current.scrollTop : 0;
        setTimelineXoffset(scrollLeft);
        setTimelineYoffset(scrollTop);
    };
    const handleMouseDown = (event) => {
        if (!isPlaying) {
            dragRef.current.isDragging = true;
            dragRef.current.start = event.clientX;
            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
        }
    }; // マウスムーブイベントをハンドルする関数
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
    // searchLayer 関数
    const searchLayer = (obj, timeLineTmp, lastObjFrame, TLTs) => {
        let layer = 0;
        while (layer < TLTs) {
            let flag = true;
            for (let x = 0; x < obj.len; x++) {
                if (timeLineTmp[(lastObjFrame + 1) * layer + obj.start + x] !== 0) {
                    flag = false;
                    break;
                }
            }
            if (flag) {
                return layer;
            }
            layer++;
        }
        return false; // 適切なレイヤーが見つからない場合
    };

    // setObj 関数
    const setObj = (obj, layer, id, timeLineTmp, lastObjFrame, TLTs) => {
        for (let x = 0; x < obj.len; x++) {
            timeLineTmp[(lastObjFrame + 1) * layer + obj.start + x] = id + 1;
        }
    };

    const makeTLObjects = () => {
        // オブジェクト生成ロジック
        let newTimelineObjects = [];
        let newLastObjFrame = 0;
        let TLTs = 10; // ここで TLTs を適切な値に設定します（レイヤーの最大数）

        // timeline データを処理してオブジェクトを生成
        timeline.forEach((objData, index) => {
            const objlen = objData[0].length(...objData.slice(2)); // ここで objData[0] はオブジェクトの長さを計算する関数を指します
            const obj = {
                func: objData[0], // オブジェクトの関数
                start: objData[1], // 開始フレーム
                end: objData[1] + objlen - 1, // 終了フレーム
                len: objlen, // オブジェクトの長さ
                args: objData.slice(2), // 関数の引数
                layer: 0, // レイヤー番号（後で更新）
                id: index, // オブジェクトのID
            };

            if (obj.end > newLastObjFrame) {
                newLastObjFrame = obj.end;
            }

            newTimelineObjects.push(obj);
        });

        // タイムラインテンポラリ配列のサイズを調整
        let timeLineTmp = new Uint8Array((newLastObjFrame + 1) * TLTs).fill(0);

        // レイヤーを検索し、オブジェクトを配置
        newTimelineObjects = newTimelineObjects.map((obj, id) => {
            const layer = searchLayer(obj, timeLineTmp, newLastObjFrame, TLTs);
            if (layer !== false) {
                setObj(obj, layer, id, timeLineTmp, newLastObjFrame, TLTs);
                return { ...obj, layer };
            }
            return obj;
        });

        // 状態を更新
        setTimelineObjects(newTimelineObjects);
        setLastObjFrame(newLastObjFrame);
        setTLcache(new Array(newLastObjFrame).fill(null));
        setExportRange({ ...exportRange, end: newLastObjFrame });
    };

    function handleWheel(e) {
        // X軸のスケール変更（Ctrlキーを押しながらホイール操作）
        if (e.ctrlKey && !e.shiftKey) {
            e.preventDefault(); // デフォルトのスクロール動作をキャンセル
            // ホイールの方向に応じてスケール値を調整
            if (e.deltaY > 0) {
                TimelineScale[0]++;
            } else {
                TimelineScale[0]--;
            }
            // スケール値の範囲を制限
            if (TimelineScale[0] > 20) {
                TimelineScale[0] = 20;
            } else if (TimelineScale[0] < -20) {
                TimelineScale[0] = -20;
            }
            // CSS変数を更新してスケールを適用
            setTimelineXScale(0.8 ** TimelineScale[0]);
            setTimelineYScale(0.9 ** TimelineScale[1]);
        }
        // Y軸のスケール変更（CtrlキーとShiftキーを押しながらホイール操作）
        else if (e.ctrlKey && e.shiftKey) {
            e.preventDefault(); // デフォルトのスクロール動作をキャンセル
            // ホイールの方向に応じてスケール値を調整
            if (e.deltaY > 0) {
                TimelineScale[1]++;
            } else {
                TimelineScale[1]--;
            }
            // スケール値の範囲を制限
            if (TimelineScale[1] > 10) {
                TimelineScale[1] = 10;
            } else if (TimelineScale[1] < -10) {
                TimelineScale[1] = -10;
            }
            // CSS変数を更新してスケールを適用
            setTimelineXScale(0.8 ** TimelineScale[0]);
            setTimelineYScale(0.9 ** TimelineScale[1]);
        }
        // その他のホイール操作は無視
    }
    const renderPlaybackBar = () => {
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
        return (
            <div
                style={playbackBarStyle}
                onMouseDown={handleMouseDown}
                className="cursor-e-resize"
            ></div>
        );
    };

    const style = {
        "--tl-x-scale": TimelineXScale,
        "--tl-y-scale": TimelineYScale,
        "--tl-x-offset": -TimelineXoffset + "px",
        "--tl-y-offset": -TimelineYoffset + "px",
    } as React.CSSProperties;
    return (
        <>
            <div className="w-full h-6 bg-blue-300">✅{currentFrame}</div>
            <div id="timeline" className="h-full overflow-x-scroll" ref={Ref} style={style}>
                {renderPlaybackBar()}
                <div id="timelineObjects">
                    {timelineObjects.map((obj, index) => (
                        <TimelineObject key={index} obj={obj} />
                    ))}
                </div>
            </div>
        </>
    );
};

export default Timeline;

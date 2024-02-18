import { useEffect, useRef } from "react";
const PreviewWindow = ({ timeline, currentFrame, size }) => {
    console.log("frame:" + currentFrame, timeline);
    const imgOutRef = useRef(null);
    const timelineRef = useRef(null);

    //サイズが変更されたときのリサイズ
    useEffect(() => {
        const resize = () => {
            let imgOutArea = document.getElementById("imgOutArea");
            // videoConfig から幅と高さを取得
            const { height: dh, width: dw } = videoConfig;
            let rw = 0,
                rh = 0;
            const parent = imgOutArea.getBoundingClientRect();
            const ww = parent.width;
            const wh = parent.height;
            let csc = 1;
            const hcsc = ww / dw;
            const wcsc = wh / dh;

            if (hcsc > wcsc) {
                csc = wcsc;
                rw = (ww - dw * csc) / 2;
            } else {
                csc = hcsc;
                rh = (wh - dh * csc) / 2;
            }

            // 直接スタイルを更新
            const imgOutEl = imgOutRef.current;
            imgOutEl.height = `${dh}`;
            imgOutEl.width = `${dw}`;
            imgOutEl.style.marginTop = `${rh}px`;
            imgOutEl.style.marginBottom = `${rh}px`;
            imgOutEl.style.marginLeft = `${rw}px`;
            imgOutEl.style.marginRight = `${rw}px`;
            imgOutEl.style.transform = `scale(${csc},${csc})`;

            // Timeline スタイルの更新
            const timelineEl = timelineRef.current;
            if (timelineEl) {
                timelineEl.style.setProperty(
                    "--tl-timebar-height",
                    `${Math.max(timelineEl.getBoundingClientRect().height - 13)}px`
                );
            }
        };

        // イベントリスナーを設定
        window.addEventListener("resize", resize);

        // 最初のリサイズをトリガー
        resize();

        // クリーンアップ関数
        return () => {
            window.removeEventListener("resize", resize);
        };
    }, [size]);

    // ビデオ設定の変数
    let videoConfig = {
        height: 1080, // ビデオの高さ
        width: 1920, // ビデオの幅
    };
    return <canvas id="imgOut" ref={imgOutRef}></canvas>;
};
export default PreviewWindow;

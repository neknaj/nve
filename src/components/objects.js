
// テキストオブジェクトの定義
var obj_text = {
    length: (l, t, x, y, s, fin, fout) => { return l; }, // オブジェクトの表示長さ
    text: (l, t, x, y, s, fin, fout) => { return "text: " + t; }, // 表示するテキスト
    textcolor: (l, t, x, y, s, fin, fout) => { return "#000"; }, // テキストの色
    color: (l, t, x, y, s, fin, fout) => { return "#ff5575"; }, // オブジェクトの背景色
    // フレームごとの描画処理。キャンバスにテキストを描画し、イメージオブジェクトとして返す。
    getframe: async (af, rf, len, l, t, x, y, s, fin, fout) => {
        let co = document.createElement("canvas");
        co.height = 1080;
        co.width = 1920;
        let ctx = co.getContext("2d");
        // フェードイン・アウトの透明度調整
        if (rf < fin) {
            ctx.globalAlpha = linerinterpolation(rf / fin, 0, 1);
        }
        if (rf >= len - fout) {
            ctx.globalAlpha = linerinterpolation((len - rf - 1) / fout, 0, 1);
        }
        ctx.font = `${s}px serif`; // フォントサイズとスタイル設定
        ctx.fillStyle = "white"; // テキストの色
        ctx.fillText(t, x, y); // テキスト描画
        return await canvas2image(co); // キャンバスをイメージオブジェクトに変換
    },
};

// 四角形オブジェクトの定義
var obj_rect = {
    length: (l, x, y, w, h, c) => { return l; },
    text: (l, x, y, w, h, c) => { return "rect"; },
    textcolor: (l, x, y, w, h, c) => { return "#000"; },
    color: (l, x, y, w, h, c) => { return "#88ff55"; },
    // フレームごとの描画処理。キャンバスに四角形を描画し、イメージオブジェクトとして返す。
    getframe: async (af, rf, len, x, y, w, h, c) => {
        let co = document.createElement("canvas");
        co.height = 1080;
        co.width = 1920;
        let ctx = co.getContext("2d");
        ctx.fillStyle = c; // 四角形の色
        ctx.strokeStyle = c;
        ctx.rect(x, y, w, h); // 四角形描画
        ctx.fill();
        ctx.stroke();
        return await canvas2image(co); // キャンバスをイメージオブジェクトに変換
    },
};

// 時間表示オブジェクトの定義
var obj_time = {
    length: (l, x, y, s) => { return l; },
    text: (l, x, y, s) => { return "time"; },
    textcolor: (l, x, y, s) => { return "#000"; },
    color: (l, x, y, s) => { return "#c0c505"; },
    // フレームごとの描画処理。キャンバスに経過時間を描画し、イメージオブジェクトとして返す。
    getframe: async (af, rf, len, l, x, y, s) => {
        let co = document.createElement("canvas");
        co.height = 1080;
        co.width = 1920;
        let ctx = co.getContext("2d");
        ctx.font = `${s}px serif`; // フォントサイズとスタイル設定
        let padding = (num, len) => {
            return (Array(len).join("0") + num).slice(-len);
        }
        let second = Math.floor(af / VideoFPS * 100) / 100; // 経過時間（秒）
        ctx.fillStyle = "white"; // テキストの色
        ctx.fillText(second, x, y); // 経過時間描画
        return await canvas2image(co); // キャンバスをイメージオブジェクトに変換
    },
};
export { obj_text, obj_rect, obj_time };
/**
 * 画面再描画間隔(ms)
 */
var DROW_INTERVAL = 200;
/*
 * 1セルあたりの長さ。
 * Canvasを方眼紙のように四角の集合体に描画する１つ四角あたりの大きさ
 * 値を変更してもグラフには影響しない
 */
var CANVAS_CELL_LENGTH = 40;
/**
 * キャンバス(心電描画エリア)のサイズ変更フラグ
 * true: 固定
 * false : 非固定(可変)
 */
var canvasFixing = false;
/**
 * canvasFixingがtrue非固定(可変)の時の画面のwidthの割合
 * 小数点で指定する(例:0.7の場合画面の70%)
 * 1以下を設定する
 */
var canvasNoFixingPercentageX = 0.98;
/**
 * canvasFixingがtrue非固定(可変)の時の画面のheightの割合
 * 小数点で指定する(例:0.5の場合画面の50%)
 */
var canvasNoFixingPercentageY = 0.9;
/**
 * データ間の移動ピクセル数(Default:1)
 * ※ X軸の表示データ数 = (windowX / DATA_INTERVAL_WIDTH)
 */
var DATA_INTERVAL_WIDTH = 1;
/**
 * canvasサイズの初期Width
 */
var windowX = 600;
/**
 * canvasサイズの初期Height
 */
var windowY = 300;
/**
 * 最大データ保持数
 * 精々4Kとしても3960が最大
 */
var MAX_DATA_SIZE = (3960 / DATA_INTERVAL_WIDTH);
// -300 ～ +300を0～windowYに変換する
/** 画面に描画するECG生データの最低値の絶対値(MAX:2047) */
var ECG_LOW_LIMIT = 350;
/** 画面に描画するECG生データの最高値の絶対値(MAX:2048) */
var ECG_HIGHT_LIMIT = 500;
/**
 * ECGの生データを格納
 * 最大格納データ数は'MAX_DATA_SIZE'となる。
 */
var ecgData;
var context;
var cntText;
var cnt = 0;
var start = 0;

/** ECGデータ退避エリア */
function EcgStack() {
    this._a = new Array();
};

/**
 * ECGから来たデータを格納する。
 * 来るデータは1行分の文字列
 */
EcgStack.prototype.push = function(o) {
    var owk = o;
    // var owk = o.split('\r\n');
    // データ保持数が最大だったら一番古いデータを捨てる
    if (this._a.length > MAX_DATA_SIZE) {
        this._a.splice(0, 1);
    }
    // データを格納する
    this._a.push(o);
};

/**
 * ECGデータを返す。
 */
EcgStack.prototype.get = function() {
    return this._a;
};
ecgData = new EcgStack();


window_load();
window.onresize = window_load;

function window_load() {
    // Canvasサイズが可変だった場合
    if (!canvasFixing) {
        windowX = window.innerWidth;
        windowY = window.innerHeight;
        // 方眼紙のようにきれいな四角の連鎖になるように計算
        windowX = Math.floor((Math.floor(windowX * canvasNoFixingPercentageX)) / CANVAS_CELL_LENGTH) * CANVAS_CELL_LENGTH;
        windowY = Math.floor((Math.floor(windowY * canvasNoFixingPercentageY)) / CANVAS_CELL_LENGTH) * CANVAS_CELL_LENGTH;

        // こうしないとダメ見たい
        var elem = document.getElementById('myCanvas');
        elem.setAttribute("width", windowX.toString());
        elem.setAttribute("height", windowY.toString());
    }
}

function init() {
    context = myCanvas.getContext('2d');
    context.fillStyle = "#FF0";
    context.fill();
}

function drawLine(x1, y1, x2, y2, color, lineWidth) {
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.strokeStyle = color;
    if (lineWidth === undefined) lineWidth = 0.2; // IE-ES6対応
    context.lineWidth = lineWidth;
    context.stroke();
}

function drawLineEcg(x1, y1, x2, y2, color) {
    var wy1 = y1.split(',');
    var wy2 = y2.split(',');
    // ECG draw
    var ecg_y1 = drowFormatEcgY(wy1[1], ECG_LOW_LIMIT, ECG_HIGHT_LIMIT);
    var ecg_y2 = drowFormatEcgY(wy2[1], ECG_LOW_LIMIT, ECG_HIGHT_LIMIT);
    drawLine(x1, ecg_y1, x2, ecg_y2, "#222", 1);

    // 重力
    var g_y1 = drowFormatEcgY(wy1[2] - 110, 300, 300);
    var g_y2 = drowFormatEcgY(wy2[2] - 110, 300, 300);
    drawLine(x1, g_y1, x2, g_y2, "#BABBDA", 1);

    // 横
    var g_s1 = drowFormatEcgY(wy1[3], 300, 300);
    var g_s2 = drowFormatEcgY(wy2[3], 300, 300);
    drawLine(x1, g_s1, x2, g_s2, "#CAFBDA", 1);

    // 縦
    var g_t1 = drowFormatEcgY(wy1[4], 300, 300);
    var g_t2 = drowFormatEcgY(wy2[4], 300, 300);
    drawLine(x1, g_t1, x2, g_t2, "#FBDAE7", 1);
}

/**
 * 描画するY座標の整形を行う
 */
function drowFormatEcgY(y, low, hight) {
    var rtny;
    rtny = y - 0;
    rtny = rtny + low;
    if (rtny <= 0) {
        rtny = 0;
    }
    var alg = windowY / (low + hight);
    rtny = (rtny * alg);
    rtny = windowY - rtny;
    return rtny.toString();
}

/**
 * ecgData(socketから受信・退避したデータ)を元に画面サイズに合わせて描画する
 */
function ecgDrow() {
    var mEcg = ecgData.get(); // 自分のデータ部分をそのままコピーする。
    var viewMaxCnt = windowX / DATA_INTERVAL_WIDTH;
    var lastx = 0;
    var lasty = '0,0,0,0,0,0,0'; // 始めだけのデータ
    cleareData();
    // 描画エリア分のデータが存在しない場合
    if (viewMaxCnt > mEcg.length) {
        lasty = mEcg[0];
        for (var i = 1; i < mEcg.length; i++) {
            var p = i * DATA_INTERVAL_WIDTH;
            drawLineEcg(lastx, lasty, p, mEcg[i]);
            lastx = p;
            lasty = mEcg[i];
        }
    } else {
        // 描画エリア分以上のデータが存在した場合、画面をシークし描画する
        var ecgStartLen = mEcg.length - viewMaxCnt;
        lasty = mEcg[mEcg.length - viewMaxCnt];
        for (var i = 0; i < viewMaxCnt; i++) {
            var p = i * DATA_INTERVAL_WIDTH;
            drawLineEcg(lastx, lasty, p, mEcg[ecgStartLen]);
            lastx = p;
            lasty = mEcg[ecgStartLen];
            ecgStartLen++;
        }
    }
}

function cleareData() {
    context.clearRect(0, 0, windowX, windowY);
    // 縦線
    for (i = CANVAS_CELL_LENGTH; i < windowX; i += CANVAS_CELL_LENGTH) {
        drawLine(i, 0, i, windowY, "#CCC");
    }
    // 横線
    for (i = CANVAS_CELL_LENGTH; i < windowY; i += CANVAS_CELL_LENGTH) {
        drawLine(0, i, windowX, i, "#CCC");
    }
}

setInterval(ecgDrow, DROW_INTERVAL);
init();

// -- socket.io
// socket受信データの残骸部分
var dastData = [];
// socket.on('data', function(data) {
function dataStore(data) {
    //console.log('socket -data');
    //console.log('lastwk = ' + data.toString());
    var wk = data.toString().split('\r\n');

    var lastDast = null;
    if (wk.length === 0) {
        return;
    }

    // TCP通信+callback方式のため、今回きたデータと前回の残骸を連結させて、正常データの場合、データを格納する
    // 受信したデータの先頭行が不足している場合、最下行のデータと連結
    if ((wk[0].split(',').length - 1) !== 5) {
        // 前回の退避データの末尾と、最新データの先頭行を連結
        var ddata = dastData.pop() + wk.shift();
        // カンマの数が5個だったら正常に連結ができたとみなして退避
        if ((ddata.split(',').length - 1) === 5) {
            dastData.push(ddata);
        }
    }

    // かならず1行のはずだがループさせる
    for (var i = 0; i < dastData.length; i++) {
        // ecgData.push(dastData[i].split(',')[1]);   -------   test
        ecgData.push(dastData[i].toString());
    }

    // 受信したデータの最下行のデータが不足している場合、退避させる
    var lastwk = wk[wk.length - 1];
    if (lastwk.length !== 0) {
        if ((lastwk.split(',').length - 1) !== 5) {
            dastData.push(wk.pop());
        }
    }

    // 受信したデータを退避させる - 普通は最終行の1行しか残っていないはず。ｓ
    for (var i = 0; i < wk.length; i++) {
        // 綺麗なデータだと最終行が改行になるため、splitすると空データになる。
        if (wk[i] === '') {
            continue;
        }
        // ecgData.push(dastData[i].split(',')[1]);   -------   test
        ecgData.push(wk[i]);
    }
}



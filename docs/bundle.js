function ge(id) {
    return document.getElementById(id);
}
function ce(tagName, classes = [], children = []) {
    const e = document.createElement(tagName);
    classes.forEach(_ => addC(e, _));
    children.forEach(_ => e.appendChild(_));
    return e;
}
function cLI(innerText, classes, id, onClickFn) {
    const li = ce("li");
    li.innerText = innerText;
    classes.forEach(_ => addC(li, _));
    if (id)
        li.id = id;
    if (onClickFn)
        onClick(li, onClickFn);
    return li;
}
function addC(elm, cls) {
    elm.classList.add(cls);
}
function onClick(elm, fn) {
    elm.addEventListener("click", fn);
}

class MyCanvas {
    constructor(parent, canvas, dpr = undefined) {
        this.parent = parent;
        this.canvas = canvas;
        if (canvas.getContext)
            this.ctx = canvas.getContext('2d');
        else
            throw "Canvasが対応していないようです";
        this.width = 1;
        this.height = 1;
        this.dpr = (dpr || window.devicePixelRatio || 1);
        (() => {
            var i = undefined;
            window.addEventListener('resize', () => {
                if (i !== undefined)
                    clearTimeout(i);
                i = setTimeout(() => this.onResize(), 100);
            });
        })();
        this.onResize();
        return this;
    }
    changeDPR(dpr) {
        this.dpr = dpr || this.dpr;
        this.onResize();
        console.log(`[DPR: ${dpr}/${(window.devicePixelRatio || 1)}`);
    }
    onResize() {
        let canvas = this.ctx.canvas;
        const maxWidth = this.parent.clientWidth;
        const maxHeight = this.parent.clientHeight;
        const width = maxWidth;
        const height = maxHeight;
        this.width = this.dpr * width;
        this.height = this.dpr * height;
        canvas.width = this.width;
        canvas.height = this.height;
        canvas.style.width = width + "px";
        canvas.style.height = height + "px";
        this.ctx.lineWidth = this.dpr;
    }
    line(x1, y1, x2, y2) {
        const scaleX = 1, scaleY = 1;
        this.ctx.moveTo((x1 * scaleX), (y1 * scaleY));
        this.ctx.lineTo((x2 * scaleX), (y2 * scaleY));
    }
    rect(x, y, w, h) {
        const scaleX = 1, scaleY = 1;
        this.ctx.rect((x * scaleX), (y * scaleY), (w * scaleX), (h * scaleY));
    }
    round(x, y, r) {
        const scaleX = 1, scaleY = 1;
        this.ctx.arc((x * scaleX), (y * scaleY), (r * Math.min(scaleX, scaleY)), -0.5 * Math.PI, 2 * Math.PI);
    }
    longRound(x, y, h, r) {
        const scaleX = 1, scaleY = 1;
        this.ctx.arc((x * scaleX), (y * scaleY), (r * Math.min(scaleX, scaleY)), -Math.PI, 0);
        this.ctx.arc((x * scaleX), ((y + h) * scaleY), (r * Math.min(scaleX, scaleY)), 0, -Math.PI);
        this.ctx.lineTo((x * scaleX - r * Math.min(scaleX, scaleY)), (y * scaleY));
    }
    beginPath() { this.ctx.beginPath(); }
    fillAll(style = undefined) {
        if (style !== undefined)
            this.ctx.fillStyle = style;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
    fill(style = undefined) {
        if (style !== undefined)
            this.ctx.fillStyle = style;
        this.ctx.fill();
    }
    stroke(style = undefined) {
        if (style !== undefined)
            this.ctx.strokeStyle = style;
        this.ctx.stroke();
    }
    clearAll() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }
}

const pref = {
    defaultTurnCount: 64,
};
class UI_Info {
    constructor() {
        this.container = ge("info");
        this.playBtn = ge("i-play");
        this.onlineBtn = ge("i-start_online");
        this.onPlayClicked = () => { };
        this.onOnlineClicked = () => { };
        onClick(this.playBtn, () => this.onPlayClicked());
        onClick(this.onlineBtn, () => this.onOnlineClicked());
    }
    show() {
        this.container.classList.remove("hide");
    }
    hide() {
        this.container.classList.add("hide");
    }
}
class UI_Config {
    constructor() {
        this.container = ge("config");
        this.sizeInput = ge("c-size_in");
        this.sizeView = ge("c-size_out");
        this.startBtn = ge("c-start");
        this.turnCount = pref.defaultTurnCount;
        this.onStartClicked = (turnCount) => { };
        onClick(this.startBtn, () => this.onStartClicked(this.turnCount));
        this.sizeInput.addEventListener("input", () => this.onUpdateSizeInput());
        this.sizeInput.value = this.turnCount + "";
        this.updateSizeView();
    }
    updateSizeView() {
        this.sizeView.textContent = `The game will finish in ${this.turnCount} turns.`;
    }
    onUpdateSizeInput() {
        let value = parseInt(this.sizeInput.value);
        if (value <= 0 || isNaN(value))
            value = pref.defaultTurnCount;
        if (value % 2 == 1)
            value++;
        this.turnCount = value;
        this.updateSizeView();
    }
    show() {
        this.container.classList.remove("hide");
    }
    hide() {
        this.container.classList.add("hide");
    }
}
class UI_Menu {
    constructor() {
        this.container = ge("container");
        this.info = new UI_Info();
        this.config = new UI_Config();
        this.isOnline = "?";
        this.onPlayClicked = (turnCount, isOnline) => { };
        this.info.onOnlineClicked = () => {
            this.isOnline = "yes";
            this.info.hide();
            this.config.show();
        };
        this.info.onPlayClicked = () => {
            this.isOnline = "no";
            this.info.hide();
            this.config.show();
        };
        this.config.onStartClicked = turnCount => {
            if (this.isOnline === "?")
                throw "BUG";
            this.onPlayClicked(turnCount, this.isOnline === "yes");
        };
    }
    show() {
        this.container.classList.remove("hide");
        this.isOnline = "?";
        this.info.show();
        this.config.hide();
    }
    hide() {
        this.container.classList.add("hide");
    }
}
class UI_Game {
    constructor() {
        this.container = ge("game");
        this.zoomInBtn = ge("g-zoom_in");
        this.zoomOutBtn = ge("g-zoom_out");
        this.putBtn = ge("g-put");
        this.fullscreenBtn = ge("g-fullscreen");
        this.log = ge("g-log");
        this.shortMsg = ge("g-short_message");
        this.message = ge("g-message");
        this.canvasContainer = ge("g-canvas_parent");
        this.canvasElem = ge("g-canvas");
        this.canvas = new MyCanvas(this.canvasContainer, this.canvasElem);
        this.onZoomInClicked = () => { };
        this.onZoomOutClicked = () => { };
        this.onPutClicked = () => { };
        this.onFullscreenClicked = () => { };
        onClick(this.zoomInBtn, () => this.onZoomInClicked());
        onClick(this.zoomOutBtn, () => this.onZoomOutClicked());
        onClick(this.putBtn, () => this.onPutClicked());
        onClick(this.fullscreenBtn, () => this.onFullscreenClicked());
    }
    show() {
        this.container.classList.remove("hide");
    }
    hide() {
        this.container.classList.add("hide");
    }
    clearLog() {
        this.log.innerHTML = "";
    }
    addLog(msg) {
        this.log.appendChild(cLI(msg, []));
    }
    setShortMsg(msg) {
        this.shortMsg.textContent = msg;
    }
    setMsg(msg) {
        this.message.textContent = msg;
    }
}
class UI {
    constructor() {
        this.menu = new UI_Menu();
        this.game = new UI_Game();
        this.onPlayClicked = (turnCount, isOnline) => { };
        this.onZoomInClicked = () => { };
        this.onZoomOutClicked = () => { };
        this.onPutClicked = () => { };
        this.onFullscreenClicked = () => { };
        this.menu.onPlayClicked = (turnCount, isOnline) => this.onPlayClicked(turnCount, isOnline);
        this.game.onZoomInClicked = () => this.onZoomInClicked();
        this.game.onZoomOutClicked = () => this.onZoomOutClicked();
        this.game.onPutClicked = () => this.onPutClicked();
        this.game.onFullscreenClicked = () => this.onFullscreenClicked();
    }
    showMenu() {
        this.menu.show();
        this.game.hide();
    }
    showGame() {
        this.menu.hide();
        this.game.show();
    }
    clearLog() {
        this.game.clearLog();
    }
    addLog(msg) {
        this.game.addLog(msg);
    }
    setShortMsg(msg) {
        this.game.setShortMsg(msg);
    }
    setMsg(msg) {
        this.game.setMsg(msg);
    }
    getCanvas() {
        return this.game.canvas;
    }
}

function isChrome() {
    return navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
}
function onLoad(fn) {
    window.addEventListener("load", fn);
}

const chunkSize = 16;
const minSwipeMove = 5;
var Cell;
(function (Cell) {
    Cell[Cell["nothing"] = 0] = "nothing";
    Cell[Cell["black"] = 1] = "black";
    Cell[Cell["white"] = 2] = "white";
})(Cell || (Cell = {}));
class CellChunk {
    constructor(xPos, yPos) {
        this.xPos = xPos;
        this.yPos = yPos;
        this.cells = new Array(chunkSize).fill(0).map(() => new Array(chunkSize).fill(0).map(() => 0));
    }
    some(fn) {
        for (let i = 0; i < chunkSize; i++) {
            for (let j = 0; j < chunkSize; j++) {
                if (fn(i, j))
                    return true;
            }
        }
        return false;
    }
    sum(fn) {
        let sum = 0;
        for (let i = 0; i < chunkSize; i++) {
            for (let j = 0; j < chunkSize; j++) {
                sum += fn(i, j);
            }
        }
        return sum;
    }
}
class Board {
    constructor() {
        this.chunks = new Map();
    }
    getCell(x, y) {
        const posX = quantize(x, chunkSize);
        const posY = quantize(y, chunkSize);
        let tmp = this.chunks.get(posX.quantized);
        if (!tmp)
            return 0;
        let chunk = tmp.get(posY.quantized);
        if (!chunk)
            return 0;
        return chunk.cells[posX.mod][posY.mod];
    }
    setCell(x, y, cell) {
        const posX = quantize(x, chunkSize);
        const posY = quantize(y, chunkSize);
        let tmp = this.chunks.get(posX.quantized);
        if (!tmp)
            this.chunks.set(posX.quantized, tmp = new Map());
        let chunk = tmp.get(posY.quantized);
        if (!chunk)
            tmp.set(posY.quantized, chunk = new CellChunk(posX.quantized, posY.quantized));
        chunk.cells[posX.mod][posY.mod] = cell;
    }
    some(fn) {
        for (const c of this.chunks.values()) {
            for (const chunk of c.values()) {
                const chunk_xPos = chunk.xPos;
                const chunk_yPos = chunk.yPos;
                if (chunk.some((x, y) => fn(x + chunk_xPos, y + chunk_yPos)))
                    return true;
            }
        }
        return false;
    }
    sum(fn) {
        let sum = 0;
        for (const c of this.chunks.values()) {
            for (const chunk of c.values()) {
                const chunk_xPos = chunk.xPos;
                const chunk_yPos = chunk.yPos;
                sum += chunk.sum((x, y) => fn(x + chunk_xPos, y + chunk_yPos));
            }
        }
        return sum;
    }
    reset() {
        this.chunks = new Map();
    }
}
const di8 = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
class ReversiBoard extends Board {
    constructor(initialize = true) {
        super();
        this.onAfterPut = (x, y, piece) => { };
        if (initialize)
            this.reset();
    }
    reset() {
        super.reset();
        this.setCell(0, 0, 2);
        this.setCell(-1, -1, 2);
        this.setCell(-1, 0, 1);
        this.setCell(0, -1, 1);
    }
    canPut(x, y, piece) {
        if (this.getCell(x, y) !== 0)
            return false;
        const opponent = opponentPiece(piece);
        return di8.some(di => this.canReverseDi(x, y, piece, di));
    }
    canPutSomewhere(piece) {
        return this.some((x, y) => this.canPut(x, y, piece));
    }
    countPiece(piece) {
        return this.sum((x, y) => this.getCell(x, y) === piece ? 1 : 0);
    }
    put(x, y, piece) {
        if (!this.canPut(x, y, piece))
            throw "BUG";
        di8.forEach(di => {
            if (this.canReverseDi(x, y, piece, di))
                this.reverseDi(x, y, piece, di);
        });
        this.setCell(x, y, piece);
        this.onAfterPut(x, y, piece);
    }
    isFinished() {
        return !this.canPutSomewhere(1) && !this.canPutSomewhere(2);
    }
    canReverseDi(x, y, piece, di) {
        const opponent = opponentPiece(piece);
        let cX = x, cY = y;
        let cnt = 0;
        while (true) {
            cX += di[0];
            cY += di[1];
            const cCell = this.getCell(cX, cY);
            if (cCell === opponent)
                cnt++;
            else if (cCell === piece)
                return cnt > 0;
            else
                return false;
        }
    }
    reverseDi(x, y, piece, di) {
        const opponent = opponentPiece(piece);
        let cX = x, cY = y;
        while (true) {
            cX += di[0];
            cY += di[1];
            const cCell = this.getCell(cX, cY);
            if (cCell === opponent)
                this.setCell(cX, cY, piece);
            else if (cCell === piece)
                return;
            else
                throw "BUG";
        }
    }
}
class DrawableReversiBoard extends ReversiBoard {
    constructor() {
        super(...arguments);
        this.canvas = undefined;
        this.cellSize = 1;
        this.originPixel = [0, 0];
        this.selected = undefined;
        this.playerPiece = undefined;
        this.maxTurnCount = undefined;
        this.onCellClicked = (x, y) => { };
    }
    bindCanvas(canvas) {
        this.canvas = canvas;
        const _onCanvasResize = canvas.onResize;
        canvas.onResize = () => {
            _onCanvasResize.apply(canvas);
            this.render();
        };
        let startPos = [0, 0];
        canvas.canvas.addEventListener("pointerdown", e => {
            startPos = [e.offsetX, e.offsetY];
        });
        canvas.canvas.addEventListener("pointermove", e => {
            if (e.buttons > 0) {
                const offset = [
                    (e.offsetX - startPos[0]) * canvas.dpr,
                    (e.offsetY - startPos[1]) * canvas.dpr
                ];
                const newOriginPixel = [
                    offset[0] + this.originPixel[0],
                    offset[1] + this.originPixel[1]
                ];
                this.render(newOriginPixel);
                e.preventDefault();
            }
        });
        canvas.canvas.addEventListener("pointerup", e => {
            const offset = [
                (e.offsetX - startPos[0]) * canvas.dpr,
                (e.offsetY - startPos[1]) * canvas.dpr
            ];
            if (Math.hypot(...offset) < minSwipeMove) {
                const pos = this.pixel2cell(startPos[0] * canvas.dpr, startPos[1] * canvas.dpr);
                this.selected = [Math.floor(pos.x), Math.floor(pos.y)];
            }
            else {
                const newOriginPixel = [
                    offset[0] + this.originPixel[0],
                    offset[1] + this.originPixel[1]
                ];
                this.originPixel = newOriginPixel;
            }
            this.render();
        });
        this.render();
    }
    getCellSize() {
        return this.cellSize;
    }
    setCellSize(pixels) {
        const factor = pixels / this.cellSize;
        this.originPixel = [
            this.originPixel[0] * factor,
            this.originPixel[1] * factor,
        ];
        this.cellSize = pixels;
        this.render();
    }
    getplayerPiece() {
        return this.playerPiece;
    }
    setPlayerPiece(piece) {
        this.playerPiece = piece;
        this.render();
    }
    getSelected() {
        if (this.selected)
            return { x: this.selected[0], y: this.selected[1] };
        return undefined;
    }
    setSelected(pos) {
        if (pos)
            this.selected = [pos.x, pos.y];
        else
            this.selected = undefined;
    }
    put(x, y, piece) {
        super.put(x, y, piece);
        this.render();
    }
    render(originPixel = this.originPixel, playerPiece = this.playerPiece) {
        if (!this.canvas)
            return;
        const canvas = this.canvas, width = canvas.width, height = canvas.height, cellSize = this.cellSize;
        const cell2pixel = (x, y) => this.cell2pixel(x, y, originPixel);
        const pixel2cell = (x, y) => this.pixel2cell(x, y, originPixel);
        const boardVP = {
            left: Math.floor(pixel2cell(0, 0).x),
            top: Math.floor(pixel2cell(0, 0).y),
            right: Math.ceil(pixel2cell(width, height).x),
            bottom: Math.ceil(pixel2cell(width, height).y),
        };
        canvas.fillAll("#eee");
        if (this.selected) {
            const pixel = cell2pixel(this.selected[0], this.selected[1]);
            canvas.beginPath();
            this.canvas.rect(pixel.left, pixel.top, cellSize, cellSize);
            canvas.fill("#cdc");
        }
        for (let x = boardVP.left; x <= boardVP.right; x++) {
            const xPixel = cell2pixel(x, 0).left;
            canvas.beginPath();
            this.canvas.line(xPixel, 0, xPixel, height);
            canvas.stroke(x % chunkSize == 0 ? "#8b8" : "#bdb");
        }
        for (let y = boardVP.top; y <= boardVP.bottom; y++) {
            const yPixel = cell2pixel(0, y).top;
            canvas.beginPath();
            this.canvas.line(0, yPixel, width, yPixel);
            canvas.stroke(y % chunkSize == 0 ? "#8b8" : "#bdb");
        }
        const radius = (cellSize / 2) * 0.8, suggestRadius = Math.max(1, radius * 0.2);
        for (let x = boardVP.left; x <= boardVP.right; x++) {
            for (let y = boardVP.top; y <= boardVP.bottom; y++) {
                const pixel = cell2pixel(x, y);
                const centerX = pixel.left + cellSize / 2, centerY = pixel.top + cellSize / 2;
                const piece = this.getCell(x, y);
                if (piece === 1) {
                    canvas.beginPath();
                    this.canvas.round(centerX, centerY, radius);
                    canvas.fill("#555");
                }
                else if (piece === 2) {
                    canvas.beginPath();
                    this.canvas.round(centerX, centerY, radius);
                    canvas.stroke("#555");
                }
                else if (piece === 0) {
                    if (playerPiece && this.canPut(x, y, playerPiece)) {
                        canvas.beginPath();
                        this.canvas.round(centerX, centerY, suggestRadius);
                        canvas.fill("#555");
                    }
                }
                else
                    throw "BUG";
            }
        }
    }
    cell2pixel(x, y, originPixel = this.originPixel) {
        if (!this.canvas)
            throw "BUG";
        const canvas = this.canvas, width = canvas.width, height = canvas.height, cellSize = this.cellSize;
        return ({
            left: originPixel[0] + x * cellSize + width / 2,
            top: originPixel[1] + y * cellSize + height / 2,
        });
    }
    ;
    pixel2cell(x, y, originPixel = this.originPixel) {
        if (!this.canvas)
            throw "BUG";
        const canvas = this.canvas, width = canvas.width, height = canvas.height, cellSize = this.cellSize;
        return ({
            x: (x - width / 2 - originPixel[0]) / cellSize,
            y: (y - height / 2 - originPixel[1]) / cellSize,
        });
    }
}
function quantize(num, divisor) {
    const quantized = Math.floor(num / divisor) * divisor;
    const mod = num - quantized;
    return { quantized, mod };
}
function opponentPiece(piece) {
    if (piece === 1)
        return 2;
    if (piece === 2)
        return 1;
    throw "BUG";
}

function showConsoleBanner() {
    if (isChrome()) {
        console.log("\n" +
            "%c %c Infinite Reversi \n" +
            "%c %c Made by omasakun on 2019\n" +
            "%c %c GitHub: https://github.com/omasakun/inf_reversi\n" +
            "%c %c Enjoy!\n", "color: #130f40; background-color: #a799ef; line-height: 2;", "color: #ddd6ff; background-color: #524983; line-height: 2;", "color: #130f40; background-color: #a799ef; line-height: 1.5;", "", "color: #130f40; background-color: #a799ef; line-height: 1.5;", "", "color: #130f40; background-color: #a799ef; line-height: 1.5;", "font-weight: bold");
    }
    else {
        console.log("\n" +
            "┃ ### Infinite Reversi ### \n" +
            "┃ \n" +
            "┃ Made by omasakun on 2019\n" +
            "┃ GitHub: https://github.com/omasakun\n" +
            "┃ Enjoy!\n");
    }
}
function getRoomID() {
    if (location.search === "" || location.search.includes("&"))
        return "";
    else
        return location.search.substr(1);
}
function id2ws(id) {
    const ws = new WebSocket("wss://connect.websocket.in/inf_reversi?room_id=" + id);
    ws.addEventListener("error", e => console.log(e));
    return ws;
}
function uuid() {
    return (Math.random().toString() + Math.random().toString()).replace(/0\./g, "").substr(1, 20);
}
function id2publishURL(id) {
    return location.origin + location.pathname + "?" + id;
}
function autoSyncBoard(ws, board, maxTurnCount) {
    let histories = [];
    let enableSend = true;
    let isOpponentConnected = false;
    ws.addEventListener("message", ev => {
        enableSend = false;
        const wsData = JSON.parse(ev.data);
        if (wsData.your_turn === 0)
            board.setPlayerPiece(undefined);
        else
            board.setPlayerPiece(wsData.your_turn);
        board.maxTurnCount = wsData.max_turn_count;
        if (histories.some((hist, i) => {
            const newHist = wsData.history[i];
            return newHist.x !== hist.x || newHist.y !== hist.y || newHist.piece !== hist.piece;
        })) {
            board.reset();
            histories = [];
        }
        wsData.history.slice(histories.length).forEach(hist => {
            board.put(hist.x, hist.y, hist.piece);
        });
        enableSend = true;
    });
    const _board_onAfterPut = board.onAfterPut;
    board.onAfterPut = (x, y, piece) => {
        _board_onAfterPut(x, y, piece);
        histories.push({ x, y, piece });
        if (!enableSend)
            return;
        const player = board.getplayerPiece();
        if (!player)
            return;
        if (board.maxTurnCount === undefined)
            throw "BUG";
        const data2send = {
            your_turn: opponentPiece(player),
            max_turn_count: board.maxTurnCount,
            history: histories,
        };
        ws.send(JSON.stringify(data2send));
    };
    ws.addEventListener("open", () => {
        const player = board.getplayerPiece();
        if (board.maxTurnCount === undefined)
            return;
        if (!player)
            return;
        const data2send = {
            your_turn: isOpponentConnected ? 0 : opponentPiece(player),
            max_turn_count: board.maxTurnCount,
            history: histories,
        };
        ws.send(JSON.stringify(data2send));
        isOpponentConnected = true;
    });
    ws.addEventListener("close", () => {
    });
}
showConsoleBanner();
onLoad(() => {
    const ui = new UI();
    let board = new DrawableReversiBoard();
    console.log(window["ui"] = ui, window["board"] = board);
    let currentTurn = 1;
    const updateShortMsg = () => {
        ui.setShortMsg(`● x ${board.countPiece(1)} , ○ x ${board.countPiece(2)}`);
    };
    const updateMsg = () => {
        if (isGameover()) {
            const wCount = board.countPiece(2);
            const bCount = board.countPiece(1);
            if (wCount === bCount) {
                ui.setMsg("ゲーム終了。世にも珍しい引き分けです！");
            }
            ui.setMsg(`ゲーム終了。${bCount > wCount ? "●" : "○"} の勝利です！`);
            return;
        }
        const piece = board.getplayerPiece();
        if (!piece)
            return;
        ui.setMsg(`第${currentTurn}ターン。${piece === 1 ? "●" : "○"} のターンです。`);
    };
    const isGameover = () => {
        if (board.maxTurnCount === undefined)
            return false;
        return board.isFinished() || currentTurn > board.maxTurnCount;
    };
    board.bindCanvas(ui.getCanvas());
    board.setCellSize(64);
    const _board_onAfterPut = board.onAfterPut;
    board.onAfterPut = (x, y, piece) => {
        _board_onAfterPut(x, y, piece);
        ui.addLog(`${piece === 1 ? "●" : "○"} (${x}, ${y})`);
        currentTurn++;
        updateShortMsg();
    };
    ui.onZoomInClicked = () => board.setCellSize(board.getCellSize() * 1.2);
    ui.onZoomOutClicked = () => board.setCellSize(board.getCellSize() / 1.2);
    ui.onFullscreenClicked = () => {
        document.body.requestFullscreen();
    };
    let isOnlineMode = false;
    ui.onPutClicked = () => {
        if (isGameover()) {
            alert("ゲームは既に終わったのです。コマを置くことはできないのです。");
            return;
        }
        const selected = board.getSelected();
        const player = board.getplayerPiece();
        if (player === undefined)
            throw "BUG";
        if (!selected) {
            ui.setMsg("どのマスにコマを置きたいですか？ 置きたいマスをクリックしてください。");
            return;
        }
        if (!board.canPut(selected.x, selected.y, player)) {
            ui.setMsg(`選択したマス (${selected.x}, ${selected.y}) にはあなたのコマは置けないようです。他のマスを選択してください。黒いドットのついたマスならどこでもコマを置けます。`);
            return;
        }
        board.put(selected.x, selected.y, player);
        if (!isOnlineMode)
            board.setPlayerPiece(opponentPiece(player));
        updateMsg();
    };
    ui.onPlayClicked = (turnCount, isOnline) => {
        if (isOnline) {
            alert("Caution: Online game may not works properly... (This is why this game is work-in-progress)");
        }
        board.maxTurnCount = turnCount;
        isOnlineMode = isOnline;
        ui.clearLog();
        ui.showGame();
        ui.getCanvas().onResize();
        if (isOnline) {
            board.reset();
            board.setPlayerPiece(1);
            const roomId = uuid();
            const ws = id2ws(roomId);
            autoSyncBoard(ws, board);
            updateShortMsg();
            updateMsg();
            prompt("以下のURLを、対戦相手に開いてもらってください", id2publishURL(roomId));
        }
        else {
            board.reset();
            board.setPlayerPiece(1);
            updateShortMsg();
            updateMsg();
        }
    };
    if (getRoomID()) {
        alert("Caution: Online game may not works properly... (This is why this game is work-in-progress)");
        const ws = id2ws(getRoomID());
        autoSyncBoard(ws, board);
        ui.onPlayClicked(undefined, false);
    }
    else {
        ui.showMenu();
    }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvdHMvZG9tLXV0aWwudHMiLCIuLi9zcmMvdHMvbXljYW52YXMudHMiLCIuLi9zcmMvdHMvdWkudHMiLCIuLi9zcmMvdHMvdXRpbC50cyIsIi4uL3NyYy90cy9yZXZlcnNpLnRzIiwiLi4vc3JjL3RzL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIGdlIGdlcWEgZ2VxIGNlIGNMSSByZW1DIGFkZEMgcmVtQWxsIG9uQ2xpY2sgb25Mb2FkXG5cbi8vIGdldEVsZW1lbnRCeUlkXG5leHBvcnQgZnVuY3Rpb24gZ2U8VCBleHRlbmRzIEhUTUxFbGVtZW50ID0gSFRNTEVsZW1lbnQ+KGlkOiBzdHJpbmcpIHtcblx0cmV0dXJuIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKSBhcyBUO1xufVxuLy8gZ2V0QWxsRWxlbWVudHNCeVF1ZXJ5XG5leHBvcnQgZnVuY3Rpb24gZ2VxYShzZWxlY3RvcnM6IHN0cmluZykge1xuXHRyZXR1cm4gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9ycykpXG59XG4vLyBnZXRFbGVtZW50QnlRdWVyeVxuZXhwb3J0IGZ1bmN0aW9uIGdlcShzZWxlY3RvcnM6IHN0cmluZykge1xuXHRyZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3RvcnMpXG59XG4vLyBjcmVhdGVFbGVtZW50XG5leHBvcnQgZnVuY3Rpb24gY2U8SyBleHRlbmRzIGtleW9mIEhUTUxFbGVtZW50VGFnTmFtZU1hcD4odGFnTmFtZTogSywgY2xhc3Nlczogc3RyaW5nW10gPSBbXSwgY2hpbGRyZW46IEhUTUxFbGVtZW50W10gPSBbXSk6IEhUTUxFbGVtZW50VGFnTmFtZU1hcFtLXSB7XG5cdGNvbnN0IGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZ05hbWUpO1xuXHRjbGFzc2VzLmZvckVhY2goXyA9PiBhZGRDKGUsIF8pKTtcblx0Y2hpbGRyZW4uZm9yRWFjaChfID0+IGUuYXBwZW5kQ2hpbGQoXykpO1xuXHRyZXR1cm4gZTtcbn1cbi8vIGNyZWF0ZUxpRWxlbWVudFxuZXhwb3J0IGZ1bmN0aW9uIGNMSShpbm5lclRleHQ6IHN0cmluZywgY2xhc3Nlczogc3RyaW5nW10sIGlkPzogc3RyaW5nLCBvbkNsaWNrRm4/OiAoKSA9PiBhbnkpIHtcblx0Y29uc3QgbGkgPSBjZShcImxpXCIpO1xuXHRsaS5pbm5lclRleHQgPSBpbm5lclRleHQ7XG5cdGNsYXNzZXMuZm9yRWFjaChfID0+IGFkZEMobGksIF8pKTtcblx0aWYgKGlkKSBsaS5pZCA9IGlkO1xuXHRpZiAob25DbGlja0ZuKSBvbkNsaWNrKGxpLCBvbkNsaWNrRm4pO1xuXHRyZXR1cm4gbGk7XG59XG4vLyByZW1vdmVDbGFzc0Zyb21FbGVtZW50XG5leHBvcnQgZnVuY3Rpb24gcmVtQyhlbG06IEhUTUxFbGVtZW50LCBjbHM6IHN0cmluZykge1xuXHRlbG0uY2xhc3NMaXN0LnJlbW92ZShjbHMpO1xufVxuLy8gYWRkQ2xhc3NUb0VsZW1lbnRcbmV4cG9ydCBmdW5jdGlvbiBhZGRDKGVsbTogSFRNTEVsZW1lbnQsIGNsczogc3RyaW5nKSB7XG5cdGVsbS5jbGFzc0xpc3QuYWRkKGNscyk7XG59XG4vLyByZW1vdmVBbGxDaGlsZHJlblxuZXhwb3J0IGZ1bmN0aW9uIHJlbUFsbChlbG06IEhUTUxFbGVtZW50KSB7XG5cdHdoaWxlIChlbG0uZmlyc3RDaGlsZClcblx0XHRlbG0ucmVtb3ZlQ2hpbGQoZWxtLmZpcnN0Q2hpbGQpO1xufVxuLy8gYWRkT25DbGlja0V2ZW50TGlzdGVuZXJcbmV4cG9ydCBmdW5jdGlvbiBvbkNsaWNrKGVsbTogSFRNTEVsZW1lbnQsIGZuOiAoZXY6IEhUTUxFbGVtZW50RXZlbnRNYXBbXCJjbGlja1wiXSkgPT4gYW55KSB7XG5cdGVsbS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZm4pO1xufSIsImV4cG9ydCBjbGFzcyBNeUNhbnZhcyB7XG5cdHBhcmVudDogSFRNTEVsZW1lbnRcblx0Y2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudFxuXHRjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRFxuXHR3aWR0aDogbnVtYmVyXG5cdGhlaWdodDogbnVtYmVyXG5cdC8vIGFzcGVjdDogbnVtYmVyXG5cdGRwcjogbnVtYmVyXG5cdGNvbnN0cnVjdG9yKFxuXHRcdHBhcmVudDogSFRNTEVsZW1lbnQsXG5cdFx0Y2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCxcblx0XHRkcHI6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZCxcblx0XHQvLyBhc3BlY3Q6IG51bWJlcixcblx0KSB7XG5cdFx0dGhpcy5wYXJlbnQgPSBwYXJlbnQ7XG5cdFx0dGhpcy5jYW52YXMgPSBjYW52YXM7XG5cdFx0aWYgKGNhbnZhcy5nZXRDb250ZXh0KSB0aGlzLmN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpITtcblx0XHRlbHNlIHRocm93IFwiQ2FudmFz44GM5a++5b+c44GX44Gm44GE44Gq44GE44KI44GG44Gn44GZXCI7XG5cdFx0dGhpcy53aWR0aCA9IDE7XG5cdFx0dGhpcy5oZWlnaHQgPSAxO1xuXHRcdHRoaXMuZHByID0gKGRwciB8fCB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyB8fCAxKTtcblx0XHQvLyB0aGlzLmFzcGVjdCA9IGFzcGVjdDtcblx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cdFx0KCgpID0+IHtcblx0XHRcdHZhciBpOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG5cdFx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgKCkgPT4ge1xuXHRcdFx0XHRpZiAoaSAhPT0gdW5kZWZpbmVkKSBjbGVhclRpbWVvdXQoaSk7XG5cdFx0XHRcdGkgPSBzZXRUaW1lb3V0KCgpID0+IHRoaXMub25SZXNpemUoKSwgMTAwKTtcblx0XHRcdH0pO1xuXHRcdH0pKCk7XG5cdFx0dGhpcy5vblJlc2l6ZSgpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cdGNoYW5nZURQUihkcHI6IG51bWJlcikge1xuXHRcdHRoaXMuZHByID0gZHByIHx8IHRoaXMuZHByO1xuXHRcdHRoaXMub25SZXNpemUoKTtcblx0XHRjb25zb2xlLmxvZyhgW0RQUjogJHtkcHJ9LyR7KHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvIHx8IDEpfWApO1xuXHR9XG5cdG9uUmVzaXplKCkge1xuXHRcdGxldCBjYW52YXMgPSB0aGlzLmN0eC5jYW52YXM7XG5cdFx0Y29uc3QgbWF4V2lkdGggPSB0aGlzLnBhcmVudC5jbGllbnRXaWR0aDtcblx0XHRjb25zdCBtYXhIZWlnaHQgPSB0aGlzLnBhcmVudC5jbGllbnRIZWlnaHQ7XG5cdFx0LyogOiAvKiDjgavjgZnjgovjgYvjgIEgLy8qIOOBq+OBmeOCi+OBi+OBp+WHpueQhuOBjOWkieOCj+OCi+OAglxuXHRcdGNvbnN0IHNjYWxlID0gTWF0aC5taW4obWF4V2lkdGggLyB0aGlzLmFzcGVjdCwgbWF4SGVpZ2h0KTtcblx0XHRjb25zdCBzY2FsZVggPSBzY2FsZSAqIHRoaXMuYXNwZWN0O1xuXHRcdGNvbnN0IHNjYWxlWSA9IHNjYWxlO1xuXHRcdC8qL1xuXHRcdGNvbnN0IHdpZHRoID0gbWF4V2lkdGg7XG5cdFx0Y29uc3QgaGVpZ2h0ID0gbWF4SGVpZ2h0O1xuXHRcdC8vKi9cblx0XHR0aGlzLndpZHRoID0gdGhpcy5kcHIgKiB3aWR0aDtcblx0XHR0aGlzLmhlaWdodCA9IHRoaXMuZHByICogaGVpZ2h0O1xuXHRcdGNhbnZhcy53aWR0aCA9IHRoaXMud2lkdGg7XG5cdFx0Y2FudmFzLmhlaWdodCA9IHRoaXMuaGVpZ2h0O1xuXHRcdGNhbnZhcy5zdHlsZS53aWR0aCA9IHdpZHRoICsgXCJweFwiO1xuXHRcdGNhbnZhcy5zdHlsZS5oZWlnaHQgPSBoZWlnaHQgKyBcInB4XCI7XG5cdFx0dGhpcy5jdHgubGluZVdpZHRoID0gdGhpcy5kcHI7XG5cdH1cblx0bGluZSh4MTogbnVtYmVyLCB5MTogbnVtYmVyLCB4MjogbnVtYmVyLCB5MjogbnVtYmVyKSB7XG5cdFx0Y29uc3Qgc2NhbGVYID0gMSwgc2NhbGVZID0gMTtcblx0XHR0aGlzLmN0eC5tb3ZlVG8oKHgxICogc2NhbGVYKSwgKHkxICogc2NhbGVZKSk7XG5cdFx0dGhpcy5jdHgubGluZVRvKCh4MiAqIHNjYWxlWCksICh5MiAqIHNjYWxlWSkpO1xuXHR9XG5cdHJlY3QoeDogbnVtYmVyLCB5OiBudW1iZXIsIHc6IG51bWJlciwgaDogbnVtYmVyKSB7XG5cdFx0Y29uc3Qgc2NhbGVYID0gMSwgc2NhbGVZID0gMTtcblx0XHR0aGlzLmN0eC5yZWN0KFxuXHRcdFx0KHggKiBzY2FsZVgpLCAoeSAqIHNjYWxlWSksXG5cdFx0XHQodyAqIHNjYWxlWCksIChoICogc2NhbGVZKVxuXHRcdCk7XG5cdH1cblx0cm91bmQoeDogbnVtYmVyLCB5OiBudW1iZXIsIHI6IG51bWJlcikge1xuXHRcdGNvbnN0IHNjYWxlWCA9IDEsIHNjYWxlWSA9IDE7XG5cdFx0dGhpcy5jdHguYXJjKFxuXHRcdFx0KHggKiBzY2FsZVgpLFxuXHRcdFx0KHkgKiBzY2FsZVkpLFxuXHRcdFx0KHIgKiBNYXRoLm1pbihzY2FsZVgsIHNjYWxlWSkpLFxuXHRcdFx0LTAuNSAqIE1hdGguUEksXG5cdFx0XHQyICogTWF0aC5QSVxuXHRcdCk7XG5cdH1cblx0bG9uZ1JvdW5kKHg6IG51bWJlciwgeTogbnVtYmVyLCBoOiBudW1iZXIsIHI6IG51bWJlcikge1xuXHRcdGNvbnN0IHNjYWxlWCA9IDEsIHNjYWxlWSA9IDE7XG5cdFx0dGhpcy5jdHguYXJjKFxuXHRcdFx0KHggKiBzY2FsZVgpLFxuXHRcdFx0KHkgKiBzY2FsZVkpLFxuXHRcdFx0KHIgKiBNYXRoLm1pbihzY2FsZVgsIHNjYWxlWSkpLFxuXHRcdFx0LU1hdGguUEksIDBcblx0XHQpO1xuXHRcdHRoaXMuY3R4LmFyYyhcblx0XHRcdCh4ICogc2NhbGVYKSxcblx0XHRcdCgoeSArIGgpICogc2NhbGVZKSxcblx0XHRcdChyICogTWF0aC5taW4oc2NhbGVYLCBzY2FsZVkpKSxcblx0XHRcdDAsIC1NYXRoLlBJXG5cdFx0KTtcblx0XHR0aGlzLmN0eC5saW5lVG8oXG5cdFx0XHQoeCAqIHNjYWxlWCAtIHIgKiBNYXRoLm1pbihzY2FsZVgsIHNjYWxlWSkpLFxuXHRcdFx0KHkgKiBzY2FsZVkpXG5cdFx0KTtcblx0fVxuXHRiZWdpblBhdGgoKSB7IHRoaXMuY3R4LmJlZ2luUGF0aCgpIH1cblx0ZmlsbEFsbChzdHlsZTogdW5kZWZpbmVkIHwgc3RyaW5nID0gdW5kZWZpbmVkKSB7XG5cdFx0aWYgKHN0eWxlICE9PSB1bmRlZmluZWQpIHRoaXMuY3R4LmZpbGxTdHlsZSA9IHN0eWxlO1xuXHRcdHRoaXMuY3R4LmZpbGxSZWN0KDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcblx0fVxuXHRmaWxsKHN0eWxlOiB1bmRlZmluZWQgfCBzdHJpbmcgPSB1bmRlZmluZWQpIHtcblx0XHRpZiAoc3R5bGUgIT09IHVuZGVmaW5lZCkgdGhpcy5jdHguZmlsbFN0eWxlID0gc3R5bGU7XG5cdFx0dGhpcy5jdHguZmlsbCgpO1xuXHR9XG5cdHN0cm9rZShzdHlsZTogdW5kZWZpbmVkIHwgc3RyaW5nID0gdW5kZWZpbmVkKSB7XG5cdFx0aWYgKHN0eWxlICE9PSB1bmRlZmluZWQpIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gc3R5bGU7XG5cdFx0dGhpcy5jdHguc3Ryb2tlKCk7XG5cdH1cblx0Y2xlYXJBbGwoKSB7XG5cdFx0Y29uc3Qgc2NhbGVYID0gMSwgc2NhbGVZID0gMTtcblx0XHR0aGlzLmN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuXHR9XG59IiwiaW1wb3J0IHsgZ2UsIG9uQ2xpY2ssIGNlLCBjTEkgfSBmcm9tIFwiLi9kb20tdXRpbFwiO1xuaW1wb3J0IHsgTXlDYW52YXMgfSBmcm9tIFwiLi9teWNhbnZhc1wiO1xuXG5jb25zdCBwcmVmID0ge1xuXHRkZWZhdWx0VHVybkNvdW50OiA2NCxcbn1cblxuY2xhc3MgVUlfSW5mbyB7XG5cdHByaXZhdGUgY29udGFpbmVyID0gZ2UoXCJpbmZvXCIpO1xuXHRwcml2YXRlIHBsYXlCdG4gPSBnZShcImktcGxheVwiKTtcblx0cHJpdmF0ZSBvbmxpbmVCdG4gPSBnZShcImktc3RhcnRfb25saW5lXCIpO1xuXG5cdG9uUGxheUNsaWNrZWQgPSAoKSA9PiB7IH07XG5cdG9uT25saW5lQ2xpY2tlZCA9ICgpID0+IHsgfTtcblxuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRvbkNsaWNrKHRoaXMucGxheUJ0biwgKCkgPT4gdGhpcy5vblBsYXlDbGlja2VkKCkpO1xuXHRcdG9uQ2xpY2sodGhpcy5vbmxpbmVCdG4sICgpID0+IHRoaXMub25PbmxpbmVDbGlja2VkKCkpO1xuXHR9XG5cblx0c2hvdygpIHtcblx0XHR0aGlzLmNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZVwiKTtcblx0fVxuXHRoaWRlKCkge1xuXHRcdHRoaXMuY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoXCJoaWRlXCIpO1xuXHR9XG59XG5jbGFzcyBVSV9Db25maWcge1xuXHRwcml2YXRlIGNvbnRhaW5lciA9IGdlKFwiY29uZmlnXCIpO1xuXHRwcml2YXRlIHNpemVJbnB1dCA9IGdlPEhUTUxJbnB1dEVsZW1lbnQ+KFwiYy1zaXplX2luXCIpO1xuXHRwcml2YXRlIHNpemVWaWV3ID0gZ2UoXCJjLXNpemVfb3V0XCIpO1xuXHRwcml2YXRlIHN0YXJ0QnRuID0gZ2UoXCJjLXN0YXJ0XCIpO1xuXHRwcml2YXRlIHR1cm5Db3VudCA9IHByZWYuZGVmYXVsdFR1cm5Db3VudDtcblxuXHRvblN0YXJ0Q2xpY2tlZCA9ICh0dXJuQ291bnQ6IG51bWJlcikgPT4geyB9O1xuXG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdG9uQ2xpY2sodGhpcy5zdGFydEJ0biwgKCkgPT4gdGhpcy5vblN0YXJ0Q2xpY2tlZCh0aGlzLnR1cm5Db3VudCkpO1xuXHRcdHRoaXMuc2l6ZUlucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCAoKSA9PiB0aGlzLm9uVXBkYXRlU2l6ZUlucHV0KCkpO1xuXHRcdHRoaXMuc2l6ZUlucHV0LnZhbHVlID0gdGhpcy50dXJuQ291bnQgKyBcIlwiO1xuXHRcdHRoaXMudXBkYXRlU2l6ZVZpZXcoKTtcblx0fVxuXG5cdHByaXZhdGUgdXBkYXRlU2l6ZVZpZXcoKSB7XG5cdFx0dGhpcy5zaXplVmlldy50ZXh0Q29udGVudCA9IGBUaGUgZ2FtZSB3aWxsIGZpbmlzaCBpbiAke3RoaXMudHVybkNvdW50fSB0dXJucy5gO1xuXHR9XG5cdHByaXZhdGUgb25VcGRhdGVTaXplSW5wdXQoKSB7XG5cdFx0bGV0IHZhbHVlID0gcGFyc2VJbnQodGhpcy5zaXplSW5wdXQudmFsdWUpO1xuXHRcdGlmICh2YWx1ZSA8PSAwIHx8IGlzTmFOKHZhbHVlKSkgdmFsdWUgPSBwcmVmLmRlZmF1bHRUdXJuQ291bnQ7XG5cdFx0aWYgKHZhbHVlICUgMiA9PSAxKSB2YWx1ZSsrO1xuXHRcdHRoaXMudHVybkNvdW50ID0gdmFsdWU7XG5cdFx0dGhpcy51cGRhdGVTaXplVmlldygpO1xuXHR9XG5cdHNob3coKSB7XG5cdFx0dGhpcy5jb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZShcImhpZGVcIik7XG5cdH1cblx0aGlkZSgpIHtcblx0XHR0aGlzLmNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKFwiaGlkZVwiKTtcblx0fVxufVxuY2xhc3MgVUlfTWVudSB7XG5cdHByaXZhdGUgY29udGFpbmVyID0gZ2UoXCJjb250YWluZXJcIik7XG5cdHByaXZhdGUgaW5mbyA9IG5ldyBVSV9JbmZvKCk7XG5cdHByaXZhdGUgY29uZmlnID0gbmV3IFVJX0NvbmZpZygpO1xuXHRwcml2YXRlIGlzT25saW5lOiBcInllc1wiIHwgXCJub1wiIHwgXCI/XCIgPSBcIj9cIjtcblxuXHRvblBsYXlDbGlja2VkID0gKHR1cm5Db3VudDogbnVtYmVyLCBpc09ubGluZTogYm9vbGVhbikgPT4geyB9O1xuXG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHRoaXMuaW5mby5vbk9ubGluZUNsaWNrZWQgPSAoKSA9PiB7XG5cdFx0XHR0aGlzLmlzT25saW5lID0gXCJ5ZXNcIjtcblx0XHRcdHRoaXMuaW5mby5oaWRlKCk7XG5cdFx0XHR0aGlzLmNvbmZpZy5zaG93KCk7XG5cdFx0fTtcblx0XHR0aGlzLmluZm8ub25QbGF5Q2xpY2tlZCA9ICgpID0+IHtcblx0XHRcdHRoaXMuaXNPbmxpbmUgPSBcIm5vXCI7XG5cdFx0XHR0aGlzLmluZm8uaGlkZSgpO1xuXHRcdFx0dGhpcy5jb25maWcuc2hvdygpO1xuXHRcdH07XG5cdFx0dGhpcy5jb25maWcub25TdGFydENsaWNrZWQgPSB0dXJuQ291bnQgPT4ge1xuXHRcdFx0aWYgKHRoaXMuaXNPbmxpbmUgPT09IFwiP1wiKVxuXHRcdFx0XHR0aHJvdyBcIkJVR1wiO1xuXHRcdFx0dGhpcy5vblBsYXlDbGlja2VkKHR1cm5Db3VudCwgdGhpcy5pc09ubGluZSA9PT0gXCJ5ZXNcIik7XG5cdFx0fVxuXHR9XG5cblx0c2hvdygpIHtcblx0XHR0aGlzLmNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZVwiKTtcblxuXHRcdHRoaXMuaXNPbmxpbmUgPSBcIj9cIjtcblx0XHR0aGlzLmluZm8uc2hvdygpO1xuXHRcdHRoaXMuY29uZmlnLmhpZGUoKTtcblx0fVxuXHRoaWRlKCkge1xuXHRcdHRoaXMuY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoXCJoaWRlXCIpO1xuXHR9XG59XG5jbGFzcyBVSV9HYW1lIHtcblx0cHJpdmF0ZSBjb250YWluZXIgPSBnZShcImdhbWVcIik7XG5cdHByaXZhdGUgem9vbUluQnRuID0gZ2U8SFRNTEJ1dHRvbkVsZW1lbnQ+KFwiZy16b29tX2luXCIpO1xuXHRwcml2YXRlIHpvb21PdXRCdG4gPSBnZTxIVE1MQnV0dG9uRWxlbWVudD4oXCJnLXpvb21fb3V0XCIpO1xuXHRwcml2YXRlIHB1dEJ0biA9IGdlPEhUTUxCdXR0b25FbGVtZW50PihcImctcHV0XCIpO1xuXHRwcml2YXRlIGZ1bGxzY3JlZW5CdG4gPSBnZTxIVE1MQnV0dG9uRWxlbWVudD4oXCJnLWZ1bGxzY3JlZW5cIik7XG5cdHByaXZhdGUgbG9nID0gZ2U8SFRNTFVMaXN0RWxlbWVudD4oXCJnLWxvZ1wiKTtcblx0cHJpdmF0ZSBzaG9ydE1zZyA9IGdlKFwiZy1zaG9ydF9tZXNzYWdlXCIpO1xuXHRwcml2YXRlIG1lc3NhZ2UgPSBnZShcImctbWVzc2FnZVwiKTtcblx0cHJpdmF0ZSBjYW52YXNDb250YWluZXIgPSBnZTxIVE1MQ2FudmFzRWxlbWVudD4oXCJnLWNhbnZhc19wYXJlbnRcIik7XG5cdHByaXZhdGUgY2FudmFzRWxlbSA9IGdlPEhUTUxDYW52YXNFbGVtZW50PihcImctY2FudmFzXCIpO1xuXHRjYW52YXMgPSBuZXcgTXlDYW52YXModGhpcy5jYW52YXNDb250YWluZXIsIHRoaXMuY2FudmFzRWxlbSk7XG5cblx0b25ab29tSW5DbGlja2VkID0gKCkgPT4geyB9O1xuXHRvblpvb21PdXRDbGlja2VkID0gKCkgPT4geyB9O1xuXHRvblB1dENsaWNrZWQgPSAoKSA9PiB7IH07XG5cdG9uRnVsbHNjcmVlbkNsaWNrZWQgPSAoKSA9PiB7IH07XG5cblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0b25DbGljayh0aGlzLnpvb21JbkJ0biwgKCkgPT4gdGhpcy5vblpvb21JbkNsaWNrZWQoKSk7XG5cdFx0b25DbGljayh0aGlzLnpvb21PdXRCdG4sICgpID0+IHRoaXMub25ab29tT3V0Q2xpY2tlZCgpKTtcblx0XHRvbkNsaWNrKHRoaXMucHV0QnRuLCAoKSA9PiB0aGlzLm9uUHV0Q2xpY2tlZCgpKTtcblx0XHRvbkNsaWNrKHRoaXMuZnVsbHNjcmVlbkJ0biwgKCkgPT4gdGhpcy5vbkZ1bGxzY3JlZW5DbGlja2VkKCkpO1xuXHR9XG5cdHNob3coKSB7XG5cdFx0dGhpcy5jb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZShcImhpZGVcIik7XG5cdH1cblx0aGlkZSgpIHtcblx0XHR0aGlzLmNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKFwiaGlkZVwiKTtcblx0fVxuXHRjbGVhckxvZygpIHtcblx0XHR0aGlzLmxvZy5pbm5lckhUTUwgPSBcIlwiO1xuXHR9XG5cdGFkZExvZyhtc2c6IHN0cmluZykge1xuXHRcdHRoaXMubG9nLmFwcGVuZENoaWxkKGNMSShtc2csIFtdKSk7XG5cdH1cblx0c2V0U2hvcnRNc2cobXNnOiBzdHJpbmcpIHtcblx0XHR0aGlzLnNob3J0TXNnLnRleHRDb250ZW50ID0gbXNnO1xuXHR9XG5cdHNldE1zZyhtc2c6IHN0cmluZykge1xuXHRcdHRoaXMubWVzc2FnZS50ZXh0Q29udGVudCA9IG1zZztcblx0fVxufVxuZXhwb3J0IGNsYXNzIFVJIHtcblx0cHJpdmF0ZSBtZW51ID0gbmV3IFVJX01lbnUoKTtcblx0cHJpdmF0ZSBnYW1lID0gbmV3IFVJX0dhbWUoKTtcblxuXHRvblBsYXlDbGlja2VkID0gKHR1cm5Db3VudDogbnVtYmVyLCBpc09ubGluZTogYm9vbGVhbikgPT4geyB9O1xuXHRvblpvb21JbkNsaWNrZWQgPSAoKSA9PiB7IH07XG5cdG9uWm9vbU91dENsaWNrZWQgPSAoKSA9PiB7IH07XG5cdG9uUHV0Q2xpY2tlZCA9ICgpID0+IHsgfTtcblx0b25GdWxsc2NyZWVuQ2xpY2tlZCA9ICgpID0+IHsgfTtcblxuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHR0aGlzLm1lbnUub25QbGF5Q2xpY2tlZCA9ICh0dXJuQ291bnQsIGlzT25saW5lKSA9PiB0aGlzLm9uUGxheUNsaWNrZWQodHVybkNvdW50LCBpc09ubGluZSk7XG5cdFx0dGhpcy5nYW1lLm9uWm9vbUluQ2xpY2tlZCA9ICgpID0+IHRoaXMub25ab29tSW5DbGlja2VkKCk7XG5cdFx0dGhpcy5nYW1lLm9uWm9vbU91dENsaWNrZWQgPSAoKSA9PiB0aGlzLm9uWm9vbU91dENsaWNrZWQoKTtcblx0XHR0aGlzLmdhbWUub25QdXRDbGlja2VkID0gKCkgPT4gdGhpcy5vblB1dENsaWNrZWQoKTtcblx0XHR0aGlzLmdhbWUub25GdWxsc2NyZWVuQ2xpY2tlZCA9ICgpID0+IHRoaXMub25GdWxsc2NyZWVuQ2xpY2tlZCgpO1xuXHR9XG5cblx0c2hvd01lbnUoKSB7XG5cdFx0dGhpcy5tZW51LnNob3coKTtcblx0XHR0aGlzLmdhbWUuaGlkZSgpO1xuXHR9XG5cdHNob3dHYW1lKCkge1xuXHRcdHRoaXMubWVudS5oaWRlKCk7XG5cdFx0dGhpcy5nYW1lLnNob3coKTtcblx0fVxuXHRjbGVhckxvZygpIHtcblx0XHR0aGlzLmdhbWUuY2xlYXJMb2coKTtcblx0fVxuXHRhZGRMb2cobXNnOiBzdHJpbmcpIHtcblx0XHR0aGlzLmdhbWUuYWRkTG9nKG1zZyk7XG5cdH1cblx0c2V0U2hvcnRNc2cobXNnOiBzdHJpbmcpIHtcblx0XHR0aGlzLmdhbWUuc2V0U2hvcnRNc2cobXNnKTtcblx0fVxuXHRzZXRNc2cobXNnOiBzdHJpbmcpIHtcblx0XHR0aGlzLmdhbWUuc2V0TXNnKG1zZyk7XG5cdH1cblx0Z2V0Q2FudmFzKCkge1xuXHRcdHJldHVybiB0aGlzLmdhbWUuY2FudmFzO1xuXHR9XG59IiwiZXhwb3J0IGZ1bmN0aW9uIGlzQ2hyb21lKCkge1xuXHRyZXR1cm4gbmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpLmluZGV4T2YoJ2Nocm9tZScpID4gLTE7XG59XG5cbi8vIG9uV2luZG93TG9hZGVkXG5leHBvcnQgZnVuY3Rpb24gb25Mb2FkKGZuOiAoKSA9PiBhbnkpIHtcblx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGZuKTtcbn1cbi8vIG9uQW5pbWF0aW9uRnJhbWVcbmV4cG9ydCBmdW5jdGlvbiBvbkFuaW0oZm46ICgpID0+IHsgY29udGludWU6IGJvb2xlYW4gfSkge1xuXHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24gdG1wKCkge1xuXHRcdGlmIChmbigpLmNvbnRpbnVlKSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodG1wKTtcblx0fSk7XG59IiwiaW1wb3J0IHsgTXlDYW52YXMgfSBmcm9tIFwiLi9teWNhbnZhc1wiO1xuXG5jb25zdCBjaHVua1NpemUgPSAxNjtcbmNvbnN0IG1pblN3aXBlTW92ZSA9IDU7XG5cbmV4cG9ydCBjb25zdCBlbnVtIENlbGwge1xuXHRub3RoaW5nLFxuXHRibGFjayxcblx0d2hpdGVcbn1cbmV4cG9ydCB0eXBlIFBpZWNlID0gQ2VsbC5ibGFjayB8IENlbGwud2hpdGU7XG5cbmNsYXNzIENlbGxDaHVuayB7XG5cdGNlbGxzOiBDZWxsW11bXVxuXHR4UG9zOiBudW1iZXIgLy8gLi4uLCAtY2h1bmtTaXplLCAwLCBjaHVua1NpemUsIGNodW5rU2l6ZSoyLCAuLi5cblx0eVBvczogbnVtYmVyIC8vIC4uLiwgLWNodW5rU2l6ZSwgMCwgY2h1bmtTaXplLCBjaHVua1NpemUqMiwgLi4uXG5cblx0Y29uc3RydWN0b3IoXG5cdFx0eFBvczogbnVtYmVyLFxuXHRcdHlQb3M6IG51bWJlcixcblx0KSB7XG5cdFx0dGhpcy54UG9zID0geFBvcztcblx0XHR0aGlzLnlQb3MgPSB5UG9zO1xuXHRcdHRoaXMuY2VsbHMgPSBuZXcgQXJyYXkoY2h1bmtTaXplKS5maWxsKDApLm1hcChcblx0XHRcdCgpID0+IG5ldyBBcnJheShjaHVua1NpemUpLmZpbGwoMCkubWFwKFxuXHRcdFx0XHQoKSA9PiBDZWxsLm5vdGhpbmdcblx0XHRcdClcblx0XHQpO1xuXHR9XG5cdHNvbWUoZm46ICh4OiBudW1iZXIsIHk6IG51bWJlcikgPT4gYm9vbGVhbik6IGJvb2xlYW4ge1xuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgY2h1bmtTaXplOyBpKyspIHtcblx0XHRcdGZvciAobGV0IGogPSAwOyBqIDwgY2h1bmtTaXplOyBqKyspIHtcblx0XHRcdFx0aWYgKGZuKGksIGopKSByZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cdHN1bShmbjogKHg6IG51bWJlciwgeTogbnVtYmVyKSA9PiBudW1iZXIpOiBudW1iZXIge1xuXHRcdGxldCBzdW0gPSAwO1xuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgY2h1bmtTaXplOyBpKyspIHtcblx0XHRcdGZvciAobGV0IGogPSAwOyBqIDwgY2h1bmtTaXplOyBqKyspIHtcblx0XHRcdFx0c3VtICs9IGZuKGksIGopO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gc3VtO1xuXHR9XG59XG5cbmNsYXNzIEJvYXJkIHtcblx0cHJpdmF0ZSBjaHVua3M6IE1hcDxudW1iZXIsIE1hcDxudW1iZXIsIENlbGxDaHVuaz4+IC8vIGtleTogLi4uLCAtY2h1bmtTaXplLCAwLCBjaHVua1NpemUsIGNodW5rU2l6ZSoyLCAuLi5cblxuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHR0aGlzLmNodW5rcyA9IG5ldyBNYXAoKTtcblx0fVxuXHRnZXRDZWxsKHg6IG51bWJlciwgeTogbnVtYmVyKTogQ2VsbCB7XG5cdFx0Y29uc3QgcG9zWCA9IHF1YW50aXplKHgsIGNodW5rU2l6ZSk7XG5cdFx0Y29uc3QgcG9zWSA9IHF1YW50aXplKHksIGNodW5rU2l6ZSk7XG5cblx0XHRsZXQgdG1wID0gdGhpcy5jaHVua3MuZ2V0KHBvc1gucXVhbnRpemVkKTtcblx0XHRpZiAoIXRtcClcblx0XHRcdHJldHVybiBDZWxsLm5vdGhpbmc7XG5cblx0XHRsZXQgY2h1bmsgPSB0bXAuZ2V0KHBvc1kucXVhbnRpemVkKTtcblx0XHRpZiAoIWNodW5rKVxuXHRcdFx0cmV0dXJuIENlbGwubm90aGluZztcblxuXHRcdHJldHVybiBjaHVuay5jZWxsc1twb3NYLm1vZF1bcG9zWS5tb2RdO1xuXHR9XG5cdHNldENlbGwoeDogbnVtYmVyLCB5OiBudW1iZXIsIGNlbGw6IENlbGwpOiB2b2lkIHtcblx0XHRjb25zdCBwb3NYID0gcXVhbnRpemUoeCwgY2h1bmtTaXplKTtcblx0XHRjb25zdCBwb3NZID0gcXVhbnRpemUoeSwgY2h1bmtTaXplKTtcblxuXHRcdGxldCB0bXAgPSB0aGlzLmNodW5rcy5nZXQocG9zWC5xdWFudGl6ZWQpO1xuXHRcdGlmICghdG1wKVxuXHRcdFx0dGhpcy5jaHVua3Muc2V0KFxuXHRcdFx0XHRwb3NYLnF1YW50aXplZCxcblx0XHRcdFx0dG1wID0gbmV3IE1hcCgpXG5cdFx0XHQpO1xuXG5cdFx0bGV0IGNodW5rID0gdG1wLmdldChwb3NZLnF1YW50aXplZCk7XG5cdFx0aWYgKCFjaHVuaylcblx0XHRcdHRtcC5zZXQoXG5cdFx0XHRcdHBvc1kucXVhbnRpemVkLFxuXHRcdFx0XHRjaHVuayA9IG5ldyBDZWxsQ2h1bmsocG9zWC5xdWFudGl6ZWQsIHBvc1kucXVhbnRpemVkKVxuXHRcdFx0KTtcblxuXHRcdGNodW5rLmNlbGxzW3Bvc1gubW9kXVtwb3NZLm1vZF0gPSBjZWxsO1xuXHR9XG5cdHNvbWUoZm46ICh4OiBudW1iZXIsIHk6IG51bWJlcikgPT4gYm9vbGVhbik6IGJvb2xlYW4ge1xuXHRcdGZvciAoY29uc3QgYyBvZiB0aGlzLmNodW5rcy52YWx1ZXMoKSkge1xuXHRcdFx0Zm9yIChjb25zdCBjaHVuayBvZiBjLnZhbHVlcygpKSB7XG5cdFx0XHRcdGNvbnN0IGNodW5rX3hQb3MgPSBjaHVuay54UG9zO1xuXHRcdFx0XHRjb25zdCBjaHVua195UG9zID0gY2h1bmsueVBvcztcblx0XHRcdFx0aWYgKGNodW5rLnNvbWUoKHgsIHkpID0+IGZuKHggKyBjaHVua194UG9zLCB5ICsgY2h1bmtfeVBvcykpKVxuXHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblx0c3VtKGZuOiAoeDogbnVtYmVyLCB5OiBudW1iZXIpID0+IG51bWJlcik6IG51bWJlciB7XG5cdFx0bGV0IHN1bSA9IDA7XG5cdFx0Zm9yIChjb25zdCBjIG9mIHRoaXMuY2h1bmtzLnZhbHVlcygpKSB7XG5cdFx0XHRmb3IgKGNvbnN0IGNodW5rIG9mIGMudmFsdWVzKCkpIHtcblx0XHRcdFx0Y29uc3QgY2h1bmtfeFBvcyA9IGNodW5rLnhQb3M7XG5cdFx0XHRcdGNvbnN0IGNodW5rX3lQb3MgPSBjaHVuay55UG9zO1xuXHRcdFx0XHRzdW0gKz0gY2h1bmsuc3VtKCh4LCB5KSA9PiBmbih4ICsgY2h1bmtfeFBvcywgeSArIGNodW5rX3lQb3MpKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHN1bTtcblx0fVxuXHRyZXNldCgpOiB2b2lkIHtcblx0XHR0aGlzLmNodW5rcyA9IG5ldyBNYXAoKTtcblx0fVxufVxuXG50eXBlIERpMkQgPSBbbnVtYmVyLCBudW1iZXJdOyAvLyBEaXJlY3Rpb24gMkRcbmNvbnN0IGRpODogRGkyRFtdXG5cdD0gW1stMSwgLTFdLCBbLTEsIDBdLCBbLTEsIDFdLCBbMCwgLTFdLCBbMCwgMV0sIFsxLCAtMV0sIFsxLCAwXSwgWzEsIDFdXTtcblxuZXhwb3J0IGNsYXNzIFJldmVyc2lCb2FyZCBleHRlbmRzIEJvYXJkIHtcblx0b25BZnRlclB1dCA9ICh4OiBudW1iZXIsIHk6IG51bWJlciwgcGllY2U6IFBpZWNlKSA9PiB7IH07XG5cdGNvbnN0cnVjdG9yKGluaXRpYWxpemUgPSB0cnVlKSB7XG5cdFx0c3VwZXIoKTtcblx0XHRpZiAoaW5pdGlhbGl6ZSlcblx0XHRcdHRoaXMucmVzZXQoKTtcblx0fVxuXHRyZXNldCgpOiB2b2lkIHtcblx0XHRzdXBlci5yZXNldCgpO1xuXG5cdFx0Ly8g4peLIOKXjyA6IFdoaXRlIEJsYWNrXG5cdFx0Ly8g4pePIOKXiyA6IEJsYWNrIFdoaXRlXG5cdFx0dGhpcy5zZXRDZWxsKDAsIDAsIENlbGwud2hpdGUpO1xuXHRcdHRoaXMuc2V0Q2VsbCgtMSwgLTEsIENlbGwud2hpdGUpO1xuXHRcdHRoaXMuc2V0Q2VsbCgtMSwgMCwgQ2VsbC5ibGFjayk7XG5cdFx0dGhpcy5zZXRDZWxsKDAsIC0xLCBDZWxsLmJsYWNrKTtcblx0fVxuXHRjYW5QdXQoeDogbnVtYmVyLCB5OiBudW1iZXIsIHBpZWNlOiBQaWVjZSk6IGJvb2xlYW4ge1xuXHRcdGlmICh0aGlzLmdldENlbGwoeCwgeSkgIT09IENlbGwubm90aGluZylcblx0XHRcdHJldHVybiBmYWxzZTtcblxuXHRcdGNvbnN0IG9wcG9uZW50ID0gb3Bwb25lbnRQaWVjZShwaWVjZSk7XG5cdFx0cmV0dXJuIGRpOC5zb21lKGRpID0+IHRoaXMuY2FuUmV2ZXJzZURpKHgsIHksIHBpZWNlLCBkaSkpO1xuXHR9XG5cdGNhblB1dFNvbWV3aGVyZShwaWVjZTogUGllY2UpOiBib29sZWFuIHtcblx0XHQvLyBUT0RPOiBQZXJmb3JtYW5jZSBpbXByb3ZlbWVudFxuXHRcdHJldHVybiB0aGlzLnNvbWUoKHgsIHkpID0+IHRoaXMuY2FuUHV0KHgsIHksIHBpZWNlKSk7XG5cdH1cblx0Y291bnRQaWVjZShwaWVjZTogUGllY2UpOiBudW1iZXIge1xuXHRcdC8vIFRPRE86IFBlcmZvcm1hbmNlIGltcHJvdmVtZW50XG5cdFx0cmV0dXJuIHRoaXMuc3VtKCh4LCB5KSA9PiB0aGlzLmdldENlbGwoeCwgeSkgPT09IHBpZWNlID8gMSA6IDApO1xuXHR9XG5cdHB1dCh4OiBudW1iZXIsIHk6IG51bWJlciwgcGllY2U6IFBpZWNlKTogdm9pZCB7XG5cdFx0aWYgKCF0aGlzLmNhblB1dCh4LCB5LCBwaWVjZSkpIHRocm93IFwiQlVHXCI7XG5cdFx0ZGk4LmZvckVhY2goZGkgPT4ge1xuXHRcdFx0aWYgKHRoaXMuY2FuUmV2ZXJzZURpKHgsIHksIHBpZWNlLCBkaSkpXG5cdFx0XHRcdHRoaXMucmV2ZXJzZURpKHgsIHksIHBpZWNlLCBkaSk7XG5cdFx0fSk7XG5cdFx0dGhpcy5zZXRDZWxsKHgsIHksIHBpZWNlKTtcblx0XHR0aGlzLm9uQWZ0ZXJQdXQoeCwgeSwgcGllY2UpO1xuXHR9XG5cdGlzRmluaXNoZWQoKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuICF0aGlzLmNhblB1dFNvbWV3aGVyZShDZWxsLmJsYWNrKSAmJiAhdGhpcy5jYW5QdXRTb21ld2hlcmUoQ2VsbC53aGl0ZSk7XG5cdH1cblx0Ly8gW3grZGlbMF0sIHkrZGlbMV1dIOS7pemZjeOBrumDqOWIhuOBruOBv+OCkuimi+OBpuWIpOaWreOBl+OBvuOBmeOAglxuXHRwcml2YXRlIGNhblJldmVyc2VEaSh4OiBudW1iZXIsIHk6IG51bWJlciwgcGllY2U6IFBpZWNlLCBkaTogRGkyRCk6IGJvb2xlYW4ge1xuXHRcdGNvbnN0IG9wcG9uZW50ID0gb3Bwb25lbnRQaWVjZShwaWVjZSk7XG5cblx0XHRsZXQgY1ggPSB4LCBjWSA9IHk7XG5cdFx0bGV0IGNudCA9IDA7XG5cdFx0d2hpbGUgKHRydWUpIHtcblx0XHRcdGNYICs9IGRpWzBdOyBjWSArPSBkaVsxXTtcblx0XHRcdGNvbnN0IGNDZWxsID0gdGhpcy5nZXRDZWxsKGNYLCBjWSk7XG5cdFx0XHRpZiAoY0NlbGwgPT09IG9wcG9uZW50KVxuXHRcdFx0XHRjbnQrKztcblx0XHRcdGVsc2UgaWYgKGNDZWxsID09PSBwaWVjZSlcblx0XHRcdFx0cmV0dXJuIGNudCA+IDA7XG5cdFx0XHRlbHNlXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdH1cblx0cHJpdmF0ZSByZXZlcnNlRGkoeDogbnVtYmVyLCB5OiBudW1iZXIsIHBpZWNlOiBQaWVjZSwgZGk6IERpMkQpOiB2b2lkIHtcblx0XHRjb25zdCBvcHBvbmVudCA9IG9wcG9uZW50UGllY2UocGllY2UpO1xuXG5cdFx0bGV0IGNYID0geCwgY1kgPSB5O1xuXHRcdGxldCBjbnQgPSAwO1xuXHRcdHdoaWxlICh0cnVlKSB7XG5cdFx0XHRjWCArPSBkaVswXTsgY1kgKz0gZGlbMV07XG5cdFx0XHRjb25zdCBjQ2VsbCA9IHRoaXMuZ2V0Q2VsbChjWCwgY1kpO1xuXHRcdFx0aWYgKGNDZWxsID09PSBvcHBvbmVudClcblx0XHRcdFx0dGhpcy5zZXRDZWxsKGNYLCBjWSwgcGllY2UpO1xuXHRcdFx0ZWxzZSBpZiAoY0NlbGwgPT09IHBpZWNlKVxuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHRlbHNlXG5cdFx0XHRcdHRocm93IFwiQlVHXCI7XG5cdFx0fVxuXHR9XG59XG5cbi8vIFRPRE86IHNldENlbGwg44Gn44Gv44CB6Ieq5YuV55qE44GqIHJlbmRlciDjgYzooYzjgo/jgozjgarjgYTku7ZcbmV4cG9ydCBjbGFzcyBEcmF3YWJsZVJldmVyc2lCb2FyZCBleHRlbmRzIFJldmVyc2lCb2FyZCB7XG5cdHByaXZhdGUgY2FudmFzOiBNeUNhbnZhcyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcblx0cHJpdmF0ZSBjZWxsU2l6ZSA9IDE7XG5cdHByaXZhdGUgb3JpZ2luUGl4ZWw6IFtudW1iZXIsIG51bWJlcl0gPSBbMCwgMF07IC8vIOebpOmdouOBrlswLDBd44GM44Gp44GT44Gu5bqn5qiZ44Gr5o+P55S744GV44KM44KL44G544GN44GL44KS56S644GZ44CCWzAsMF3jgarjgonjgbDjgIFjYW52YXPjga7kuK3lpK7jgYvjgolbMCwwXeW5s+ihjOenu+WLleOBl+OBn+S9jee9ruOBq+aPj+eUu+OBmeOCi+OAglxuXHRwcml2YXRlIHNlbGVjdGVkOiB1bmRlZmluZWQgfCBbbnVtYmVyLCBudW1iZXJdID0gdW5kZWZpbmVkO1xuXHRwcml2YXRlIHBsYXllclBpZWNlOiBQaWVjZSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcblx0bWF4VHVybkNvdW50OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG5cblx0b25DZWxsQ2xpY2tlZCA9ICh4OiBudW1iZXIsIHk6IG51bWJlcikgPT4geyB9O1xuXG5cdGJpbmRDYW52YXMoY2FudmFzOiBNeUNhbnZhcykge1xuXHRcdHRoaXMuY2FudmFzID0gY2FudmFzO1xuXHRcdGNvbnN0IF9vbkNhbnZhc1Jlc2l6ZSA9IGNhbnZhcy5vblJlc2l6ZTtcblx0XHRjYW52YXMub25SZXNpemUgPSAoKSA9PiB7XG5cdFx0XHRfb25DYW52YXNSZXNpemUuYXBwbHkoY2FudmFzKTtcblx0XHRcdHRoaXMucmVuZGVyKCk7XG5cdFx0fTtcblxuXHRcdGxldCBzdGFydFBvcyA9IFswLCAwXTtcblx0XHRjYW52YXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJwb2ludGVyZG93blwiLCBlID0+IHtcblx0XHRcdHN0YXJ0UG9zID0gW2Uub2Zmc2V0WCwgZS5vZmZzZXRZXTtcblx0XHR9KTtcblx0XHRjYW52YXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJwb2ludGVybW92ZVwiLCBlID0+IHtcblx0XHRcdGlmIChlLmJ1dHRvbnMgPiAwKSB7XG5cdFx0XHRcdGNvbnN0IG9mZnNldDogW251bWJlciwgbnVtYmVyXSA9IFtcblx0XHRcdFx0XHQoZS5vZmZzZXRYIC0gc3RhcnRQb3NbMF0pICogY2FudmFzLmRwcixcblx0XHRcdFx0XHQoZS5vZmZzZXRZIC0gc3RhcnRQb3NbMV0pICogY2FudmFzLmRwcl07XG5cdFx0XHRcdGNvbnN0IG5ld09yaWdpblBpeGVsOiBbbnVtYmVyLCBudW1iZXJdID0gW1xuXHRcdFx0XHRcdG9mZnNldFswXSArIHRoaXMub3JpZ2luUGl4ZWxbMF0sXG5cdFx0XHRcdFx0b2Zmc2V0WzFdICsgdGhpcy5vcmlnaW5QaXhlbFsxXV07XG5cdFx0XHRcdHRoaXMucmVuZGVyKG5ld09yaWdpblBpeGVsKTtcblx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdGNhbnZhcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcInBvaW50ZXJ1cFwiLCBlID0+IHtcblx0XHRcdGNvbnN0IG9mZnNldDogW251bWJlciwgbnVtYmVyXSA9IFtcblx0XHRcdFx0KGUub2Zmc2V0WCAtIHN0YXJ0UG9zWzBdKSAqIGNhbnZhcy5kcHIsXG5cdFx0XHRcdChlLm9mZnNldFkgLSBzdGFydFBvc1sxXSkgKiBjYW52YXMuZHByXTtcblx0XHRcdGlmIChNYXRoLmh5cG90KC4uLm9mZnNldCkgPCBtaW5Td2lwZU1vdmUpIHtcblx0XHRcdFx0Ly8gc2VsZWN0XG5cdFx0XHRcdGNvbnN0IHBvcyA9IHRoaXMucGl4ZWwyY2VsbChzdGFydFBvc1swXSAqIGNhbnZhcy5kcHIsIHN0YXJ0UG9zWzFdICogY2FudmFzLmRwcik7XG5cdFx0XHRcdHRoaXMuc2VsZWN0ZWQgPSBbTWF0aC5mbG9vcihwb3MueCksIE1hdGguZmxvb3IocG9zLnkpXTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNvbnN0IG5ld09yaWdpblBpeGVsOiBbbnVtYmVyLCBudW1iZXJdID0gW1xuXHRcdFx0XHRcdG9mZnNldFswXSArIHRoaXMub3JpZ2luUGl4ZWxbMF0sXG5cdFx0XHRcdFx0b2Zmc2V0WzFdICsgdGhpcy5vcmlnaW5QaXhlbFsxXV07XG5cdFx0XHRcdHRoaXMub3JpZ2luUGl4ZWwgPSBuZXdPcmlnaW5QaXhlbDtcblx0XHRcdH1cblx0XHRcdHRoaXMucmVuZGVyKCk7XG5cdFx0fSk7XG5cblx0XHR0aGlzLnJlbmRlcigpO1xuXHR9XG5cdGdldENlbGxTaXplKCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMuY2VsbFNpemU7XG5cdH1cblx0c2V0Q2VsbFNpemUocGl4ZWxzOiBudW1iZXIpOiB2b2lkIHtcblx0XHRjb25zdCBmYWN0b3IgPSBwaXhlbHMgLyB0aGlzLmNlbGxTaXplO1xuXHRcdHRoaXMub3JpZ2luUGl4ZWwgPSBbXG5cdFx0XHR0aGlzLm9yaWdpblBpeGVsWzBdICogZmFjdG9yLFxuXHRcdFx0dGhpcy5vcmlnaW5QaXhlbFsxXSAqIGZhY3Rvcixcblx0XHRdXG5cdFx0dGhpcy5jZWxsU2l6ZSA9IHBpeGVscztcblx0XHR0aGlzLnJlbmRlcigpO1xuXHR9XG5cdGdldHBsYXllclBpZWNlKCk6IFBpZWNlIHwgdW5kZWZpbmVkIHtcblx0XHRyZXR1cm4gdGhpcy5wbGF5ZXJQaWVjZTtcblx0fVxuXHRzZXRQbGF5ZXJQaWVjZShwaWVjZTogUGllY2UgfCB1bmRlZmluZWQpIHtcblx0XHR0aGlzLnBsYXllclBpZWNlID0gcGllY2U7XG5cdFx0dGhpcy5yZW5kZXIoKTtcblx0fVxuXHRnZXRTZWxlY3RlZCgpOiB7IHg6IG51bWJlciwgeTogbnVtYmVyIH0gfCB1bmRlZmluZWQge1xuXHRcdGlmICh0aGlzLnNlbGVjdGVkKSByZXR1cm4geyB4OiB0aGlzLnNlbGVjdGVkWzBdLCB5OiB0aGlzLnNlbGVjdGVkWzFdIH07XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxuXHRzZXRTZWxlY3RlZChwb3M6IHsgeDogbnVtYmVyLCB5OiBudW1iZXIgfSB8IHVuZGVmaW5lZCkge1xuXHRcdGlmIChwb3MpIHRoaXMuc2VsZWN0ZWQgPSBbcG9zLngsIHBvcy55XTtcblx0XHRlbHNlIHRoaXMuc2VsZWN0ZWQgPSB1bmRlZmluZWQ7XG5cdH1cblx0cHV0KHg6IG51bWJlciwgeTogbnVtYmVyLCBwaWVjZTogUGllY2UpOiB2b2lkIHtcblx0XHRzdXBlci5wdXQoeCwgeSwgcGllY2UpO1xuXHRcdHRoaXMucmVuZGVyKCk7XG5cdH1cblx0cmVuZGVyKG9yaWdpblBpeGVsID0gdGhpcy5vcmlnaW5QaXhlbCwgcGxheWVyUGllY2UgPSB0aGlzLnBsYXllclBpZWNlKSB7XG5cdFx0aWYgKCF0aGlzLmNhbnZhcykgcmV0dXJuO1xuXHRcdGNvbnN0XG5cdFx0XHRjYW52YXMgPSB0aGlzLmNhbnZhcyxcblx0XHRcdHdpZHRoID0gY2FudmFzLndpZHRoLFxuXHRcdFx0aGVpZ2h0ID0gY2FudmFzLmhlaWdodCxcblx0XHRcdGNlbGxTaXplID0gdGhpcy5jZWxsU2l6ZTtcblx0XHRjb25zdCBjZWxsMnBpeGVsID0gKHg6IG51bWJlciwgeTogbnVtYmVyKSA9PiB0aGlzLmNlbGwycGl4ZWwoeCwgeSwgb3JpZ2luUGl4ZWwpO1xuXHRcdGNvbnN0IHBpeGVsMmNlbGwgPSAoeDogbnVtYmVyLCB5OiBudW1iZXIpID0+IHRoaXMucGl4ZWwyY2VsbCh4LCB5LCBvcmlnaW5QaXhlbCk7XG5cdFx0Y29uc3QgYm9hcmRWUCA9IHsgLy8gdmlld3BvcnRcblx0XHRcdGxlZnQ6IE1hdGguZmxvb3IocGl4ZWwyY2VsbCgwLCAwKS54KSxcblx0XHRcdHRvcDogTWF0aC5mbG9vcihwaXhlbDJjZWxsKDAsIDApLnkpLFxuXHRcdFx0cmlnaHQ6IE1hdGguY2VpbChwaXhlbDJjZWxsKHdpZHRoLCBoZWlnaHQpLngpLFxuXHRcdFx0Ym90dG9tOiBNYXRoLmNlaWwocGl4ZWwyY2VsbCh3aWR0aCwgaGVpZ2h0KS55KSxcblx0XHR9O1xuXG5cdFx0Ly8gcmVuZGVyXG5cblx0XHQvLyAxLiBiYWNrZ3JvdW5kXG5cdFx0Y2FudmFzLmZpbGxBbGwoXCIjZWVlXCIpO1xuXG5cdFx0Ly8gMi4gc2VsZWN0ZWQgY2VsbFxuXHRcdGlmICh0aGlzLnNlbGVjdGVkKSB7XG5cdFx0XHRjb25zdCBwaXhlbCA9IGNlbGwycGl4ZWwodGhpcy5zZWxlY3RlZFswXSwgdGhpcy5zZWxlY3RlZFsxXSk7XG5cdFx0XHRjYW52YXMuYmVnaW5QYXRoKCk7XG5cdFx0XHR0aGlzLmNhbnZhcy5yZWN0KHBpeGVsLmxlZnQsIHBpeGVsLnRvcCwgY2VsbFNpemUsIGNlbGxTaXplKTtcblx0XHRcdGNhbnZhcy5maWxsKFwiI2NkY1wiKTtcblx0XHR9XG5cblx0XHQvLyAzLiBncmlkIGxpbmVzXG5cdFx0Zm9yIChsZXQgeCA9IGJvYXJkVlAubGVmdDsgeCA8PSBib2FyZFZQLnJpZ2h0OyB4KyspIHtcblx0XHRcdGNvbnN0IHhQaXhlbCA9IGNlbGwycGl4ZWwoeCwgMCkubGVmdDtcblx0XHRcdGNhbnZhcy5iZWdpblBhdGgoKTtcblx0XHRcdHRoaXMuY2FudmFzLmxpbmUoeFBpeGVsLCAwLCB4UGl4ZWwsIGhlaWdodCk7XG5cdFx0XHRjYW52YXMuc3Ryb2tlKHggJSBjaHVua1NpemUgPT0gMCA/IFwiIzhiOFwiIDogXCIjYmRiXCIpO1xuXHRcdH1cblx0XHRmb3IgKGxldCB5ID0gYm9hcmRWUC50b3A7IHkgPD0gYm9hcmRWUC5ib3R0b207IHkrKykge1xuXHRcdFx0Y29uc3QgeVBpeGVsID0gY2VsbDJwaXhlbCgwLCB5KS50b3A7XG5cdFx0XHRjYW52YXMuYmVnaW5QYXRoKCk7XG5cdFx0XHR0aGlzLmNhbnZhcy5saW5lKDAsIHlQaXhlbCwgd2lkdGgsIHlQaXhlbCk7XG5cdFx0XHRjYW52YXMuc3Ryb2tlKHkgJSBjaHVua1NpemUgPT0gMCA/IFwiIzhiOFwiIDogXCIjYmRiXCIpO1xuXHRcdH1cblxuXHRcdC8vIDQuIHBpZWNlcyAmIHB1dHRhYmxlIGNlbGxzIFxuXHRcdGNvbnN0XG5cdFx0XHRyYWRpdXMgPSAoY2VsbFNpemUgLyAyKSAqIDAuOCxcblx0XHRcdHN1Z2dlc3RSYWRpdXMgPSBNYXRoLm1heCgxLCByYWRpdXMgKiAwLjIpO1xuXHRcdGZvciAobGV0IHggPSBib2FyZFZQLmxlZnQ7IHggPD0gYm9hcmRWUC5yaWdodDsgeCsrKSB7XG5cdFx0XHRmb3IgKGxldCB5ID0gYm9hcmRWUC50b3A7IHkgPD0gYm9hcmRWUC5ib3R0b207IHkrKykge1xuXHRcdFx0XHRjb25zdCBwaXhlbCA9IGNlbGwycGl4ZWwoeCwgeSk7XG5cdFx0XHRcdGNvbnN0XG5cdFx0XHRcdFx0Y2VudGVyWCA9IHBpeGVsLmxlZnQgKyBjZWxsU2l6ZSAvIDIsXG5cdFx0XHRcdFx0Y2VudGVyWSA9IHBpeGVsLnRvcCArIGNlbGxTaXplIC8gMjtcblxuXHRcdFx0XHRjb25zdCBwaWVjZSA9IHRoaXMuZ2V0Q2VsbCh4LCB5KTtcblx0XHRcdFx0aWYgKHBpZWNlID09PSBDZWxsLmJsYWNrKSB7XG5cdFx0XHRcdFx0Y2FudmFzLmJlZ2luUGF0aCgpO1xuXHRcdFx0XHRcdHRoaXMuY2FudmFzLnJvdW5kKGNlbnRlclgsIGNlbnRlclksIHJhZGl1cyk7XG5cdFx0XHRcdFx0Y2FudmFzLmZpbGwoXCIjNTU1XCIpO1xuXHRcdFx0XHR9IGVsc2UgaWYgKHBpZWNlID09PSBDZWxsLndoaXRlKSB7XG5cdFx0XHRcdFx0Y2FudmFzLmJlZ2luUGF0aCgpO1xuXHRcdFx0XHRcdHRoaXMuY2FudmFzLnJvdW5kKGNlbnRlclgsIGNlbnRlclksIHJhZGl1cyk7XG5cdFx0XHRcdFx0Y2FudmFzLnN0cm9rZShcIiM1NTVcIik7XG5cdFx0XHRcdH0gZWxzZSBpZiAocGllY2UgPT09IENlbGwubm90aGluZykge1xuXHRcdFx0XHRcdGlmIChwbGF5ZXJQaWVjZSAmJiB0aGlzLmNhblB1dCh4LCB5LCBwbGF5ZXJQaWVjZSkpIHtcblx0XHRcdFx0XHRcdGNhbnZhcy5iZWdpblBhdGgoKTtcblx0XHRcdFx0XHRcdHRoaXMuY2FudmFzLnJvdW5kKGNlbnRlclgsIGNlbnRlclksIHN1Z2dlc3RSYWRpdXMpO1xuXHRcdFx0XHRcdFx0Y2FudmFzLmZpbGwoXCIjNTU1XCIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHRocm93IFwiQlVHXCI7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHByaXZhdGUgY2VsbDJwaXhlbCh4OiBudW1iZXIsIHk6IG51bWJlciwgb3JpZ2luUGl4ZWwgPSB0aGlzLm9yaWdpblBpeGVsKSB7XG5cdFx0aWYgKCF0aGlzLmNhbnZhcykgdGhyb3cgXCJCVUdcIjtcblx0XHRjb25zdFxuXHRcdFx0Y2FudmFzID0gdGhpcy5jYW52YXMsXG5cdFx0XHR3aWR0aCA9IGNhbnZhcy53aWR0aCxcblx0XHRcdGhlaWdodCA9IGNhbnZhcy5oZWlnaHQsXG5cdFx0XHRjZWxsU2l6ZSA9IHRoaXMuY2VsbFNpemU7XG5cdFx0cmV0dXJuICh7XG5cdFx0XHRsZWZ0OiBvcmlnaW5QaXhlbFswXSArIHggKiBjZWxsU2l6ZSArIHdpZHRoIC8gMixcblx0XHRcdHRvcDogb3JpZ2luUGl4ZWxbMV0gKyB5ICogY2VsbFNpemUgKyBoZWlnaHQgLyAyLFxuXHRcdH0pXG5cdH07XG5cdHByaXZhdGUgcGl4ZWwyY2VsbCh4OiBudW1iZXIsIHk6IG51bWJlciwgb3JpZ2luUGl4ZWwgPSB0aGlzLm9yaWdpblBpeGVsKSB7XG5cdFx0aWYgKCF0aGlzLmNhbnZhcykgdGhyb3cgXCJCVUdcIjtcblx0XHRjb25zdFxuXHRcdFx0Y2FudmFzID0gdGhpcy5jYW52YXMsXG5cdFx0XHR3aWR0aCA9IGNhbnZhcy53aWR0aCxcblx0XHRcdGhlaWdodCA9IGNhbnZhcy5oZWlnaHQsXG5cdFx0XHRjZWxsU2l6ZSA9IHRoaXMuY2VsbFNpemU7XG5cdFx0cmV0dXJuICh7XG5cdFx0XHR4OiAoeCAtIHdpZHRoIC8gMiAtIG9yaWdpblBpeGVsWzBdKSAvIGNlbGxTaXplLFxuXHRcdFx0eTogKHkgLSBoZWlnaHQgLyAyIC0gb3JpZ2luUGl4ZWxbMV0pIC8gY2VsbFNpemUsXG5cdFx0fSk7XG5cdH1cbn1cblxuZnVuY3Rpb24gcXVhbnRpemUobnVtOiBudW1iZXIsIGRpdmlzb3I6IG51bWJlcikge1xuXHRjb25zdCBxdWFudGl6ZWQgPSBNYXRoLmZsb29yKG51bSAvIGRpdmlzb3IpICogZGl2aXNvcjtcblx0Y29uc3QgbW9kID0gbnVtIC0gcXVhbnRpemVkO1xuXHRyZXR1cm4geyBxdWFudGl6ZWQsIG1vZCB9O1xufVxuZXhwb3J0IGZ1bmN0aW9uIG9wcG9uZW50UGllY2UocGllY2U6IFBpZWNlKTogUGllY2Uge1xuXHRpZiAocGllY2UgPT09IENlbGwuYmxhY2spIHJldHVybiBDZWxsLndoaXRlO1xuXHRpZiAocGllY2UgPT09IENlbGwud2hpdGUpIHJldHVybiBDZWxsLmJsYWNrO1xuXHR0aHJvdyBcIkJVR1wiO1xufVxuIiwiaW1wb3J0IHsgVUkgfSBmcm9tIFwiLi91aVwiO1xuaW1wb3J0IHsgb25Mb2FkLCBpc0Nocm9tZSB9IGZyb20gXCIuL3V0aWxcIjtcbmltcG9ydCB7IERyYXdhYmxlUmV2ZXJzaUJvYXJkLCBDZWxsLCBvcHBvbmVudFBpZWNlLCBSZXZlcnNpQm9hcmQsIFBpZWNlIH0gZnJvbSBcIi4vcmV2ZXJzaVwiO1xuXG5mdW5jdGlvbiBzaG93Q29uc29sZUJhbm5lcigpIHtcblx0aWYgKGlzQ2hyb21lKCkpIHtcblx0XHRjb25zb2xlLmxvZyhcblx0XHRcdFwiXFxuXCIgK1xuXHRcdFx0XCIlYyAlYyBJbmZpbml0ZSBSZXZlcnNpIFxcblwiICtcblx0XHRcdFwiJWMgJWMgTWFkZSBieSBvbWFzYWt1biBvbiAyMDE5XFxuXCIgK1xuXHRcdFx0XCIlYyAlYyBHaXRIdWI6IGh0dHBzOi8vZ2l0aHViLmNvbS9vbWFzYWt1bi9pbmZfcmV2ZXJzaVxcblwiICtcblx0XHRcdFwiJWMgJWMgRW5qb3khXFxuXCIsXG5cdFx0XHRcImNvbG9yOiAjMTMwZjQwOyBiYWNrZ3JvdW5kLWNvbG9yOiAjYTc5OWVmOyBsaW5lLWhlaWdodDogMjtcIixcblx0XHRcdFwiY29sb3I6ICNkZGQ2ZmY7IGJhY2tncm91bmQtY29sb3I6ICM1MjQ5ODM7IGxpbmUtaGVpZ2h0OiAyO1wiLFxuXHRcdFx0XCJjb2xvcjogIzEzMGY0MDsgYmFja2dyb3VuZC1jb2xvcjogI2E3OTllZjsgbGluZS1oZWlnaHQ6IDEuNTtcIixcblx0XHRcdFwiXCIsXG5cdFx0XHRcImNvbG9yOiAjMTMwZjQwOyBiYWNrZ3JvdW5kLWNvbG9yOiAjYTc5OWVmOyBsaW5lLWhlaWdodDogMS41O1wiLFxuXHRcdFx0XCJcIixcblx0XHRcdFwiY29sb3I6ICMxMzBmNDA7IGJhY2tncm91bmQtY29sb3I6ICNhNzk5ZWY7IGxpbmUtaGVpZ2h0OiAxLjU7XCIsXG5cdFx0XHRcImZvbnQtd2VpZ2h0OiBib2xkXCJcblx0XHQpO1xuXHR9IGVsc2Uge1xuXHRcdGNvbnNvbGUubG9nKFxuXHRcdFx0XCJcXG5cIiArXG5cdFx0XHRcIuKUgyAjIyMgSW5maW5pdGUgUmV2ZXJzaSAjIyMgXFxuXCIgK1xuXHRcdFx0XCLilIMgXFxuXCIgK1xuXHRcdFx0XCLilIMgTWFkZSBieSBvbWFzYWt1biBvbiAyMDE5XFxuXCIgK1xuXHRcdFx0XCLilIMgR2l0SHViOiBodHRwczovL2dpdGh1Yi5jb20vb21hc2FrdW5cXG5cIiArXG5cdFx0XHRcIuKUgyBFbmpveSFcXG5cIlxuXHRcdCk7XG5cdH1cbn1cblxuZnVuY3Rpb24gZ2V0Um9vbUlEKCkge1xuXHRpZiAobG9jYXRpb24uc2VhcmNoID09PSBcIlwiIHx8IGxvY2F0aW9uLnNlYXJjaC5pbmNsdWRlcyhcIiZcIikpIHJldHVybiBcIlwiO1xuXHRlbHNlIHJldHVybiBsb2NhdGlvbi5zZWFyY2guc3Vic3RyKDEpO1xufVxuXG5mdW5jdGlvbiBpZDJ3cyhpZDogc3RyaW5nKSB7XG5cdGNvbnN0IHdzID0gbmV3IFdlYlNvY2tldChcIndzczovL2Nvbm5lY3Qud2Vic29ja2V0LmluL2luZl9yZXZlcnNpP3Jvb21faWQ9XCIgKyBpZCk7XG5cdHdzLmFkZEV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLCBlID0+IGNvbnNvbGUubG9nKGUpKTtcblx0cmV0dXJuIHdzO1xufVxuXG5mdW5jdGlvbiB1dWlkKCkge1xuXHRyZXR1cm4gKE1hdGgucmFuZG9tKCkudG9TdHJpbmcoKSArIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoKSkucmVwbGFjZSgvMFxcLi9nLCBcIlwiKS5zdWJzdHIoMSwgMjApO1xufVxuXG5mdW5jdGlvbiBpZDJwdWJsaXNoVVJMKGlkOiBzdHJpbmcpIHtcblx0cmV0dXJuIGxvY2F0aW9uLm9yaWdpbiArIGxvY2F0aW9uLnBhdGhuYW1lICsgXCI/XCIgKyBpZDtcbn1cblxudHlwZSBSZXZlcnNpSGlzdCA9IHsgcGllY2U6IFBpZWNlLCB4OiBudW1iZXIsIHk6IG51bWJlciB9O1xudHlwZSBXU0RhdGEgPSB7IHlvdXJfdHVybjogQ2VsbCwgbWF4X3R1cm5fY291bnQ6IG51bWJlciwgaGlzdG9yeTogUmV2ZXJzaUhpc3RbXSB9O1xuXG5mdW5jdGlvbiBhdXRvU3luY0JvYXJkKHdzOiBXZWJTb2NrZXQsIGJvYXJkOiBEcmF3YWJsZVJldmVyc2lCb2FyZCwgbWF4VHVybkNvdW50PzogbnVtYmVyKSB7XG5cdGxldCBoaXN0b3JpZXM6IFJldmVyc2lIaXN0W10gPSBbXTtcblx0bGV0IGVuYWJsZVNlbmQgPSB0cnVlO1xuXHRsZXQgb3RoZXJQZW9wbGVDb3VudCA9IDA7XG5cdGxldCBpc09wcG9uZW50Q29ubmVjdGVkID0gZmFsc2U7XG5cdHdzLmFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIGV2ID0+IHtcblx0XHRlbmFibGVTZW5kID0gZmFsc2U7XG5cblx0XHRjb25zdCB3c0RhdGEgPSBKU09OLnBhcnNlKGV2LmRhdGEpIGFzIFdTRGF0YTtcblxuXHRcdGlmICh3c0RhdGEueW91cl90dXJuID09PSBDZWxsLm5vdGhpbmcpXG5cdFx0XHRib2FyZC5zZXRQbGF5ZXJQaWVjZSh1bmRlZmluZWQpO1xuXHRcdGVsc2Vcblx0XHRcdGJvYXJkLnNldFBsYXllclBpZWNlKHdzRGF0YS55b3VyX3R1cm4pO1xuXG5cdFx0Ym9hcmQubWF4VHVybkNvdW50ID0gd3NEYXRhLm1heF90dXJuX2NvdW50O1xuXG5cdFx0aWYgKGhpc3Rvcmllcy5zb21lKChoaXN0LCBpKSA9PiB7XG5cdFx0XHRjb25zdCBuZXdIaXN0ID0gd3NEYXRhLmhpc3RvcnlbaV07XG5cdFx0XHRyZXR1cm4gbmV3SGlzdC54ICE9PSBoaXN0LnggfHwgbmV3SGlzdC55ICE9PSBoaXN0LnkgfHwgbmV3SGlzdC5waWVjZSAhPT0gaGlzdC5waWVjZTtcblx0XHR9KSkgeyAvLyDjgoLjgZfjgoLlsaXmrbTjgYzpo5/jgYTpgZXjgaPjgabjgYTjgZ/jgonjgIHkuIDjgYvjgonjg5zjg7zjg4njgpLmk43kvZzjgZfnm7TjgZnjgIJcblx0XHRcdGJvYXJkLnJlc2V0KCk7XG5cdFx0XHRoaXN0b3JpZXMgPSBbXTtcblx0XHR9XG5cdFx0d3NEYXRhLmhpc3Rvcnkuc2xpY2UoaGlzdG9yaWVzLmxlbmd0aCkuZm9yRWFjaChoaXN0ID0+IHtcblx0XHRcdGJvYXJkLnB1dChoaXN0LngsIGhpc3QueSwgaGlzdC5waWVjZSk7XG5cdFx0XHQvLyBoaXN0b3JpZXMucHVzaChoaXN0KTsgLy8gdGhpcyBvcGVyYXRpb24gaXMgZG9uZSBieSBib2FyZC5vbkFmdGVyUHV0IFxuXHRcdH0pO1xuXG5cdFx0ZW5hYmxlU2VuZCA9IHRydWU7XG5cdH0pO1xuXHRjb25zdCBfYm9hcmRfb25BZnRlclB1dCA9IGJvYXJkLm9uQWZ0ZXJQdXQ7XG5cdGJvYXJkLm9uQWZ0ZXJQdXQgPSAoeCwgeSwgcGllY2UpID0+IHtcblx0XHRfYm9hcmRfb25BZnRlclB1dCh4LCB5LCBwaWVjZSk7XG5cdFx0aGlzdG9yaWVzLnB1c2goeyB4LCB5LCBwaWVjZSB9KTtcblxuXHRcdGlmICghZW5hYmxlU2VuZCkgcmV0dXJuO1xuXG5cdFx0Y29uc3QgcGxheWVyID0gYm9hcmQuZ2V0cGxheWVyUGllY2UoKTtcblx0XHRpZiAoIXBsYXllcikgcmV0dXJuOyAvLyDlpJrliIblgo3oprPogIXjgarjga7jgafjgIJcblx0XHRpZiAoYm9hcmQubWF4VHVybkNvdW50ID09PSB1bmRlZmluZWQpIHRocm93IFwiQlVHXCI7IC8vIOWkmuWIhui1t+OBjeOBquOBhOOBruOBp1xuXHRcdGNvbnN0IGRhdGEyc2VuZDogV1NEYXRhID0ge1xuXHRcdFx0eW91cl90dXJuOiBvcHBvbmVudFBpZWNlKHBsYXllciksXG5cdFx0XHRtYXhfdHVybl9jb3VudDogYm9hcmQubWF4VHVybkNvdW50LFxuXHRcdFx0aGlzdG9yeTogaGlzdG9yaWVzLFxuXHRcdH07XG5cdFx0d3Muc2VuZChKU09OLnN0cmluZ2lmeShkYXRhMnNlbmQpKTtcblx0fVxuXHR3cy5hZGRFdmVudExpc3RlbmVyKFwib3BlblwiLCAoKSA9PiB7XG5cdFx0b3RoZXJQZW9wbGVDb3VudCsrO1xuXG5cdFx0Y29uc3QgcGxheWVyID0gYm9hcmQuZ2V0cGxheWVyUGllY2UoKTtcblx0XHRpZiAoYm9hcmQubWF4VHVybkNvdW50ID09PSB1bmRlZmluZWQpIHJldHVybjsgLy8g5Yid5Zue6LW35YuV5pmC44Go5oCd44KP44KM44KLXG5cdFx0aWYgKCFwbGF5ZXIpIHJldHVybjsgLy8g5aSa5YiG5YKN6Kaz6ICF44Gq44Gu44Gn44CCXG5cblx0XHRjb25zdCBkYXRhMnNlbmQ6IFdTRGF0YSA9IHtcblx0XHRcdHlvdXJfdHVybjogaXNPcHBvbmVudENvbm5lY3RlZCA/IENlbGwubm90aGluZyA6IG9wcG9uZW50UGllY2UocGxheWVyKSxcblx0XHRcdG1heF90dXJuX2NvdW50OiBib2FyZC5tYXhUdXJuQ291bnQsXG5cdFx0XHRoaXN0b3J5OiBoaXN0b3JpZXMsXG5cdFx0fTtcblx0XHR3cy5zZW5kKEpTT04uc3RyaW5naWZ5KGRhdGEyc2VuZCkpO1xuXHRcdGlzT3Bwb25lbnRDb25uZWN0ZWQgPSB0cnVlO1xuXHR9KTtcblx0d3MuYWRkRXZlbnRMaXN0ZW5lcihcImNsb3NlXCIsICgpID0+IHtcblx0XHRvdGhlclBlb3BsZUNvdW50LS07XG5cdH0pO1xufVxuXG5zaG93Q29uc29sZUJhbm5lcigpO1xub25Mb2FkKCgpID0+IHtcblx0Y29uc3QgdWkgPSBuZXcgVUkoKTtcblx0bGV0IGJvYXJkID0gbmV3IERyYXdhYmxlUmV2ZXJzaUJvYXJkKCk7XG5cdGNvbnNvbGUubG9nKHdpbmRvd1tcInVpXCJdID0gdWksIHdpbmRvd1tcImJvYXJkXCJdID0gYm9hcmQpO1xuXG5cdGxldCBjdXJyZW50VHVybiA9IDE7XG5cdGNvbnN0IHVwZGF0ZVNob3J0TXNnID0gKCkgPT4ge1xuXHRcdHVpLnNldFNob3J0TXNnKGDil48geCAke2JvYXJkLmNvdW50UGllY2UoQ2VsbC5ibGFjayl9ICwg4peLIHggJHtib2FyZC5jb3VudFBpZWNlKENlbGwud2hpdGUpfWApO1xuXHR9O1xuXHRjb25zdCB1cGRhdGVNc2cgPSAoKSA9PiB7XG5cdFx0aWYgKGlzR2FtZW92ZXIoKSkge1xuXHRcdFx0Y29uc3Qgd0NvdW50ID0gYm9hcmQuY291bnRQaWVjZShDZWxsLndoaXRlKTtcblx0XHRcdGNvbnN0IGJDb3VudCA9IGJvYXJkLmNvdW50UGllY2UoQ2VsbC5ibGFjayk7XG5cdFx0XHRpZiAod0NvdW50ID09PSBiQ291bnQpIHtcblx0XHRcdFx0dWkuc2V0TXNnKFwi44Ky44O844Og57WC5LqG44CC5LiW44Gr44KC54+N44GX44GE5byV44GN5YiG44GR44Gn44GZ77yBXCIpO1xuXHRcdFx0fVxuXHRcdFx0dWkuc2V0TXNnKGDjgrLjg7zjg6DntYLkuobjgIIke2JDb3VudCA+IHdDb3VudCA/IFwi4pePXCIgOiBcIuKXi1wifSDjga7li53liKnjgafjgZnvvIFgKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0Y29uc3QgcGllY2UgPSBib2FyZC5nZXRwbGF5ZXJQaWVjZSgpO1xuXHRcdGlmICghcGllY2UpIHJldHVybjtcblx0XHR1aS5zZXRNc2coYOesrCR7Y3VycmVudFR1cm5944K/44O844Oz44CCJHtwaWVjZSA9PT0gQ2VsbC5ibGFjayA/IFwi4pePXCIgOiBcIuKXi1wifSDjga7jgr/jg7zjg7PjgafjgZnjgIJgKTtcblx0fVxuXHRjb25zdCBpc0dhbWVvdmVyID0gKCkgPT4ge1xuXHRcdGlmIChib2FyZC5tYXhUdXJuQ291bnQgPT09IHVuZGVmaW5lZCkgcmV0dXJuIGZhbHNlOyAvLyDlv5zmgKXmjqrnva5cblx0XHRyZXR1cm4gYm9hcmQuaXNGaW5pc2hlZCgpIHx8IGN1cnJlbnRUdXJuID4gYm9hcmQubWF4VHVybkNvdW50O1xuXHR9XG5cblx0Ym9hcmQuYmluZENhbnZhcyh1aS5nZXRDYW52YXMoKSk7XG5cdGJvYXJkLnNldENlbGxTaXplKDY0KTtcblx0Y29uc3QgX2JvYXJkX29uQWZ0ZXJQdXQgPSBib2FyZC5vbkFmdGVyUHV0O1xuXHRib2FyZC5vbkFmdGVyUHV0ID0gKHgsIHksIHBpZWNlKSA9PiB7XG5cdFx0X2JvYXJkX29uQWZ0ZXJQdXQoeCwgeSwgcGllY2UpO1xuXHRcdHVpLmFkZExvZyhgJHtwaWVjZSA9PT0gQ2VsbC5ibGFjayA/IFwi4pePXCIgOiBcIuKXi1wifSAoJHt4fSwgJHt5fSlgKTtcblx0XHRjdXJyZW50VHVybisrO1xuXHRcdHVwZGF0ZVNob3J0TXNnKCk7XG5cdH07XG5cblx0dWkub25ab29tSW5DbGlja2VkID0gKCkgPT4gYm9hcmQuc2V0Q2VsbFNpemUoYm9hcmQuZ2V0Q2VsbFNpemUoKSAqIDEuMik7XG5cdHVpLm9uWm9vbU91dENsaWNrZWQgPSAoKSA9PiBib2FyZC5zZXRDZWxsU2l6ZShib2FyZC5nZXRDZWxsU2l6ZSgpIC8gMS4yKTtcblx0dWkub25GdWxsc2NyZWVuQ2xpY2tlZCA9ICgpID0+IHtcblx0XHRkb2N1bWVudC5ib2R5LnJlcXVlc3RGdWxsc2NyZWVuKCk7XG5cdH07XG5cblx0bGV0IGlzT25saW5lTW9kZSA9IGZhbHNlO1xuXHR1aS5vblB1dENsaWNrZWQgPSAoKSA9PiB7XG5cdFx0aWYgKGlzR2FtZW92ZXIoKSkge1xuXHRcdFx0YWxlcnQoXCLjgrLjg7zjg6Djga/ml6LjgavntYLjgo/jgaPjgZ/jga7jgafjgZnjgILjgrPjg57jgpLnva7jgY/jgZPjgajjga/jgafjgY3jgarjgYTjga7jgafjgZnjgIJcIik7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGNvbnN0IHNlbGVjdGVkID0gYm9hcmQuZ2V0U2VsZWN0ZWQoKTtcblx0XHRjb25zdCBwbGF5ZXIgPSBib2FyZC5nZXRwbGF5ZXJQaWVjZSgpO1xuXHRcdGlmIChwbGF5ZXIgPT09IHVuZGVmaW5lZCkgdGhyb3cgXCJCVUdcIjtcblx0XHRpZiAoIXNlbGVjdGVkKSB7XG5cdFx0XHR1aS5zZXRNc2coXCLjganjga7jg57jgrnjgavjgrPjg57jgpLnva7jgY3jgZ/jgYTjgafjgZnjgYvvvJ8g572u44GN44Gf44GE44Oe44K544KS44Kv44Oq44OD44Kv44GX44Gm44GP44Gg44GV44GE44CCXCIpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRpZiAoIWJvYXJkLmNhblB1dChzZWxlY3RlZC54LCBzZWxlY3RlZC55LCBwbGF5ZXIpKSB7XG5cdFx0XHR1aS5zZXRNc2coYOmBuOaKnuOBl+OBn+ODnuOCuSAoJHtzZWxlY3RlZC54fSwgJHtzZWxlY3RlZC55fSkg44Gr44Gv44GC44Gq44Gf44Gu44Kz44Oe44Gv572u44GR44Gq44GE44KI44GG44Gn44GZ44CC5LuW44Gu44Oe44K544KS6YG45oqe44GX44Gm44GP44Gg44GV44GE44CC6buS44GE44OJ44OD44OI44Gu44Gk44GE44Gf44Oe44K544Gq44KJ44Gp44GT44Gn44KC44Kz44Oe44KS572u44GR44G+44GZ44CCYCk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGJvYXJkLnB1dChzZWxlY3RlZC54LCBzZWxlY3RlZC55LCBwbGF5ZXIpO1xuXHRcdGlmICghaXNPbmxpbmVNb2RlKVxuXHRcdFx0Ym9hcmQuc2V0UGxheWVyUGllY2Uob3Bwb25lbnRQaWVjZShwbGF5ZXIpKTtcblx0XHR1cGRhdGVNc2coKTtcblx0fTtcblx0dWkub25QbGF5Q2xpY2tlZCA9ICh0dXJuQ291bnQsIGlzT25saW5lKSA9PiB7XG5cdFx0aWYgKGlzT25saW5lKSB7XG5cdFx0XHRhbGVydChcIkNhdXRpb246IE9ubGluZSBnYW1lIG1heSBub3Qgd29ya3MgcHJvcGVybHkuLi4gKFRoaXMgaXMgd2h5IHRoaXMgZ2FtZSBpcyB3b3JrLWluLXByb2dyZXNzKVwiKTtcblx0XHR9XG5cdFx0Ym9hcmQubWF4VHVybkNvdW50ID0gdHVybkNvdW50O1xuXHRcdGlzT25saW5lTW9kZSA9IGlzT25saW5lO1xuXHRcdHVpLmNsZWFyTG9nKCk7XG5cdFx0dWkuc2hvd0dhbWUoKTtcblx0XHR1aS5nZXRDYW52YXMoKS5vblJlc2l6ZSgpO1xuXG5cdFx0aWYgKGlzT25saW5lKSB7XG5cdFx0XHRib2FyZC5yZXNldCgpO1xuXHRcdFx0Ym9hcmQuc2V0UGxheWVyUGllY2UoQ2VsbC5ibGFjayk7XG5cdFx0XHRjb25zdCByb29tSWQgPSB1dWlkKCk7XG5cdFx0XHRjb25zdCB3cyA9IGlkMndzKHJvb21JZClcblx0XHRcdGF1dG9TeW5jQm9hcmQod3MsIGJvYXJkKTtcblx0XHRcdHVwZGF0ZVNob3J0TXNnKCk7XG5cdFx0XHR1cGRhdGVNc2coKTtcblx0XHRcdHByb21wdChcIuS7peS4i+OBrlVSTOOCkuOAgeWvvuaIpuebuOaJi+OBq+mWi+OBhOOBpuOCguOCieOBo+OBpuOBj+OBoOOBleOBhFwiLCBpZDJwdWJsaXNoVVJMKHJvb21JZCkpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRib2FyZC5yZXNldCgpO1xuXHRcdFx0Ym9hcmQuc2V0UGxheWVyUGllY2UoQ2VsbC5ibGFjayk7XG5cdFx0XHR1cGRhdGVTaG9ydE1zZygpO1xuXHRcdFx0dXBkYXRlTXNnKCk7XG5cdFx0fVxuXHR9O1xuXHRpZiAoZ2V0Um9vbUlEKCkpIHtcblx0XHRhbGVydChcIkNhdXRpb246IE9ubGluZSBnYW1lIG1heSBub3Qgd29ya3MgcHJvcGVybHkuLi4gKFRoaXMgaXMgd2h5IHRoaXMgZ2FtZSBpcyB3b3JrLWluLXByb2dyZXNzKVwiKTtcblxuXHRcdGNvbnN0IHdzID0gaWQyd3MoZ2V0Um9vbUlEKCkhKTtcblx0XHRhdXRvU3luY0JvYXJkKHdzLCBib2FyZCk7XG5cdFx0dWkub25QbGF5Q2xpY2tlZCh1bmRlZmluZWQsIGZhbHNlKTtcblx0fSBlbHNlIHtcblx0XHR1aS5zaG93TWVudSgpO1xuXHR9XG59KTtcblxuLypcbldlYlNvY2tldCDjgafpgIHkv6HjgZnjgovjg4fjg7zjgr9cbntcblx0XCJ5b3VyX3BpZWNlXCI6IENlbGwuYmxhY2sgb3IgQ2VsbC53aGl0ZSBvciBDZWxsLm5vdGhpbmcsXG5cdFwiaGlzdG9yeVwiOiBbXG5cdFx0e1wicGllY2VcIjogQ2VsbCwgXCJ4XCI6IG51bWJlciwgXCJ5XCI6IG51bWJlcn1cblx0XVxufVxuXG5cbiovIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJTQUdnQixFQUFFLENBQXNDLEVBQVU7SUFDakUsT0FBTyxRQUFRLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBTSxDQUFDO0NBQ3hDO0FBRUQsU0FRZ0IsRUFBRSxDQUF3QyxPQUFVLEVBQUUsVUFBb0IsRUFBRSxFQUFFLFdBQTBCLEVBQUU7SUFDekgsTUFBTSxDQUFDLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUMxQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDakMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3hDLE9BQU8sQ0FBQyxDQUFDO0NBQ1Q7QUFFRCxTQUFnQixHQUFHLENBQUMsU0FBaUIsRUFBRSxPQUFpQixFQUFFLEVBQVcsRUFBRSxTQUFxQjtJQUMzRixNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDcEIsRUFBRSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7SUFDekIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElB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SUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ3ZDO0lBQ0QsT0FBTyxDQUFDLENBQVMsRUFBRSxDQUFTLEVBQUUsSUFBVTtRQUN2QyxNQUFNLElBQUksR0FBRyxRQUFRLENBQUMsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ3BDLE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFFcEMsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzFDLElBQUksQ0FBQyxHQUFHO1lBQ1AsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQ2QsSUFBSSxDQUFDLFNBQVMsRUFDZCxHQUFHLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FDZixDQUFDO1FBRUgsSUFBSSxLQUFLLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDcEMsSUFBSSxDQUFDLEtBQUs7WUFDVCxHQUFHLENBQUMsR0FBRyxDQUNOLElBQUksQ0FBQyxTQUFTLEVBQ2QsS0FBSyxHQUFHLElBQUksU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUNyRCxDQUFDO1FBRUgsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQztLQUN2QztJQUNELElBQUksQ0FBQyxFQUFxQztRQUN6QyxLQUFLLE1BQU0sQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLEVBQUU7WUFDckMsS0FBSyxNQUFNLEtBQUssSUFBSSxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUU7Z0JBQy9CLE1BQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUM7Z0JBQzlCLE1BQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUM7Z0JBQzlCLElBQUksS0FB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

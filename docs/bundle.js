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
        this.joinBtn = ge("i-join_online");
        this.onPlayClicked = () => { };
        this.onOnlineClicked = () => { };
        this.onJoinClicked = () => { };
        onClick(this.playBtn, () => this.onPlayClicked());
        onClick(this.onlineBtn, () => this.onOnlineClicked());
        onClick(this.joinBtn, () => this.onJoinClicked());
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
        this.onJoinClicked = () => { };
        this.info.onJoinClicked = () => this.onJoinClicked();
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
        this.log = ge("g-log");
        this.shortMsg = ge("g-short_message");
        this.message = ge("g-message");
        this.canvasContainer = ge("g-canvas_parent");
        this.canvasElem = ge("g-canvas");
        this.canvas = new MyCanvas(this.canvasContainer, this.canvasElem);
        this.onZoomInClicked = () => { };
        this.onZoomOutClicked = () => { };
        this.onPutClicked = () => { };
        onClick(this.zoomInBtn, () => this.onZoomInClicked());
        onClick(this.zoomOutBtn, () => this.onZoomOutClicked());
        onClick(this.putBtn, () => this.onPutClicked());
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
        this.onJoinClicked = () => { };
        this.onZoomInClicked = () => { };
        this.onZoomOutClicked = () => { };
        this.onPutClicked = () => { };
        this.menu.onPlayClicked = (turnCount, isOnline) => this.onPlayClicked(turnCount, isOnline);
        this.menu.onJoinClicked = () => this.onJoinClicked();
        this.game.onZoomInClicked = () => this.onZoomInClicked();
        this.game.onZoomOutClicked = () => this.onZoomOutClicked();
        this.game.onPutClicked = () => this.onPutClicked();
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
showConsoleBanner();
onLoad(() => {
    const ui = new UI();
    let board = new DrawableReversiBoard();
    console.log(window["ui"] = ui, window["board"] = board);
    let currentTurn = 1;
    let maxTurnCount = -1;
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
        return board.isFinished() || currentTurn > maxTurnCount;
    };
    board.bindCanvas(ui.getCanvas());
    board.setPlayerPiece(1);
    board.setCellSize(64);
    board.reset();
    board.onAfterPut = (x, y, piece) => {
        ui.addLog(`${piece === 1 ? "●" : "○"} (${x}, ${y})`);
        currentTurn++;
        updateShortMsg();
    };
    ui.onZoomInClicked = () => board.setCellSize(board.getCellSize() * 1.2);
    ui.onZoomOutClicked = () => board.setCellSize(board.getCellSize() / 1.2);
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
        board.setPlayerPiece(opponentPiece(player));
        updateMsg();
    };
    ui.onPlayClicked = (turnCount, isOnline) => {
        if (isOnline) {
            alert("Online mode is not supported yet... Please enjoy offline mode!");
            location.reload();
        }
        else {
            maxTurnCount = turnCount;
            ui.clearLog();
            ui.showGame();
            ui.getCanvas().onResize();
            board.render();
            updateShortMsg();
            updateMsg();
        }
    };
    ui.onJoinClicked = () => {
        alert("Online mode is not supported yet... Please enjoy offline mode!");
    };
    ui.showMenu();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvdHMvZG9tLXV0aWwudHMiLCIuLi9zcmMvdHMvbXljYW52YXMudHMiLCIuLi9zcmMvdHMvdWkudHMiLCIuLi9zcmMvdHMvdXRpbC50cyIsIi4uL3NyYy90cy9yZXZlcnNpLnRzIiwiLi4vc3JjL3RzL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIGdlIGdlcWEgZ2VxIGNlIGNMSSByZW1DIGFkZEMgcmVtQWxsIG9uQ2xpY2sgb25Mb2FkXG5cbi8vIGdldEVsZW1lbnRCeUlkXG5leHBvcnQgZnVuY3Rpb24gZ2U8VCBleHRlbmRzIEhUTUxFbGVtZW50ID0gSFRNTEVsZW1lbnQ+KGlkOiBzdHJpbmcpIHtcblx0cmV0dXJuIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKSBhcyBUO1xufVxuLy8gZ2V0QWxsRWxlbWVudHNCeVF1ZXJ5XG5leHBvcnQgZnVuY3Rpb24gZ2VxYShzZWxlY3RvcnM6IHN0cmluZykge1xuXHRyZXR1cm4gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9ycykpXG59XG4vLyBnZXRFbGVtZW50QnlRdWVyeVxuZXhwb3J0IGZ1bmN0aW9uIGdlcShzZWxlY3RvcnM6IHN0cmluZykge1xuXHRyZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3RvcnMpXG59XG4vLyBjcmVhdGVFbGVtZW50XG5leHBvcnQgZnVuY3Rpb24gY2U8SyBleHRlbmRzIGtleW9mIEhUTUxFbGVtZW50VGFnTmFtZU1hcD4odGFnTmFtZTogSywgY2xhc3Nlczogc3RyaW5nW10gPSBbXSwgY2hpbGRyZW46IEhUTUxFbGVtZW50W10gPSBbXSk6IEhUTUxFbGVtZW50VGFnTmFtZU1hcFtLXSB7XG5cdGNvbnN0IGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZ05hbWUpO1xuXHRjbGFzc2VzLmZvckVhY2goXyA9PiBhZGRDKGUsIF8pKTtcblx0Y2hpbGRyZW4uZm9yRWFjaChfID0+IGUuYXBwZW5kQ2hpbGQoXykpO1xuXHRyZXR1cm4gZTtcbn1cbi8vIGNyZWF0ZUxpRWxlbWVudFxuZXhwb3J0IGZ1bmN0aW9uIGNMSShpbm5lclRleHQ6IHN0cmluZywgY2xhc3Nlczogc3RyaW5nW10sIGlkPzogc3RyaW5nLCBvbkNsaWNrRm4/OiAoKSA9PiBhbnkpIHtcblx0Y29uc3QgbGkgPSBjZShcImxpXCIpO1xuXHRsaS5pbm5lclRleHQgPSBpbm5lclRleHQ7XG5cdGNsYXNzZXMuZm9yRWFjaChfID0+IGFkZEMobGksIF8pKTtcblx0aWYgKGlkKSBsaS5pZCA9IGlkO1xuXHRpZiAob25DbGlja0ZuKSBvbkNsaWNrKGxpLCBvbkNsaWNrRm4pO1xuXHRyZXR1cm4gbGk7XG59XG4vLyByZW1vdmVDbGFzc0Zyb21FbGVtZW50XG5leHBvcnQgZnVuY3Rpb24gcmVtQyhlbG06IEhUTUxFbGVtZW50LCBjbHM6IHN0cmluZykge1xuXHRlbG0uY2xhc3NMaXN0LnJlbW92ZShjbHMpO1xufVxuLy8gYWRkQ2xhc3NUb0VsZW1lbnRcbmV4cG9ydCBmdW5jdGlvbiBhZGRDKGVsbTogSFRNTEVsZW1lbnQsIGNsczogc3RyaW5nKSB7XG5cdGVsbS5jbGFzc0xpc3QuYWRkKGNscyk7XG59XG4vLyByZW1vdmVBbGxDaGlsZHJlblxuZXhwb3J0IGZ1bmN0aW9uIHJlbUFsbChlbG06IEhUTUxFbGVtZW50KSB7XG5cdHdoaWxlIChlbG0uZmlyc3RDaGlsZClcblx0XHRlbG0ucmVtb3ZlQ2hpbGQoZWxtLmZpcnN0Q2hpbGQpO1xufVxuLy8gYWRkT25DbGlja0V2ZW50TGlzdGVuZXJcbmV4cG9ydCBmdW5jdGlvbiBvbkNsaWNrKGVsbTogSFRNTEVsZW1lbnQsIGZuOiAoZXY6IEhUTUxFbGVtZW50RXZlbnRNYXBbXCJjbGlja1wiXSkgPT4gYW55KSB7XG5cdGVsbS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZm4pO1xufSIsImV4cG9ydCBjbGFzcyBNeUNhbnZhcyB7XG5cdHBhcmVudDogSFRNTEVsZW1lbnRcblx0Y2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudFxuXHRjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRFxuXHR3aWR0aDogbnVtYmVyXG5cdGhlaWdodDogbnVtYmVyXG5cdC8vIGFzcGVjdDogbnVtYmVyXG5cdGRwcjogbnVtYmVyXG5cdGNvbnN0cnVjdG9yKFxuXHRcdHBhcmVudDogSFRNTEVsZW1lbnQsXG5cdFx0Y2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCxcblx0XHRkcHI6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZCxcblx0XHQvLyBhc3BlY3Q6IG51bWJlcixcblx0KSB7XG5cdFx0dGhpcy5wYXJlbnQgPSBwYXJlbnQ7XG5cdFx0dGhpcy5jYW52YXMgPSBjYW52YXM7XG5cdFx0aWYgKGNhbnZhcy5nZXRDb250ZXh0KSB0aGlzLmN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpITtcblx0XHRlbHNlIHRocm93IFwiQ2FudmFz44GM5a++5b+c44GX44Gm44GE44Gq44GE44KI44GG44Gn44GZXCI7XG5cdFx0dGhpcy53aWR0aCA9IDE7XG5cdFx0dGhpcy5oZWlnaHQgPSAxO1xuXHRcdHRoaXMuZHByID0gKGRwciB8fCB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyB8fCAxKTtcblx0XHQvLyB0aGlzLmFzcGVjdCA9IGFzcGVjdDtcblx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cdFx0KCgpID0+IHtcblx0XHRcdHZhciBpOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG5cdFx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgKCkgPT4ge1xuXHRcdFx0XHRpZiAoaSAhPT0gdW5kZWZpbmVkKSBjbGVhclRpbWVvdXQoaSk7XG5cdFx0XHRcdGkgPSBzZXRUaW1lb3V0KCgpID0+IHRoaXMub25SZXNpemUoKSwgMTAwKTtcblx0XHRcdH0pO1xuXHRcdH0pKCk7XG5cdFx0dGhpcy5vblJlc2l6ZSgpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cdGNoYW5nZURQUihkcHI6IG51bWJlcikge1xuXHRcdHRoaXMuZHByID0gZHByIHx8IHRoaXMuZHByO1xuXHRcdHRoaXMub25SZXNpemUoKTtcblx0XHRjb25zb2xlLmxvZyhgW0RQUjogJHtkcHJ9LyR7KHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvIHx8IDEpfWApO1xuXHR9XG5cdG9uUmVzaXplKCkge1xuXHRcdGxldCBjYW52YXMgPSB0aGlzLmN0eC5jYW52YXM7XG5cdFx0Y29uc3QgbWF4V2lkdGggPSB0aGlzLnBhcmVudC5jbGllbnRXaWR0aDtcblx0XHRjb25zdCBtYXhIZWlnaHQgPSB0aGlzLnBhcmVudC5jbGllbnRIZWlnaHQ7XG5cdFx0LyogOiAvKiDjgavjgZnjgovjgYvjgIEgLy8qIOOBq+OBmeOCi+OBi+OBp+WHpueQhuOBjOWkieOCj+OCi+OAglxuXHRcdGNvbnN0IHNjYWxlID0gTWF0aC5taW4obWF4V2lkdGggLyB0aGlzLmFzcGVjdCwgbWF4SGVpZ2h0KTtcblx0XHRjb25zdCBzY2FsZVggPSBzY2FsZSAqIHRoaXMuYXNwZWN0O1xuXHRcdGNvbnN0IHNjYWxlWSA9IHNjYWxlO1xuXHRcdC8qL1xuXHRcdGNvbnN0IHdpZHRoID0gbWF4V2lkdGg7XG5cdFx0Y29uc3QgaGVpZ2h0ID0gbWF4SGVpZ2h0O1xuXHRcdC8vKi9cblx0XHR0aGlzLndpZHRoID0gdGhpcy5kcHIgKiB3aWR0aDtcblx0XHR0aGlzLmhlaWdodCA9IHRoaXMuZHByICogaGVpZ2h0O1xuXHRcdGNhbnZhcy53aWR0aCA9IHRoaXMud2lkdGg7XG5cdFx0Y2FudmFzLmhlaWdodCA9IHRoaXMuaGVpZ2h0O1xuXHRcdGNhbnZhcy5zdHlsZS53aWR0aCA9IHdpZHRoICsgXCJweFwiO1xuXHRcdGNhbnZhcy5zdHlsZS5oZWlnaHQgPSBoZWlnaHQgKyBcInB4XCI7XG5cdFx0dGhpcy5jdHgubGluZVdpZHRoID0gdGhpcy5kcHI7XG5cdH1cblx0bGluZSh4MTogbnVtYmVyLCB5MTogbnVtYmVyLCB4MjogbnVtYmVyLCB5MjogbnVtYmVyKSB7XG5cdFx0Y29uc3Qgc2NhbGVYID0gMSwgc2NhbGVZID0gMTtcblx0XHR0aGlzLmN0eC5tb3ZlVG8oKHgxICogc2NhbGVYKSwgKHkxICogc2NhbGVZKSk7XG5cdFx0dGhpcy5jdHgubGluZVRvKCh4MiAqIHNjYWxlWCksICh5MiAqIHNjYWxlWSkpO1xuXHR9XG5cdHJlY3QoeDogbnVtYmVyLCB5OiBudW1iZXIsIHc6IG51bWJlciwgaDogbnVtYmVyKSB7XG5cdFx0Y29uc3Qgc2NhbGVYID0gMSwgc2NhbGVZID0gMTtcblx0XHR0aGlzLmN0eC5yZWN0KFxuXHRcdFx0KHggKiBzY2FsZVgpLCAoeSAqIHNjYWxlWSksXG5cdFx0XHQodyAqIHNjYWxlWCksIChoICogc2NhbGVZKVxuXHRcdCk7XG5cdH1cblx0cm91bmQoeDogbnVtYmVyLCB5OiBudW1iZXIsIHI6IG51bWJlcikge1xuXHRcdGNvbnN0IHNjYWxlWCA9IDEsIHNjYWxlWSA9IDE7XG5cdFx0dGhpcy5jdHguYXJjKFxuXHRcdFx0KHggKiBzY2FsZVgpLFxuXHRcdFx0KHkgKiBzY2FsZVkpLFxuXHRcdFx0KHIgKiBNYXRoLm1pbihzY2FsZVgsIHNjYWxlWSkpLFxuXHRcdFx0LTAuNSAqIE1hdGguUEksXG5cdFx0XHQyICogTWF0aC5QSVxuXHRcdCk7XG5cdH1cblx0bG9uZ1JvdW5kKHg6IG51bWJlciwgeTogbnVtYmVyLCBoOiBudW1iZXIsIHI6IG51bWJlcikge1xuXHRcdGNvbnN0IHNjYWxlWCA9IDEsIHNjYWxlWSA9IDE7XG5cdFx0dGhpcy5jdHguYXJjKFxuXHRcdFx0KHggKiBzY2FsZVgpLFxuXHRcdFx0KHkgKiBzY2FsZVkpLFxuXHRcdFx0KHIgKiBNYXRoLm1pbihzY2FsZVgsIHNjYWxlWSkpLFxuXHRcdFx0LU1hdGguUEksIDBcblx0XHQpO1xuXHRcdHRoaXMuY3R4LmFyYyhcblx0XHRcdCh4ICogc2NhbGVYKSxcblx0XHRcdCgoeSArIGgpICogc2NhbGVZKSxcblx0XHRcdChyICogTWF0aC5taW4oc2NhbGVYLCBzY2FsZVkpKSxcblx0XHRcdDAsIC1NYXRoLlBJXG5cdFx0KTtcblx0XHR0aGlzLmN0eC5saW5lVG8oXG5cdFx0XHQoeCAqIHNjYWxlWCAtIHIgKiBNYXRoLm1pbihzY2FsZVgsIHNjYWxlWSkpLFxuXHRcdFx0KHkgKiBzY2FsZVkpXG5cdFx0KTtcblx0fVxuXHRiZWdpblBhdGgoKSB7IHRoaXMuY3R4LmJlZ2luUGF0aCgpIH1cblx0ZmlsbEFsbChzdHlsZTogdW5kZWZpbmVkIHwgc3RyaW5nID0gdW5kZWZpbmVkKSB7XG5cdFx0aWYgKHN0eWxlICE9PSB1bmRlZmluZWQpIHRoaXMuY3R4LmZpbGxTdHlsZSA9IHN0eWxlO1xuXHRcdHRoaXMuY3R4LmZpbGxSZWN0KDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcblx0fVxuXHRmaWxsKHN0eWxlOiB1bmRlZmluZWQgfCBzdHJpbmcgPSB1bmRlZmluZWQpIHtcblx0XHRpZiAoc3R5bGUgIT09IHVuZGVmaW5lZCkgdGhpcy5jdHguZmlsbFN0eWxlID0gc3R5bGU7XG5cdFx0dGhpcy5jdHguZmlsbCgpO1xuXHR9XG5cdHN0cm9rZShzdHlsZTogdW5kZWZpbmVkIHwgc3RyaW5nID0gdW5kZWZpbmVkKSB7XG5cdFx0aWYgKHN0eWxlICE9PSB1bmRlZmluZWQpIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gc3R5bGU7XG5cdFx0dGhpcy5jdHguc3Ryb2tlKCk7XG5cdH1cblx0Y2xlYXJBbGwoKSB7XG5cdFx0Y29uc3Qgc2NhbGVYID0gMSwgc2NhbGVZID0gMTtcblx0XHR0aGlzLmN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuXHR9XG59IiwiaW1wb3J0IHsgZ2UsIG9uQ2xpY2ssIGNlLCBjTEkgfSBmcm9tIFwiLi9kb20tdXRpbFwiO1xuaW1wb3J0IHsgTXlDYW52YXMgfSBmcm9tIFwiLi9teWNhbnZhc1wiO1xuXG5jb25zdCBwcmVmID0ge1xuXHRkZWZhdWx0VHVybkNvdW50OiA2NCxcbn1cblxuY2xhc3MgVUlfSW5mbyB7XG5cdHByaXZhdGUgY29udGFpbmVyID0gZ2UoXCJpbmZvXCIpO1xuXHRwcml2YXRlIHBsYXlCdG4gPSBnZShcImktcGxheVwiKTtcblx0cHJpdmF0ZSBvbmxpbmVCdG4gPSBnZShcImktc3RhcnRfb25saW5lXCIpO1xuXHRwcml2YXRlIGpvaW5CdG4gPSBnZShcImktam9pbl9vbmxpbmVcIik7XG5cblx0b25QbGF5Q2xpY2tlZCA9ICgpID0+IHsgfTtcblx0b25PbmxpbmVDbGlja2VkID0gKCkgPT4geyB9O1xuXHRvbkpvaW5DbGlja2VkID0gKCkgPT4geyB9O1xuXG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdG9uQ2xpY2sodGhpcy5wbGF5QnRuLCAoKSA9PiB0aGlzLm9uUGxheUNsaWNrZWQoKSk7XG5cdFx0b25DbGljayh0aGlzLm9ubGluZUJ0biwgKCkgPT4gdGhpcy5vbk9ubGluZUNsaWNrZWQoKSk7XG5cdFx0b25DbGljayh0aGlzLmpvaW5CdG4sICgpID0+IHRoaXMub25Kb2luQ2xpY2tlZCgpKTtcblx0fVxuXG5cdHNob3coKSB7XG5cdFx0dGhpcy5jb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZShcImhpZGVcIik7XG5cdH1cblx0aGlkZSgpIHtcblx0XHR0aGlzLmNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKFwiaGlkZVwiKTtcblx0fVxufVxuY2xhc3MgVUlfQ29uZmlnIHtcblx0cHJpdmF0ZSBjb250YWluZXIgPSBnZShcImNvbmZpZ1wiKTtcblx0cHJpdmF0ZSBzaXplSW5wdXQgPSBnZTxIVE1MSW5wdXRFbGVtZW50PihcImMtc2l6ZV9pblwiKTtcblx0cHJpdmF0ZSBzaXplVmlldyA9IGdlKFwiYy1zaXplX291dFwiKTtcblx0cHJpdmF0ZSBzdGFydEJ0biA9IGdlKFwiYy1zdGFydFwiKTtcblx0cHJpdmF0ZSB0dXJuQ291bnQgPSBwcmVmLmRlZmF1bHRUdXJuQ291bnQ7XG5cblx0b25TdGFydENsaWNrZWQgPSAodHVybkNvdW50OiBudW1iZXIpID0+IHsgfTtcblxuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRvbkNsaWNrKHRoaXMuc3RhcnRCdG4sICgpID0+IHRoaXMub25TdGFydENsaWNrZWQodGhpcy50dXJuQ291bnQpKTtcblx0XHR0aGlzLnNpemVJbnB1dC5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgKCkgPT4gdGhpcy5vblVwZGF0ZVNpemVJbnB1dCgpKTtcblx0XHR0aGlzLnNpemVJbnB1dC52YWx1ZSA9IHRoaXMudHVybkNvdW50ICsgXCJcIjtcblx0XHR0aGlzLnVwZGF0ZVNpemVWaWV3KCk7XG5cdH1cblxuXHRwcml2YXRlIHVwZGF0ZVNpemVWaWV3KCkge1xuXHRcdHRoaXMuc2l6ZVZpZXcudGV4dENvbnRlbnQgPSBgVGhlIGdhbWUgd2lsbCBmaW5pc2ggaW4gJHt0aGlzLnR1cm5Db3VudH0gdHVybnMuYDtcblx0fVxuXHRwcml2YXRlIG9uVXBkYXRlU2l6ZUlucHV0KCkge1xuXHRcdGxldCB2YWx1ZSA9IHBhcnNlSW50KHRoaXMuc2l6ZUlucHV0LnZhbHVlKTtcblx0XHRpZiAodmFsdWUgPD0gMCB8fCBpc05hTih2YWx1ZSkpIHZhbHVlID0gcHJlZi5kZWZhdWx0VHVybkNvdW50O1xuXHRcdGlmICh2YWx1ZSAlIDIgPT0gMSkgdmFsdWUrKztcblx0XHR0aGlzLnR1cm5Db3VudCA9IHZhbHVlO1xuXHRcdHRoaXMudXBkYXRlU2l6ZVZpZXcoKTtcblx0fVxuXHRzaG93KCkge1xuXHRcdHRoaXMuY29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRlXCIpO1xuXHR9XG5cdGhpZGUoKSB7XG5cdFx0dGhpcy5jb250YWluZXIuY2xhc3NMaXN0LmFkZChcImhpZGVcIik7XG5cdH1cbn1cbmNsYXNzIFVJX01lbnUge1xuXHRwcml2YXRlIGNvbnRhaW5lciA9IGdlKFwiY29udGFpbmVyXCIpO1xuXHRwcml2YXRlIGluZm8gPSBuZXcgVUlfSW5mbygpO1xuXHRwcml2YXRlIGNvbmZpZyA9IG5ldyBVSV9Db25maWcoKTtcblx0cHJpdmF0ZSBpc09ubGluZTogXCJ5ZXNcIiB8IFwibm9cIiB8IFwiP1wiID0gXCI/XCI7XG5cblx0b25QbGF5Q2xpY2tlZCA9ICh0dXJuQ291bnQ6IG51bWJlciwgaXNPbmxpbmU6IGJvb2xlYW4pID0+IHsgfTtcblx0b25Kb2luQ2xpY2tlZCA9ICgpID0+IHsgfTtcblxuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHR0aGlzLmluZm8ub25Kb2luQ2xpY2tlZCA9ICgpID0+IHRoaXMub25Kb2luQ2xpY2tlZCgpO1xuXHRcdHRoaXMuaW5mby5vbk9ubGluZUNsaWNrZWQgPSAoKSA9PiB7XG5cdFx0XHR0aGlzLmlzT25saW5lID0gXCJ5ZXNcIjtcblx0XHRcdHRoaXMuaW5mby5oaWRlKCk7XG5cdFx0XHR0aGlzLmNvbmZpZy5zaG93KCk7XG5cdFx0fTtcblx0XHR0aGlzLmluZm8ub25QbGF5Q2xpY2tlZCA9ICgpID0+IHtcblx0XHRcdHRoaXMuaXNPbmxpbmUgPSBcIm5vXCI7XG5cdFx0XHR0aGlzLmluZm8uaGlkZSgpO1xuXHRcdFx0dGhpcy5jb25maWcuc2hvdygpO1xuXHRcdH07XG5cdFx0dGhpcy5jb25maWcub25TdGFydENsaWNrZWQgPSB0dXJuQ291bnQgPT4ge1xuXHRcdFx0aWYgKHRoaXMuaXNPbmxpbmUgPT09IFwiP1wiKVxuXHRcdFx0XHR0aHJvdyBcIkJVR1wiO1xuXHRcdFx0dGhpcy5vblBsYXlDbGlja2VkKHR1cm5Db3VudCwgdGhpcy5pc09ubGluZSA9PT0gXCJ5ZXNcIik7XG5cdFx0fVxuXHR9XG5cblx0c2hvdygpIHtcblx0XHR0aGlzLmNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZVwiKTtcblxuXHRcdHRoaXMuaXNPbmxpbmUgPSBcIj9cIjtcblx0XHR0aGlzLmluZm8uc2hvdygpO1xuXHRcdHRoaXMuY29uZmlnLmhpZGUoKTtcblx0fVxuXHRoaWRlKCkge1xuXHRcdHRoaXMuY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoXCJoaWRlXCIpO1xuXHR9XG59XG5jbGFzcyBVSV9HYW1lIHtcblx0cHJpdmF0ZSBjb250YWluZXIgPSBnZShcImdhbWVcIik7XG5cdHByaXZhdGUgem9vbUluQnRuID0gZ2U8SFRNTEJ1dHRvbkVsZW1lbnQ+KFwiZy16b29tX2luXCIpO1xuXHRwcml2YXRlIHpvb21PdXRCdG4gPSBnZTxIVE1MQnV0dG9uRWxlbWVudD4oXCJnLXpvb21fb3V0XCIpO1xuXHRwcml2YXRlIHB1dEJ0biA9IGdlPEhUTUxCdXR0b25FbGVtZW50PihcImctcHV0XCIpO1xuXHRwcml2YXRlIGxvZyA9IGdlPEhUTUxVTGlzdEVsZW1lbnQ+KFwiZy1sb2dcIik7XG5cdHByaXZhdGUgc2hvcnRNc2cgPSBnZShcImctc2hvcnRfbWVzc2FnZVwiKTtcblx0cHJpdmF0ZSBtZXNzYWdlID0gZ2UoXCJnLW1lc3NhZ2VcIik7XG5cdHByaXZhdGUgY2FudmFzQ29udGFpbmVyID0gZ2U8SFRNTENhbnZhc0VsZW1lbnQ+KFwiZy1jYW52YXNfcGFyZW50XCIpO1xuXHRwcml2YXRlIGNhbnZhc0VsZW0gPSBnZTxIVE1MQ2FudmFzRWxlbWVudD4oXCJnLWNhbnZhc1wiKTtcblx0Y2FudmFzID0gbmV3IE15Q2FudmFzKHRoaXMuY2FudmFzQ29udGFpbmVyLCB0aGlzLmNhbnZhc0VsZW0pO1xuXG5cdG9uWm9vbUluQ2xpY2tlZCA9ICgpID0+IHsgfTtcblx0b25ab29tT3V0Q2xpY2tlZCA9ICgpID0+IHsgfTtcblx0b25QdXRDbGlja2VkID0gKCkgPT4geyB9O1xuXG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdG9uQ2xpY2sodGhpcy56b29tSW5CdG4sICgpID0+IHRoaXMub25ab29tSW5DbGlja2VkKCkpO1xuXHRcdG9uQ2xpY2sodGhpcy56b29tT3V0QnRuLCAoKSA9PiB0aGlzLm9uWm9vbU91dENsaWNrZWQoKSk7XG5cdFx0b25DbGljayh0aGlzLnB1dEJ0biwgKCkgPT4gdGhpcy5vblB1dENsaWNrZWQoKSk7XG5cdH1cblx0c2hvdygpIHtcblx0XHR0aGlzLmNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZVwiKTtcblx0fVxuXHRoaWRlKCkge1xuXHRcdHRoaXMuY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoXCJoaWRlXCIpO1xuXHR9XG5cdGNsZWFyTG9nKCkge1xuXHRcdHRoaXMubG9nLmlubmVySFRNTCA9IFwiXCI7XG5cdH1cblx0YWRkTG9nKG1zZzogc3RyaW5nKSB7XG5cdFx0dGhpcy5sb2cuYXBwZW5kQ2hpbGQoY0xJKG1zZywgW10pKTtcblx0fVxuXHRzZXRTaG9ydE1zZyhtc2c6IHN0cmluZykge1xuXHRcdHRoaXMuc2hvcnRNc2cudGV4dENvbnRlbnQgPSBtc2c7XG5cdH1cblx0c2V0TXNnKG1zZzogc3RyaW5nKSB7XG5cdFx0dGhpcy5tZXNzYWdlLnRleHRDb250ZW50ID0gbXNnO1xuXHR9XG59XG5leHBvcnQgY2xhc3MgVUkge1xuXHRwcml2YXRlIG1lbnUgPSBuZXcgVUlfTWVudSgpO1xuXHRwcml2YXRlIGdhbWUgPSBuZXcgVUlfR2FtZSgpO1xuXG5cdG9uUGxheUNsaWNrZWQgPSAodHVybkNvdW50OiBudW1iZXIsIGlzT25saW5lOiBib29sZWFuKSA9PiB7IH07XG5cdG9uSm9pbkNsaWNrZWQgPSAoKSA9PiB7IH07XG5cdG9uWm9vbUluQ2xpY2tlZCA9ICgpID0+IHsgfTtcblx0b25ab29tT3V0Q2xpY2tlZCA9ICgpID0+IHsgfTtcblx0b25QdXRDbGlja2VkID0gKCkgPT4geyB9O1xuXG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHRoaXMubWVudS5vblBsYXlDbGlja2VkID0gKHR1cm5Db3VudCwgaXNPbmxpbmUpID0+IHRoaXMub25QbGF5Q2xpY2tlZCh0dXJuQ291bnQsIGlzT25saW5lKTtcblx0XHR0aGlzLm1lbnUub25Kb2luQ2xpY2tlZCA9ICgpID0+IHRoaXMub25Kb2luQ2xpY2tlZCgpO1xuXHRcdHRoaXMuZ2FtZS5vblpvb21JbkNsaWNrZWQgPSAoKSA9PiB0aGlzLm9uWm9vbUluQ2xpY2tlZCgpO1xuXHRcdHRoaXMuZ2FtZS5vblpvb21PdXRDbGlja2VkID0gKCkgPT4gdGhpcy5vblpvb21PdXRDbGlja2VkKCk7XG5cdFx0dGhpcy5nYW1lLm9uUHV0Q2xpY2tlZCA9ICgpID0+IHRoaXMub25QdXRDbGlja2VkKCk7XG5cdH1cblxuXHRzaG93TWVudSgpIHtcblx0XHR0aGlzLm1lbnUuc2hvdygpO1xuXHRcdHRoaXMuZ2FtZS5oaWRlKCk7XG5cdH1cblx0c2hvd0dhbWUoKSB7XG5cdFx0dGhpcy5tZW51LmhpZGUoKTtcblx0XHR0aGlzLmdhbWUuc2hvdygpO1xuXHR9XG5cdGNsZWFyTG9nKCkge1xuXHRcdHRoaXMuZ2FtZS5jbGVhckxvZygpO1xuXHR9XG5cdGFkZExvZyhtc2c6IHN0cmluZykge1xuXHRcdHRoaXMuZ2FtZS5hZGRMb2cobXNnKTtcblx0fVxuXHRzZXRTaG9ydE1zZyhtc2c6IHN0cmluZykge1xuXHRcdHRoaXMuZ2FtZS5zZXRTaG9ydE1zZyhtc2cpO1xuXHR9XG5cdHNldE1zZyhtc2c6IHN0cmluZykge1xuXHRcdHRoaXMuZ2FtZS5zZXRNc2cobXNnKTtcblx0fVxuXHRnZXRDYW52YXMoKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ2FtZS5jYW52YXM7XG5cdH1cbn0iLCJleHBvcnQgZnVuY3Rpb24gaXNDaHJvbWUoKSB7XG5cdHJldHVybiBuYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCkuaW5kZXhPZignY2hyb21lJykgPiAtMTtcbn1cblxuLy8gb25XaW5kb3dMb2FkZWRcbmV4cG9ydCBmdW5jdGlvbiBvbkxvYWQoZm46ICgpID0+IGFueSkge1xuXHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgZm4pO1xufVxuLy8gb25BbmltYXRpb25GcmFtZVxuZXhwb3J0IGZ1bmN0aW9uIG9uQW5pbShmbjogKCkgPT4geyBjb250aW51ZTogYm9vbGVhbiB9KSB7XG5cdHJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbiB0bXAoKSB7XG5cdFx0aWYgKGZuKCkuY29udGludWUpIHJlcXVlc3RBbmltYXRpb25GcmFtZSh0bXApO1xuXHR9KTtcbn0iLCJpbXBvcnQgeyBNeUNhbnZhcyB9IGZyb20gXCIuL215Y2FudmFzXCI7XG5cbmNvbnN0IGNodW5rU2l6ZSA9IDE2O1xuY29uc3QgbWluU3dpcGVNb3ZlID0gNTtcblxuZXhwb3J0IGNvbnN0IGVudW0gQ2VsbCB7XG5cdG5vdGhpbmcsXG5cdGJsYWNrLFxuXHR3aGl0ZVxufVxuZXhwb3J0IHR5cGUgUGllY2UgPSBDZWxsLmJsYWNrIHwgQ2VsbC53aGl0ZTtcblxuY2xhc3MgQ2VsbENodW5rIHtcblx0Y2VsbHM6IENlbGxbXVtdXG5cdHhQb3M6IG51bWJlciAvLyAuLi4sIC1jaHVua1NpemUsIDAsIGNodW5rU2l6ZSwgY2h1bmtTaXplKjIsIC4uLlxuXHR5UG9zOiBudW1iZXIgLy8gLi4uLCAtY2h1bmtTaXplLCAwLCBjaHVua1NpemUsIGNodW5rU2l6ZSoyLCAuLi5cblxuXHRjb25zdHJ1Y3Rvcihcblx0XHR4UG9zOiBudW1iZXIsXG5cdFx0eVBvczogbnVtYmVyLFxuXHQpIHtcblx0XHR0aGlzLnhQb3MgPSB4UG9zO1xuXHRcdHRoaXMueVBvcyA9IHlQb3M7XG5cdFx0dGhpcy5jZWxscyA9IG5ldyBBcnJheShjaHVua1NpemUpLmZpbGwoMCkubWFwKFxuXHRcdFx0KCkgPT4gbmV3IEFycmF5KGNodW5rU2l6ZSkuZmlsbCgwKS5tYXAoXG5cdFx0XHRcdCgpID0+IENlbGwubm90aGluZ1xuXHRcdFx0KVxuXHRcdCk7XG5cdH1cblx0c29tZShmbjogKHg6IG51bWJlciwgeTogbnVtYmVyKSA9PiBib29sZWFuKTogYm9vbGVhbiB7XG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBjaHVua1NpemU7IGkrKykge1xuXHRcdFx0Zm9yIChsZXQgaiA9IDA7IGogPCBjaHVua1NpemU7IGorKykge1xuXHRcdFx0XHRpZiAoZm4oaSwgaikpIHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblx0c3VtKGZuOiAoeDogbnVtYmVyLCB5OiBudW1iZXIpID0+IG51bWJlcik6IG51bWJlciB7XG5cdFx0bGV0IHN1bSA9IDA7XG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBjaHVua1NpemU7IGkrKykge1xuXHRcdFx0Zm9yIChsZXQgaiA9IDA7IGogPCBjaHVua1NpemU7IGorKykge1xuXHRcdFx0XHRzdW0gKz0gZm4oaSwgaik7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBzdW07XG5cdH1cbn1cblxuY2xhc3MgQm9hcmQge1xuXHRwcml2YXRlIGNodW5rczogTWFwPG51bWJlciwgTWFwPG51bWJlciwgQ2VsbENodW5rPj4gLy8ga2V5OiAuLi4sIC1jaHVua1NpemUsIDAsIGNodW5rU2l6ZSwgY2h1bmtTaXplKjIsIC4uLlxuXG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHRoaXMuY2h1bmtzID0gbmV3IE1hcCgpO1xuXHR9XG5cdGdldENlbGwoeDogbnVtYmVyLCB5OiBudW1iZXIpOiBDZWxsIHtcblx0XHRjb25zdCBwb3NYID0gcXVhbnRpemUoeCwgY2h1bmtTaXplKTtcblx0XHRjb25zdCBwb3NZID0gcXVhbnRpemUoeSwgY2h1bmtTaXplKTtcblxuXHRcdGxldCB0bXAgPSB0aGlzLmNodW5rcy5nZXQocG9zWC5xdWFudGl6ZWQpO1xuXHRcdGlmICghdG1wKVxuXHRcdFx0cmV0dXJuIENlbGwubm90aGluZztcblxuXHRcdGxldCBjaHVuayA9IHRtcC5nZXQocG9zWS5xdWFudGl6ZWQpO1xuXHRcdGlmICghY2h1bmspXG5cdFx0XHRyZXR1cm4gQ2VsbC5ub3RoaW5nO1xuXG5cdFx0cmV0dXJuIGNodW5rLmNlbGxzW3Bvc1gubW9kXVtwb3NZLm1vZF07XG5cdH1cblx0c2V0Q2VsbCh4OiBudW1iZXIsIHk6IG51bWJlciwgY2VsbDogQ2VsbCk6IHZvaWQge1xuXHRcdGNvbnN0IHBvc1ggPSBxdWFudGl6ZSh4LCBjaHVua1NpemUpO1xuXHRcdGNvbnN0IHBvc1kgPSBxdWFudGl6ZSh5LCBjaHVua1NpemUpO1xuXG5cdFx0bGV0IHRtcCA9IHRoaXMuY2h1bmtzLmdldChwb3NYLnF1YW50aXplZCk7XG5cdFx0aWYgKCF0bXApXG5cdFx0XHR0aGlzLmNodW5rcy5zZXQoXG5cdFx0XHRcdHBvc1gucXVhbnRpemVkLFxuXHRcdFx0XHR0bXAgPSBuZXcgTWFwKClcblx0XHRcdCk7XG5cblx0XHRsZXQgY2h1bmsgPSB0bXAuZ2V0KHBvc1kucXVhbnRpemVkKTtcblx0XHRpZiAoIWNodW5rKVxuXHRcdFx0dG1wLnNldChcblx0XHRcdFx0cG9zWS5xdWFudGl6ZWQsXG5cdFx0XHRcdGNodW5rID0gbmV3IENlbGxDaHVuayhwb3NYLnF1YW50aXplZCwgcG9zWS5xdWFudGl6ZWQpXG5cdFx0XHQpO1xuXG5cdFx0Y2h1bmsuY2VsbHNbcG9zWC5tb2RdW3Bvc1kubW9kXSA9IGNlbGw7XG5cdH1cblx0c29tZShmbjogKHg6IG51bWJlciwgeTogbnVtYmVyKSA9PiBib29sZWFuKTogYm9vbGVhbiB7XG5cdFx0Zm9yIChjb25zdCBjIG9mIHRoaXMuY2h1bmtzLnZhbHVlcygpKSB7XG5cdFx0XHRmb3IgKGNvbnN0IGNodW5rIG9mIGMudmFsdWVzKCkpIHtcblx0XHRcdFx0Y29uc3QgY2h1bmtfeFBvcyA9IGNodW5rLnhQb3M7XG5cdFx0XHRcdGNvbnN0IGNodW5rX3lQb3MgPSBjaHVuay55UG9zO1xuXHRcdFx0XHRpZiAoY2h1bmsuc29tZSgoeCwgeSkgPT4gZm4oeCArIGNodW5rX3hQb3MsIHkgKyBjaHVua195UG9zKSkpXG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXHRzdW0oZm46ICh4OiBudW1iZXIsIHk6IG51bWJlcikgPT4gbnVtYmVyKTogbnVtYmVyIHtcblx0XHRsZXQgc3VtID0gMDtcblx0XHRmb3IgKGNvbnN0IGMgb2YgdGhpcy5jaHVua3MudmFsdWVzKCkpIHtcblx0XHRcdGZvciAoY29uc3QgY2h1bmsgb2YgYy52YWx1ZXMoKSkge1xuXHRcdFx0XHRjb25zdCBjaHVua194UG9zID0gY2h1bmsueFBvcztcblx0XHRcdFx0Y29uc3QgY2h1bmtfeVBvcyA9IGNodW5rLnlQb3M7XG5cdFx0XHRcdHN1bSArPSBjaHVuay5zdW0oKHgsIHkpID0+IGZuKHggKyBjaHVua194UG9zLCB5ICsgY2h1bmtfeVBvcykpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gc3VtO1xuXHR9XG5cdHJlc2V0KCk6IHZvaWQge1xuXHRcdHRoaXMuY2h1bmtzID0gbmV3IE1hcCgpO1xuXHR9XG59XG5cbnR5cGUgRGkyRCA9IFtudW1iZXIsIG51bWJlcl07IC8vIERpcmVjdGlvbiAyRFxuY29uc3QgZGk4OiBEaTJEW11cblx0PSBbWy0xLCAtMV0sIFstMSwgMF0sIFstMSwgMV0sIFswLCAtMV0sIFswLCAxXSwgWzEsIC0xXSwgWzEsIDBdLCBbMSwgMV1dO1xuXG5leHBvcnQgY2xhc3MgUmV2ZXJzaUJvYXJkIGV4dGVuZHMgQm9hcmQge1xuXHRvbkFmdGVyUHV0ID0gKHg6IG51bWJlciwgeTogbnVtYmVyLCBwaWVjZTogUGllY2UpID0+IHsgfTtcblx0Y29uc3RydWN0b3IoaW5pdGlhbGl6ZSA9IHRydWUpIHtcblx0XHRzdXBlcigpO1xuXHRcdGlmIChpbml0aWFsaXplKVxuXHRcdFx0dGhpcy5yZXNldCgpO1xuXHR9XG5cdHJlc2V0KCk6IHZvaWQge1xuXHRcdHN1cGVyLnJlc2V0KCk7XG5cblx0XHQvLyDil4sg4pePIDogV2hpdGUgQmxhY2tcblx0XHQvLyDil48g4peLIDogQmxhY2sgV2hpdGVcblx0XHR0aGlzLnNldENlbGwoMCwgMCwgQ2VsbC53aGl0ZSk7XG5cdFx0dGhpcy5zZXRDZWxsKC0xLCAtMSwgQ2VsbC53aGl0ZSk7XG5cdFx0dGhpcy5zZXRDZWxsKC0xLCAwLCBDZWxsLmJsYWNrKTtcblx0XHR0aGlzLnNldENlbGwoMCwgLTEsIENlbGwuYmxhY2spO1xuXHR9XG5cdGNhblB1dCh4OiBudW1iZXIsIHk6IG51bWJlciwgcGllY2U6IFBpZWNlKTogYm9vbGVhbiB7XG5cdFx0aWYgKHRoaXMuZ2V0Q2VsbCh4LCB5KSAhPT0gQ2VsbC5ub3RoaW5nKVxuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXG5cdFx0Y29uc3Qgb3Bwb25lbnQgPSBvcHBvbmVudFBpZWNlKHBpZWNlKTtcblx0XHRyZXR1cm4gZGk4LnNvbWUoZGkgPT4gdGhpcy5jYW5SZXZlcnNlRGkoeCwgeSwgcGllY2UsIGRpKSk7XG5cdH1cblx0Y2FuUHV0U29tZXdoZXJlKHBpZWNlOiBQaWVjZSk6IGJvb2xlYW4ge1xuXHRcdC8vIFRPRE86IFBlcmZvcm1hbmNlIGltcHJvdmVtZW50XG5cdFx0cmV0dXJuIHRoaXMuc29tZSgoeCwgeSkgPT4gdGhpcy5jYW5QdXQoeCwgeSwgcGllY2UpKTtcblx0fVxuXHRjb3VudFBpZWNlKHBpZWNlOiBQaWVjZSk6IG51bWJlciB7XG5cdFx0Ly8gVE9ETzogUGVyZm9ybWFuY2UgaW1wcm92ZW1lbnRcblx0XHRyZXR1cm4gdGhpcy5zdW0oKHgsIHkpID0+IHRoaXMuZ2V0Q2VsbCh4LCB5KSA9PT0gcGllY2UgPyAxIDogMCk7XG5cdH1cblx0cHV0KHg6IG51bWJlciwgeTogbnVtYmVyLCBwaWVjZTogUGllY2UpOiB2b2lkIHtcblx0XHRpZiAoIXRoaXMuY2FuUHV0KHgsIHksIHBpZWNlKSkgdGhyb3cgXCJCVUdcIjtcblx0XHRkaTguZm9yRWFjaChkaSA9PiB7XG5cdFx0XHRpZiAodGhpcy5jYW5SZXZlcnNlRGkoeCwgeSwgcGllY2UsIGRpKSlcblx0XHRcdFx0dGhpcy5yZXZlcnNlRGkoeCwgeSwgcGllY2UsIGRpKTtcblx0XHR9KTtcblx0XHR0aGlzLnNldENlbGwoeCwgeSwgcGllY2UpO1xuXHRcdHRoaXMub25BZnRlclB1dCh4LCB5LCBwaWVjZSk7XG5cdH1cblx0aXNGaW5pc2hlZCgpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gIXRoaXMuY2FuUHV0U29tZXdoZXJlKENlbGwuYmxhY2spICYmICF0aGlzLmNhblB1dFNvbWV3aGVyZShDZWxsLndoaXRlKTtcblx0fVxuXHQvLyBbeCtkaVswXSwgeStkaVsxXV0g5Lul6ZmN44Gu6YOo5YiG44Gu44G/44KS6KaL44Gm5Yik5pat44GX44G+44GZ44CCXG5cdHByaXZhdGUgY2FuUmV2ZXJzZURpKHg6IG51bWJlciwgeTogbnVtYmVyLCBwaWVjZTogUGllY2UsIGRpOiBEaTJEKTogYm9vbGVhbiB7XG5cdFx0Y29uc3Qgb3Bwb25lbnQgPSBvcHBvbmVudFBpZWNlKHBpZWNlKTtcblxuXHRcdGxldCBjWCA9IHgsIGNZID0geTtcblx0XHRsZXQgY250ID0gMDtcblx0XHR3aGlsZSAodHJ1ZSkge1xuXHRcdFx0Y1ggKz0gZGlbMF07IGNZICs9IGRpWzFdO1xuXHRcdFx0Y29uc3QgY0NlbGwgPSB0aGlzLmdldENlbGwoY1gsIGNZKTtcblx0XHRcdGlmIChjQ2VsbCA9PT0gb3Bwb25lbnQpXG5cdFx0XHRcdGNudCsrO1xuXHRcdFx0ZWxzZSBpZiAoY0NlbGwgPT09IHBpZWNlKVxuXHRcdFx0XHRyZXR1cm4gY250ID4gMDtcblx0XHRcdGVsc2Vcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0fVxuXHRwcml2YXRlIHJldmVyc2VEaSh4OiBudW1iZXIsIHk6IG51bWJlciwgcGllY2U6IFBpZWNlLCBkaTogRGkyRCk6IHZvaWQge1xuXHRcdGNvbnN0IG9wcG9uZW50ID0gb3Bwb25lbnRQaWVjZShwaWVjZSk7XG5cblx0XHRsZXQgY1ggPSB4LCBjWSA9IHk7XG5cdFx0bGV0IGNudCA9IDA7XG5cdFx0d2hpbGUgKHRydWUpIHtcblx0XHRcdGNYICs9IGRpWzBdOyBjWSArPSBkaVsxXTtcblx0XHRcdGNvbnN0IGNDZWxsID0gdGhpcy5nZXRDZWxsKGNYLCBjWSk7XG5cdFx0XHRpZiAoY0NlbGwgPT09IG9wcG9uZW50KVxuXHRcdFx0XHR0aGlzLnNldENlbGwoY1gsIGNZLCBwaWVjZSk7XG5cdFx0XHRlbHNlIGlmIChjQ2VsbCA9PT0gcGllY2UpXG5cdFx0XHRcdHJldHVybjtcblx0XHRcdGVsc2Vcblx0XHRcdFx0dGhyb3cgXCJCVUdcIjtcblx0XHR9XG5cdH1cbn1cblxuLy8gVE9ETzogc2V0Q2VsbCDjgafjga/jgIHoh6rli5XnmoTjgaogcmVuZGVyIOOBjOihjOOCj+OCjOOBquOBhOS7tlxuZXhwb3J0IGNsYXNzIERyYXdhYmxlUmV2ZXJzaUJvYXJkIGV4dGVuZHMgUmV2ZXJzaUJvYXJkIHtcblx0cHJpdmF0ZSBjYW52YXM6IE15Q2FudmFzIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuXHRwcml2YXRlIGNlbGxTaXplID0gMTtcblx0cHJpdmF0ZSBvcmlnaW5QaXhlbDogW251bWJlciwgbnVtYmVyXSA9IFswLCAwXTsgLy8g55uk6Z2i44GuWzAsMF3jgYzjganjgZPjga7luqfmqJnjgavmj4/nlLvjgZXjgozjgovjgbnjgY3jgYvjgpLnpLrjgZnjgIJbMCwwXeOBquOCieOBsOOAgWNhbnZhc+OBruS4reWkruOBi+OCiVswLDBd5bmz6KGM56e75YuV44GX44Gf5L2N572u44Gr5o+P55S744GZ44KL44CCXG5cdHByaXZhdGUgc2VsZWN0ZWQ6IHVuZGVmaW5lZCB8IFtudW1iZXIsIG51bWJlcl0gPSB1bmRlZmluZWQ7XG5cdHByaXZhdGUgcGxheWVyUGllY2U6IFBpZWNlIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuXG5cdG9uQ2VsbENsaWNrZWQgPSAoeDogbnVtYmVyLCB5OiBudW1iZXIpID0+IHsgfTtcblxuXHRiaW5kQ2FudmFzKGNhbnZhczogTXlDYW52YXMpIHtcblx0XHR0aGlzLmNhbnZhcyA9IGNhbnZhcztcblx0XHRjb25zdCBfb25DYW52YXNSZXNpemUgPSBjYW52YXMub25SZXNpemU7XG5cdFx0Y2FudmFzLm9uUmVzaXplID0gKCkgPT4ge1xuXHRcdFx0X29uQ2FudmFzUmVzaXplLmFwcGx5KGNhbnZhcyk7XG5cdFx0XHR0aGlzLnJlbmRlcigpO1xuXHRcdH07XG5cblx0XHRsZXQgc3RhcnRQb3MgPSBbMCwgMF07XG5cdFx0Y2FudmFzLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwicG9pbnRlcmRvd25cIiwgZSA9PiB7XG5cdFx0XHRzdGFydFBvcyA9IFtlLm9mZnNldFgsIGUub2Zmc2V0WV07XG5cdFx0fSk7XG5cdFx0Y2FudmFzLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwicG9pbnRlcm1vdmVcIiwgZSA9PiB7XG5cdFx0XHRpZiAoZS5idXR0b25zID4gMCkge1xuXHRcdFx0XHRjb25zdCBvZmZzZXQ6IFtudW1iZXIsIG51bWJlcl0gPSBbXG5cdFx0XHRcdFx0KGUub2Zmc2V0WCAtIHN0YXJ0UG9zWzBdKSAqIGNhbnZhcy5kcHIsXG5cdFx0XHRcdFx0KGUub2Zmc2V0WSAtIHN0YXJ0UG9zWzFdKSAqIGNhbnZhcy5kcHJdO1xuXHRcdFx0XHRjb25zdCBuZXdPcmlnaW5QaXhlbDogW251bWJlciwgbnVtYmVyXSA9IFtcblx0XHRcdFx0XHRvZmZzZXRbMF0gKyB0aGlzLm9yaWdpblBpeGVsWzBdLFxuXHRcdFx0XHRcdG9mZnNldFsxXSArIHRoaXMub3JpZ2luUGl4ZWxbMV1dO1xuXHRcdFx0XHR0aGlzLnJlbmRlcihuZXdPcmlnaW5QaXhlbCk7XG5cdFx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHRjYW52YXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJwb2ludGVydXBcIiwgZSA9PiB7XG5cdFx0XHRjb25zdCBvZmZzZXQ6IFtudW1iZXIsIG51bWJlcl0gPSBbXG5cdFx0XHRcdChlLm9mZnNldFggLSBzdGFydFBvc1swXSkgKiBjYW52YXMuZHByLFxuXHRcdFx0XHQoZS5vZmZzZXRZIC0gc3RhcnRQb3NbMV0pICogY2FudmFzLmRwcl07XG5cdFx0XHRpZiAoTWF0aC5oeXBvdCguLi5vZmZzZXQpIDwgbWluU3dpcGVNb3ZlKSB7XG5cdFx0XHRcdC8vIHNlbGVjdFxuXHRcdFx0XHRjb25zdCBwb3MgPSB0aGlzLnBpeGVsMmNlbGwoc3RhcnRQb3NbMF0gKiBjYW52YXMuZHByLCBzdGFydFBvc1sxXSAqIGNhbnZhcy5kcHIpO1xuXHRcdFx0XHR0aGlzLnNlbGVjdGVkID0gW01hdGguZmxvb3IocG9zLngpLCBNYXRoLmZsb29yKHBvcy55KV07XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zdCBuZXdPcmlnaW5QaXhlbDogW251bWJlciwgbnVtYmVyXSA9IFtcblx0XHRcdFx0XHRvZmZzZXRbMF0gKyB0aGlzLm9yaWdpblBpeGVsWzBdLFxuXHRcdFx0XHRcdG9mZnNldFsxXSArIHRoaXMub3JpZ2luUGl4ZWxbMV1dO1xuXHRcdFx0XHR0aGlzLm9yaWdpblBpeGVsID0gbmV3T3JpZ2luUGl4ZWw7XG5cdFx0XHR9XG5cdFx0XHR0aGlzLnJlbmRlcigpO1xuXHRcdH0pO1xuXG5cdFx0dGhpcy5yZW5kZXIoKTtcblx0fVxuXHRnZXRDZWxsU2l6ZSgpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLmNlbGxTaXplO1xuXHR9XG5cdHNldENlbGxTaXplKHBpeGVsczogbnVtYmVyKTogdm9pZCB7XG5cdFx0dGhpcy5jZWxsU2l6ZSA9IHBpeGVscztcblx0XHR0aGlzLnJlbmRlcigpO1xuXHR9XG5cdGdldHBsYXllclBpZWNlKCk6IFBpZWNlIHwgdW5kZWZpbmVkIHtcblx0XHRyZXR1cm4gdGhpcy5wbGF5ZXJQaWVjZTtcblx0fVxuXHRzZXRQbGF5ZXJQaWVjZShwaWVjZTogUGllY2UgfCB1bmRlZmluZWQpIHtcblx0XHR0aGlzLnBsYXllclBpZWNlID0gcGllY2U7XG5cdFx0dGhpcy5yZW5kZXIoKTtcblx0fVxuXHRnZXRTZWxlY3RlZCgpOiB7IHg6IG51bWJlciwgeTogbnVtYmVyIH0gfCB1bmRlZmluZWQge1xuXHRcdGlmICh0aGlzLnNlbGVjdGVkKSByZXR1cm4geyB4OiB0aGlzLnNlbGVjdGVkWzBdLCB5OiB0aGlzLnNlbGVjdGVkWzFdIH07XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxuXHRzZXRTZWxlY3RlZChwb3M6IHsgeDogbnVtYmVyLCB5OiBudW1iZXIgfSB8IHVuZGVmaW5lZCkge1xuXHRcdGlmIChwb3MpIHRoaXMuc2VsZWN0ZWQgPSBbcG9zLngsIHBvcy55XTtcblx0XHRlbHNlIHRoaXMuc2VsZWN0ZWQgPSB1bmRlZmluZWQ7XG5cdH1cblx0cHV0KHg6IG51bWJlciwgeTogbnVtYmVyLCBwaWVjZTogUGllY2UpOiB2b2lkIHtcblx0XHRzdXBlci5wdXQoeCwgeSwgcGllY2UpO1xuXHRcdHRoaXMucmVuZGVyKCk7XG5cdH1cblx0cmVuZGVyKG9yaWdpblBpeGVsID0gdGhpcy5vcmlnaW5QaXhlbCwgcGxheWVyUGllY2UgPSB0aGlzLnBsYXllclBpZWNlKSB7XG5cdFx0aWYgKCF0aGlzLmNhbnZhcykgcmV0dXJuO1xuXHRcdGNvbnN0XG5cdFx0XHRjYW52YXMgPSB0aGlzLmNhbnZhcyxcblx0XHRcdHdpZHRoID0gY2FudmFzLndpZHRoLFxuXHRcdFx0aGVpZ2h0ID0gY2FudmFzLmhlaWdodCxcblx0XHRcdGNlbGxTaXplID0gdGhpcy5jZWxsU2l6ZTtcblx0XHRjb25zdCBjZWxsMnBpeGVsID0gKHg6IG51bWJlciwgeTogbnVtYmVyKSA9PiB0aGlzLmNlbGwycGl4ZWwoeCwgeSwgb3JpZ2luUGl4ZWwpO1xuXHRcdGNvbnN0IHBpeGVsMmNlbGwgPSAoeDogbnVtYmVyLCB5OiBudW1iZXIpID0+IHRoaXMucGl4ZWwyY2VsbCh4LCB5LCBvcmlnaW5QaXhlbCk7XG5cdFx0Y29uc3QgYm9hcmRWUCA9IHsgLy8gdmlld3BvcnRcblx0XHRcdGxlZnQ6IE1hdGguZmxvb3IocGl4ZWwyY2VsbCgwLCAwKS54KSxcblx0XHRcdHRvcDogTWF0aC5mbG9vcihwaXhlbDJjZWxsKDAsIDApLnkpLFxuXHRcdFx0cmlnaHQ6IE1hdGguY2VpbChwaXhlbDJjZWxsKHdpZHRoLCBoZWlnaHQpLngpLFxuXHRcdFx0Ym90dG9tOiBNYXRoLmNlaWwocGl4ZWwyY2VsbCh3aWR0aCwgaGVpZ2h0KS55KSxcblx0XHR9O1xuXG5cdFx0Ly8gcmVuZGVyXG5cblx0XHQvLyAxLiBiYWNrZ3JvdW5kXG5cdFx0Y2FudmFzLmZpbGxBbGwoXCIjZWVlXCIpO1xuXG5cdFx0Ly8gMi4gc2VsZWN0ZWQgY2VsbFxuXHRcdGlmICh0aGlzLnNlbGVjdGVkKSB7XG5cdFx0XHRjb25zdCBwaXhlbCA9IGNlbGwycGl4ZWwodGhpcy5zZWxlY3RlZFswXSwgdGhpcy5zZWxlY3RlZFsxXSk7XG5cdFx0XHRjYW52YXMuYmVnaW5QYXRoKCk7XG5cdFx0XHR0aGlzLmNhbnZhcy5yZWN0KHBpeGVsLmxlZnQsIHBpeGVsLnRvcCwgY2VsbFNpemUsIGNlbGxTaXplKTtcblx0XHRcdGNhbnZhcy5maWxsKFwiI2NkY1wiKTtcblx0XHR9XG5cblx0XHQvLyAzLiBncmlkIGxpbmVzXG5cdFx0Zm9yIChsZXQgeCA9IGJvYXJkVlAubGVmdDsgeCA8PSBib2FyZFZQLnJpZ2h0OyB4KyspIHtcblx0XHRcdGNvbnN0IHhQaXhlbCA9IGNlbGwycGl4ZWwoeCwgMCkubGVmdDtcblx0XHRcdGNhbnZhcy5iZWdpblBhdGgoKTtcblx0XHRcdHRoaXMuY2FudmFzLmxpbmUoeFBpeGVsLCAwLCB4UGl4ZWwsIGhlaWdodCk7XG5cdFx0XHRjYW52YXMuc3Ryb2tlKHggJSBjaHVua1NpemUgPT0gMCA/IFwiIzhiOFwiIDogXCIjYmRiXCIpO1xuXHRcdH1cblx0XHRmb3IgKGxldCB5ID0gYm9hcmRWUC50b3A7IHkgPD0gYm9hcmRWUC5ib3R0b207IHkrKykge1xuXHRcdFx0Y29uc3QgeVBpeGVsID0gY2VsbDJwaXhlbCgwLCB5KS50b3A7XG5cdFx0XHRjYW52YXMuYmVnaW5QYXRoKCk7XG5cdFx0XHR0aGlzLmNhbnZhcy5saW5lKDAsIHlQaXhlbCwgd2lkdGgsIHlQaXhlbCk7XG5cdFx0XHRjYW52YXMuc3Ryb2tlKHkgJSBjaHVua1NpemUgPT0gMCA/IFwiIzhiOFwiIDogXCIjYmRiXCIpO1xuXHRcdH1cblxuXHRcdC8vIDQuIHBpZWNlcyAmIHB1dHRhYmxlIGNlbGxzIFxuXHRcdGNvbnN0XG5cdFx0XHRyYWRpdXMgPSAoY2VsbFNpemUgLyAyKSAqIDAuOCxcblx0XHRcdHN1Z2dlc3RSYWRpdXMgPSBNYXRoLm1heCgxLCByYWRpdXMgKiAwLjIpO1xuXHRcdGZvciAobGV0IHggPSBib2FyZFZQLmxlZnQ7IHggPD0gYm9hcmRWUC5yaWdodDsgeCsrKSB7XG5cdFx0XHRmb3IgKGxldCB5ID0gYm9hcmRWUC50b3A7IHkgPD0gYm9hcmRWUC5ib3R0b207IHkrKykge1xuXHRcdFx0XHRjb25zdCBwaXhlbCA9IGNlbGwycGl4ZWwoeCwgeSk7XG5cdFx0XHRcdGNvbnN0XG5cdFx0XHRcdFx0Y2VudGVyWCA9IHBpeGVsLmxlZnQgKyBjZWxsU2l6ZSAvIDIsXG5cdFx0XHRcdFx0Y2VudGVyWSA9IHBpeGVsLnRvcCArIGNlbGxTaXplIC8gMjtcblxuXHRcdFx0XHRjb25zdCBwaWVjZSA9IHRoaXMuZ2V0Q2VsbCh4LCB5KTtcblx0XHRcdFx0aWYgKHBpZWNlID09PSBDZWxsLmJsYWNrKSB7XG5cdFx0XHRcdFx0Y2FudmFzLmJlZ2luUGF0aCgpO1xuXHRcdFx0XHRcdHRoaXMuY2FudmFzLnJvdW5kKGNlbnRlclgsIGNlbnRlclksIHJhZGl1cyk7XG5cdFx0XHRcdFx0Y2FudmFzLmZpbGwoXCIjNTU1XCIpO1xuXHRcdFx0XHR9IGVsc2UgaWYgKHBpZWNlID09PSBDZWxsLndoaXRlKSB7XG5cdFx0XHRcdFx0Y2FudmFzLmJlZ2luUGF0aCgpO1xuXHRcdFx0XHRcdHRoaXMuY2FudmFzLnJvdW5kKGNlbnRlclgsIGNlbnRlclksIHJhZGl1cyk7XG5cdFx0XHRcdFx0Y2FudmFzLnN0cm9rZShcIiM1NTVcIik7XG5cdFx0XHRcdH0gZWxzZSBpZiAocGllY2UgPT09IENlbGwubm90aGluZykge1xuXHRcdFx0XHRcdGlmIChwbGF5ZXJQaWVjZSAmJiB0aGlzLmNhblB1dCh4LCB5LCBwbGF5ZXJQaWVjZSkpIHtcblx0XHRcdFx0XHRcdGNhbnZhcy5iZWdpblBhdGgoKTtcblx0XHRcdFx0XHRcdHRoaXMuY2FudmFzLnJvdW5kKGNlbnRlclgsIGNlbnRlclksIHN1Z2dlc3RSYWRpdXMpO1xuXHRcdFx0XHRcdFx0Y2FudmFzLmZpbGwoXCIjNTU1XCIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHRocm93IFwiQlVHXCI7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHByaXZhdGUgY2VsbDJwaXhlbCh4OiBudW1iZXIsIHk6IG51bWJlciwgb3JpZ2luUGl4ZWwgPSB0aGlzLm9yaWdpblBpeGVsKSB7XG5cdFx0aWYgKCF0aGlzLmNhbnZhcykgdGhyb3cgXCJCVUdcIjtcblx0XHRjb25zdFxuXHRcdFx0Y2FudmFzID0gdGhpcy5jYW52YXMsXG5cdFx0XHR3aWR0aCA9IGNhbnZhcy53aWR0aCxcblx0XHRcdGhlaWdodCA9IGNhbnZhcy5oZWlnaHQsXG5cdFx0XHRjZWxsU2l6ZSA9IHRoaXMuY2VsbFNpemU7XG5cdFx0cmV0dXJuICh7XG5cdFx0XHRsZWZ0OiBvcmlnaW5QaXhlbFswXSArIHggKiBjZWxsU2l6ZSArIHdpZHRoIC8gMixcblx0XHRcdHRvcDogb3JpZ2luUGl4ZWxbMV0gKyB5ICogY2VsbFNpemUgKyBoZWlnaHQgLyAyLFxuXHRcdH0pXG5cdH07XG5cdHByaXZhdGUgcGl4ZWwyY2VsbCh4OiBudW1iZXIsIHk6IG51bWJlciwgb3JpZ2luUGl4ZWwgPSB0aGlzLm9yaWdpblBpeGVsKSB7XG5cdFx0aWYgKCF0aGlzLmNhbnZhcykgdGhyb3cgXCJCVUdcIjtcblx0XHRjb25zdFxuXHRcdFx0Y2FudmFzID0gdGhpcy5jYW52YXMsXG5cdFx0XHR3aWR0aCA9IGNhbnZhcy53aWR0aCxcblx0XHRcdGhlaWdodCA9IGNhbnZhcy5oZWlnaHQsXG5cdFx0XHRjZWxsU2l6ZSA9IHRoaXMuY2VsbFNpemU7XG5cdFx0cmV0dXJuICh7XG5cdFx0XHR4OiAoeCAtIHdpZHRoIC8gMiAtIG9yaWdpblBpeGVsWzBdKSAvIGNlbGxTaXplLFxuXHRcdFx0eTogKHkgLSBoZWlnaHQgLyAyIC0gb3JpZ2luUGl4ZWxbMV0pIC8gY2VsbFNpemUsXG5cdFx0fSk7XG5cdH1cbn1cblxuZnVuY3Rpb24gcXVhbnRpemUobnVtOiBudW1iZXIsIGRpdmlzb3I6IG51bWJlcikge1xuXHRjb25zdCBxdWFudGl6ZWQgPSBNYXRoLmZsb29yKG51bSAvIGRpdmlzb3IpICogZGl2aXNvcjtcblx0Y29uc3QgbW9kID0gbnVtIC0gcXVhbnRpemVkO1xuXHRyZXR1cm4geyBxdWFudGl6ZWQsIG1vZCB9O1xufVxuZXhwb3J0IGZ1bmN0aW9uIG9wcG9uZW50UGllY2UocGllY2U6IFBpZWNlKTogUGllY2Uge1xuXHRpZiAocGllY2UgPT09IENlbGwuYmxhY2spIHJldHVybiBDZWxsLndoaXRlO1xuXHRpZiAocGllY2UgPT09IENlbGwud2hpdGUpIHJldHVybiBDZWxsLmJsYWNrO1xuXHR0aHJvdyBcIkJVR1wiO1xufVxuIiwiaW1wb3J0IHsgVUkgfSBmcm9tIFwiLi91aVwiO1xuaW1wb3J0IHsgb25Mb2FkLCBpc0Nocm9tZSB9IGZyb20gXCIuL3V0aWxcIjtcbmltcG9ydCB7IERyYXdhYmxlUmV2ZXJzaUJvYXJkLCBDZWxsLCBvcHBvbmVudFBpZWNlIH0gZnJvbSBcIi4vcmV2ZXJzaVwiO1xuXG5mdW5jdGlvbiBzaG93Q29uc29sZUJhbm5lcigpIHtcblx0aWYgKGlzQ2hyb21lKCkpIHtcblx0XHRjb25zb2xlLmxvZyhcblx0XHRcdFwiXFxuXCIgK1xuXHRcdFx0XCIlYyAlYyBJbmZpbml0ZSBSZXZlcnNpIFxcblwiICtcblx0XHRcdFwiJWMgJWMgTWFkZSBieSBvbWFzYWt1biBvbiAyMDE5XFxuXCIgK1xuXHRcdFx0XCIlYyAlYyBHaXRIdWI6IGh0dHBzOi8vZ2l0aHViLmNvbS9vbWFzYWt1bi9pbmZfcmV2ZXJzaVxcblwiICtcblx0XHRcdFwiJWMgJWMgRW5qb3khXFxuXCIsXG5cdFx0XHRcImNvbG9yOiAjMTMwZjQwOyBiYWNrZ3JvdW5kLWNvbG9yOiAjYTc5OWVmOyBsaW5lLWhlaWdodDogMjtcIixcblx0XHRcdFwiY29sb3I6ICNkZGQ2ZmY7IGJhY2tncm91bmQtY29sb3I6ICM1MjQ5ODM7IGxpbmUtaGVpZ2h0OiAyO1wiLFxuXHRcdFx0XCJjb2xvcjogIzEzMGY0MDsgYmFja2dyb3VuZC1jb2xvcjogI2E3OTllZjsgbGluZS1oZWlnaHQ6IDEuNTtcIixcblx0XHRcdFwiXCIsXG5cdFx0XHRcImNvbG9yOiAjMTMwZjQwOyBiYWNrZ3JvdW5kLWNvbG9yOiAjYTc5OWVmOyBsaW5lLWhlaWdodDogMS41O1wiLFxuXHRcdFx0XCJcIixcblx0XHRcdFwiY29sb3I6ICMxMzBmNDA7IGJhY2tncm91bmQtY29sb3I6ICNhNzk5ZWY7IGxpbmUtaGVpZ2h0OiAxLjU7XCIsXG5cdFx0XHRcImZvbnQtd2VpZ2h0OiBib2xkXCJcblx0XHQpO1xuXHR9IGVsc2Uge1xuXHRcdGNvbnNvbGUubG9nKFxuXHRcdFx0XCJcXG5cIiArXG5cdFx0XHRcIuKUgyAjIyMgSW5maW5pdGUgUmV2ZXJzaSAjIyMgXFxuXCIgK1xuXHRcdFx0XCLilIMgXFxuXCIgK1xuXHRcdFx0XCLilIMgTWFkZSBieSBvbWFzYWt1biBvbiAyMDE5XFxuXCIgK1xuXHRcdFx0XCLilIMgR2l0SHViOiBodHRwczovL2dpdGh1Yi5jb20vb21hc2FrdW5cXG5cIiArXG5cdFx0XHRcIuKUgyBFbmpveSFcXG5cIlxuXHRcdCk7XG5cdH1cbn1cblxuXG4vLyNlbmRyZWdpb25cblxuc2hvd0NvbnNvbGVCYW5uZXIoKTtcbm9uTG9hZCgoKSA9PiB7XG5cdGNvbnN0IHVpID0gbmV3IFVJKCk7XG5cdGxldCBib2FyZCA9IG5ldyBEcmF3YWJsZVJldmVyc2lCb2FyZCgpO1xuXHRjb25zb2xlLmxvZyh3aW5kb3dbXCJ1aVwiXSA9IHVpLCB3aW5kb3dbXCJib2FyZFwiXSA9IGJvYXJkKTtcblxuXHRsZXQgY3VycmVudFR1cm4gPSAxO1xuXHRsZXQgbWF4VHVybkNvdW50ID0gLTE7XG5cdGNvbnN0IHVwZGF0ZVNob3J0TXNnID0gKCkgPT4ge1xuXHRcdHVpLnNldFNob3J0TXNnKGDil48geCAke2JvYXJkLmNvdW50UGllY2UoQ2VsbC5ibGFjayl9ICwg4peLIHggJHtib2FyZC5jb3VudFBpZWNlKENlbGwud2hpdGUpfWApO1xuXHR9O1xuXHRjb25zdCB1cGRhdGVNc2cgPSAoKSA9PiB7XG5cdFx0aWYgKGlzR2FtZW92ZXIoKSkge1xuXHRcdFx0Y29uc3Qgd0NvdW50ID0gYm9hcmQuY291bnRQaWVjZShDZWxsLndoaXRlKTtcblx0XHRcdGNvbnN0IGJDb3VudCA9IGJvYXJkLmNvdW50UGllY2UoQ2VsbC5ibGFjayk7XG5cdFx0XHRpZiAod0NvdW50ID09PSBiQ291bnQpIHtcblx0XHRcdFx0dWkuc2V0TXNnKFwi44Ky44O844Og57WC5LqG44CC5LiW44Gr44KC54+N44GX44GE5byV44GN5YiG44GR44Gn44GZ77yBXCIpO1xuXHRcdFx0fVxuXHRcdFx0dWkuc2V0TXNnKGDjgrLjg7zjg6DntYLkuobjgIIke2JDb3VudCA+IHdDb3VudCA/IFwi4pePXCIgOiBcIuKXi1wifSDjga7li53liKnjgafjgZnvvIFgKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0Y29uc3QgcGllY2UgPSBib2FyZC5nZXRwbGF5ZXJQaWVjZSgpO1xuXHRcdGlmICghcGllY2UpIHJldHVybjtcblx0XHR1aS5zZXRNc2coYOesrCR7Y3VycmVudFR1cm5944K/44O844Oz44CCJHtwaWVjZSA9PT0gQ2VsbC5ibGFjayA/IFwi4pePXCIgOiBcIuKXi1wifSDjga7jgr/jg7zjg7PjgafjgZnjgIJgKTtcblx0fVxuXHRjb25zdCBpc0dhbWVvdmVyID0gKCkgPT4ge1xuXHRcdHJldHVybiBib2FyZC5pc0ZpbmlzaGVkKCkgfHwgY3VycmVudFR1cm4gPiBtYXhUdXJuQ291bnQ7XG5cdH1cblxuXHRib2FyZC5iaW5kQ2FudmFzKHVpLmdldENhbnZhcygpKTtcblx0Ym9hcmQuc2V0UGxheWVyUGllY2UoQ2VsbC5ibGFjayk7XG5cdGJvYXJkLnNldENlbGxTaXplKDY0KTtcblx0Ym9hcmQucmVzZXQoKTtcblx0Ym9hcmQub25BZnRlclB1dCA9ICh4LCB5LCBwaWVjZSkgPT4ge1xuXHRcdHVpLmFkZExvZyhgJHtwaWVjZSA9PT0gQ2VsbC5ibGFjayA/IFwi4pePXCIgOiBcIuKXi1wifSAoJHt4fSwgJHt5fSlgKTtcblx0XHRjdXJyZW50VHVybisrO1xuXHRcdHVwZGF0ZVNob3J0TXNnKCk7XG5cdH07XG5cblx0dWkub25ab29tSW5DbGlja2VkID0gKCkgPT4gYm9hcmQuc2V0Q2VsbFNpemUoYm9hcmQuZ2V0Q2VsbFNpemUoKSAqIDEuMik7XG5cdHVpLm9uWm9vbU91dENsaWNrZWQgPSAoKSA9PiBib2FyZC5zZXRDZWxsU2l6ZShib2FyZC5nZXRDZWxsU2l6ZSgpIC8gMS4yKTtcblx0dWkub25QdXRDbGlja2VkID0gKCkgPT4ge1xuXHRcdGlmIChpc0dhbWVvdmVyKCkpIHtcblx0XHRcdGFsZXJ0KFwi44Ky44O844Og44Gv5pei44Gr57WC44KP44Gj44Gf44Gu44Gn44GZ44CC44Kz44Oe44KS572u44GP44GT44Go44Gv44Gn44GN44Gq44GE44Gu44Gn44GZ44CCXCIpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRjb25zdCBzZWxlY3RlZCA9IGJvYXJkLmdldFNlbGVjdGVkKCk7XG5cdFx0Y29uc3QgcGxheWVyID0gYm9hcmQuZ2V0cGxheWVyUGllY2UoKTtcblx0XHRpZiAocGxheWVyID09PSB1bmRlZmluZWQpIHRocm93IFwiQlVHXCI7XG5cdFx0aWYgKCFzZWxlY3RlZCkge1xuXHRcdFx0dWkuc2V0TXNnKFwi44Gp44Gu44Oe44K544Gr44Kz44Oe44KS572u44GN44Gf44GE44Gn44GZ44GL77yfIOe9ruOBjeOBn+OBhOODnuOCueOCkuOCr+ODquODg+OCr+OBl+OBpuOBj+OBoOOBleOBhOOAglwiKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0aWYgKCFib2FyZC5jYW5QdXQoc2VsZWN0ZWQueCwgc2VsZWN0ZWQueSwgcGxheWVyKSkge1xuXHRcdFx0dWkuc2V0TXNnKGDpgbjmip7jgZfjgZ/jg57jgrkgKCR7c2VsZWN0ZWQueH0sICR7c2VsZWN0ZWQueX0pIOOBq+OBr+OBguOBquOBn+OBruOCs+ODnuOBr+e9ruOBkeOBquOBhOOCiOOBhuOBp+OBmeOAguS7luOBruODnuOCueOCkumBuOaKnuOBl+OBpuOBj+OBoOOBleOBhOOAgum7kuOBhOODieODg+ODiOOBruOBpOOBhOOBn+ODnuOCueOBquOCieOBqeOBk+OBp+OCguOCs+ODnuOCkue9ruOBkeOBvuOBmeOAgmApO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRib2FyZC5wdXQoc2VsZWN0ZWQueCwgc2VsZWN0ZWQueSwgcGxheWVyKTtcblx0XHRib2FyZC5zZXRQbGF5ZXJQaWVjZShvcHBvbmVudFBpZWNlKHBsYXllcikpO1xuXHRcdHVwZGF0ZU1zZygpO1xuXHR9XG5cdHVpLm9uUGxheUNsaWNrZWQgPSAodHVybkNvdW50LCBpc09ubGluZSkgPT4ge1xuXHRcdGlmIChpc09ubGluZSkge1xuXHRcdFx0Ly8gVE9ET1xuXHRcdFx0YWxlcnQoXCJPbmxpbmUgbW9kZSBpcyBub3Qgc3VwcG9ydGVkIHlldC4uLiBQbGVhc2UgZW5qb3kgb2ZmbGluZSBtb2RlIVwiKTtcblx0XHRcdGxvY2F0aW9uLnJlbG9hZCgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRtYXhUdXJuQ291bnQgPSB0dXJuQ291bnQ7XG5cdFx0XHR1aS5jbGVhckxvZygpO1xuXHRcdFx0dWkuc2hvd0dhbWUoKTtcblx0XHRcdHVpLmdldENhbnZhcygpLm9uUmVzaXplKCk7XG5cdFx0XHRib2FyZC5yZW5kZXIoKTtcblx0XHRcdHVwZGF0ZVNob3J0TXNnKCk7XG5cdFx0XHR1cGRhdGVNc2coKTtcblx0XHR9XG5cdH07XG5cdHVpLm9uSm9pbkNsaWNrZWQgPSAoKSA9PiB7XG5cdFx0Ly8gVE9ET1xuXHRcdGFsZXJ0KFwiT25saW5lIG1vZGUgaXMgbm90IHN1cHBvcnRlZCB5ZXQuLi4gUGxlYXNlIGVuam95IG9mZmxpbmUgbW9kZSFcIik7XG5cdH07XG5cblx0dWkuc2hvd01lbnUoKTtcbn0pOyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiU0FHZ0IsRUFBRSxDQUFzQyxFQUFVO0lBQ2pFLE9BQU8sUUFBUSxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQU0sQ0FBQztDQUN4QztBQUVELFNBUWdCLEVBQUUsQ0FBd0MsT0FBVSxFQUFFLFVBQW9CLEVBQUUsRUFBRSxXQUEwQixFQUFFO0lBQ3pILE1BQU0sQ0FBQyxHQUFHLFFB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QUFDO1lBQ3BDLEdBQUcsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25DLEtBQUssRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzdDLE1BQU0sRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQzlDLENBQUM7UUFLRixNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBR3ZCLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNsQixNQUFNLEtBQUssR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDN0QsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ25CLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDNUQsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUNwQjtRQUdELEtBQUssSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNuRCxNQUFNLE1BQU0sR0FBRyxVQUFVLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUNyQyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDbkIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDNUMsTUFBTSxDQUFDLE1B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

function ge(id) {
    return document.getElementById(id);
}
function ce(tagName, classes = [], children = []) {
    const e = document.createElement(tagName);
    classes.forEach(_ => addC(e, _));
    children.forEach(_ => e.appendChild(_));
    return e;
}
function addC(elm, cls) {
    elm.classList.add(cls);
}
function onClick(elm, fn) {
    elm.addEventListener("click", fn);
}

class ResponsiveCanvas {
    constructor(parent, canvas, dpr = undefined) {
        this.parent = parent;
        this.canvas = canvas;
        if (canvas.getContext)
            this.ctx = canvas.getContext('2d');
        else
            throw "Canvasが対応していないようです";
        this.scaleX = 1;
        this.scaleY = 1;
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
        const scaleX = maxWidth;
        const scaleY = maxHeight;
        this.scaleX = this.dpr * scaleX;
        this.scaleY = this.dpr * scaleY;
        canvas.width = this.scaleX;
        canvas.height = this.scaleY;
        canvas.style.width = scaleX + "px";
        canvas.style.height = scaleY + "px";
        this.ctx.lineWidth = this.dpr;
    }
    line(x1, y1, x2, y2) {
        this.ctx.moveTo((x1 * this.scaleX), (y1 * this.scaleY));
        this.ctx.lineTo((x2 * this.scaleX), (y2 * this.scaleY));
    }
    rect(x, y, w, h) {
        this.ctx.rect((x * this.scaleX), (y * this.scaleY), (w * this.scaleX), (h * this.scaleY));
    }
    round(x, y, r) {
        this.ctx.arc((x * this.scaleX), (y * this.scaleY), (r * Math.min(this.scaleX, this.scaleY)), -0.5 * Math.PI, 2 * Math.PI);
    }
    longRound(x, y, h, r) {
        this.ctx.arc((x * this.scaleX), (y * this.scaleY), (r * Math.min(this.scaleX, this.scaleY)), -Math.PI, 0);
        this.ctx.arc((x * this.scaleX), ((y + h) * this.scaleY), (r * Math.min(this.scaleX, this.scaleY)), 0, -Math.PI);
        this.ctx.lineTo((x * this.scaleX - r * Math.min(this.scaleX, this.scaleY)), (y * this.scaleY));
    }
    beginPath() { this.ctx.beginPath(); }
    fillAll(style = undefined) {
        if (style !== undefined)
            this.ctx.fillStyle = style;
        this.ctx.fillRect(0, 0, this.scaleX, this.scaleY);
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
        this.ctx.clearRect(0, 0, this.scaleX, this.scaleY);
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
        this.log = ge("log");
        this.shortMsg = ge("g-short_message");
        this.message = ge("g-message");
        this.canvasContainer = ge("g-canvas_parent");
        this.canvasElem = ge("g-canvas");
        this.canvas = new ResponsiveCanvas(this.canvasContainer, this.canvasElem);
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
    addLog(elem) {
        this.log.appendChild(ce("li", [], elem));
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
        this.menu.onPlayClicked = (turnCount, isOnline) => this.onPlayClicked(turnCount, isOnline);
        this.menu.onJoinClicked = () => this.onJoinClicked();
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
    addLog(elem) {
        this.game.addLog(elem);
    }
    setShortMsg(msg) {
        this.game.setShortMsg(msg);
    }
    setMsg(msg) {
        this.game.setMsg(msg);
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
    reset() {
        this.chunks = new Map();
    }
}
const di8 = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, -1]];
class ReversiBoard extends Board {
    constructor(initialize = true) {
        super();
        if (initialize)
            this.reset();
    }
    reset() {
        super.reset();
        this.setCell(0, 0, 2);
        this.setCell(-1, -1, 1);
        this.setCell(-1, 0, 1);
        this.setCell(0, 0, 2);
    }
    canPut(x, y, piece) {
        if (this.getCell(x, y) !== 0)
            return false;
        const opponent = opponentPiece(piece);
        return di8.some(di => this.canReverseDi(x, y, piece, di));
    }
    put(x, y, piece) {
        if (!this.canPut(x, y, piece))
            throw "BUG";
        di8.forEach(di => {
            if (this.canReverseDi(x, y, piece, di))
                this.reverseDi(x, y, piece, di);
        });
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
        this.zoomFactor = 1;
        this.viewCenter = [0, 0];
        this.selected = undefined;
        this.onCellClicked = (x, y) => { };
    }
    bindCanvas(canvas) {
        this.canvas = canvas;
        canvas.onResize = () => {
            this.render();
        };
        let startPos = [0, 0];
        canvas.canvas.addEventListener("pointerdown", e => {
            startPos = [e.clientX, e.clientY];
        });
        canvas.canvas.addEventListener("pointermove", e => {
            const offset = [
                e.clientX - startPos[0],
                e.clientY - startPos[1]
            ];
            if (Math.hypot(...offset) < minSwipeMove)
                return;
            const newViewCenter = [
                offset[0] + this.viewCenter[0],
                offset[1] + this.viewCenter[1]
            ];
            this.render(newViewCenter);
        });
        canvas.canvas.addEventListener("pointerup", e => {
            const offset = [
                e.clientX - startPos[0],
                e.clientY - startPos[1]
            ];
            if (Math.hypot(...offset) < minSwipeMove) ;
            else {
                const newViewCenter = [
                    offset[0] + this.viewCenter[0],
                    offset[1] + this.viewCenter[1]
                ];
            }
            this.render();
        });
        this.render();
    }
    getZoom() {
        return this.zoomFactor;
    }
    setZoom(factor) {
        this.zoomFactor = factor;
        this.render();
    }
    put(x, y, piece) {
        super.put(x, y, piece);
        this.render();
    }
    render(viewCenter) {
        if (!this.canvas)
            return;
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
    console.log(ui);
    ui.showMenu();
});
let board = new DrawableReversiBoard();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvdHMvZG9tLXV0aWwudHMiLCIuLi9zcmMvdHMvcmVzcG9uc2l2ZS1jYW52YXMudHMiLCIuLi9zcmMvdHMvdWkudHMiLCIuLi9zcmMvdHMvdXRpbC50cyIsIi4uL3NyYy90cy9yZXZlcnNpLnRzIiwiLi4vc3JjL3RzL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIGdlIGdlcWEgZ2VxIGNlIGNMSSByZW1DIGFkZEMgcmVtQWxsIG9uQ2xpY2sgb25Mb2FkXG5cbi8vIGdldEVsZW1lbnRCeUlkXG5leHBvcnQgZnVuY3Rpb24gZ2U8VCBleHRlbmRzIEhUTUxFbGVtZW50ID0gSFRNTEVsZW1lbnQ+KGlkOiBzdHJpbmcpIHtcblx0cmV0dXJuIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKSBhcyBUO1xufVxuLy8gZ2V0QWxsRWxlbWVudHNCeVF1ZXJ5XG5leHBvcnQgZnVuY3Rpb24gZ2VxYShzZWxlY3RvcnM6IHN0cmluZykge1xuXHRyZXR1cm4gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9ycykpXG59XG4vLyBnZXRFbGVtZW50QnlRdWVyeVxuZXhwb3J0IGZ1bmN0aW9uIGdlcShzZWxlY3RvcnM6IHN0cmluZykge1xuXHRyZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3RvcnMpXG59XG4vLyBjcmVhdGVFbGVtZW50XG5leHBvcnQgZnVuY3Rpb24gY2U8SyBleHRlbmRzIGtleW9mIEhUTUxFbGVtZW50VGFnTmFtZU1hcD4odGFnTmFtZTogSywgY2xhc3Nlczogc3RyaW5nW10gPSBbXSwgY2hpbGRyZW46IEhUTUxFbGVtZW50W10gPSBbXSk6IEhUTUxFbGVtZW50VGFnTmFtZU1hcFtLXSB7XG5cdGNvbnN0IGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZ05hbWUpO1xuXHRjbGFzc2VzLmZvckVhY2goXyA9PiBhZGRDKGUsIF8pKTtcblx0Y2hpbGRyZW4uZm9yRWFjaChfID0+IGUuYXBwZW5kQ2hpbGQoXykpO1xuXHRyZXR1cm4gZTtcbn1cbi8vIGNyZWF0ZUxpRWxlbWVudFxuZXhwb3J0IGZ1bmN0aW9uIGNMSShpbm5lclRleHQ6IHN0cmluZywgY2xhc3Nlczogc3RyaW5nW10sIGlkPzogc3RyaW5nLCBvbkNsaWNrRm4/OiAoKSA9PiBhbnkpIHtcblx0Y29uc3QgbGkgPSBjZShcImxpXCIpO1xuXHRsaS5pbm5lclRleHQgPSBpbm5lclRleHQ7XG5cdGNsYXNzZXMuZm9yRWFjaChfID0+IGFkZEMobGksIF8pKTtcblx0aWYgKGlkKSBsaS5pZCA9IGlkO1xuXHRpZiAob25DbGlja0ZuKSBvbkNsaWNrKGxpLCBvbkNsaWNrRm4pO1xuXHRyZXR1cm4gbGk7XG59XG4vLyByZW1vdmVDbGFzc0Zyb21FbGVtZW50XG5leHBvcnQgZnVuY3Rpb24gcmVtQyhlbG06IEhUTUxFbGVtZW50LCBjbHM6IHN0cmluZykge1xuXHRlbG0uY2xhc3NMaXN0LnJlbW92ZShjbHMpO1xufVxuLy8gYWRkQ2xhc3NUb0VsZW1lbnRcbmV4cG9ydCBmdW5jdGlvbiBhZGRDKGVsbTogSFRNTEVsZW1lbnQsIGNsczogc3RyaW5nKSB7XG5cdGVsbS5jbGFzc0xpc3QuYWRkKGNscyk7XG59XG4vLyByZW1vdmVBbGxDaGlsZHJlblxuZXhwb3J0IGZ1bmN0aW9uIHJlbUFsbChlbG06IEhUTUxFbGVtZW50KSB7XG5cdHdoaWxlIChlbG0uZmlyc3RDaGlsZClcblx0XHRlbG0ucmVtb3ZlQ2hpbGQoZWxtLmZpcnN0Q2hpbGQpO1xufVxuLy8gYWRkT25DbGlja0V2ZW50TGlzdGVuZXJcbmV4cG9ydCBmdW5jdGlvbiBvbkNsaWNrKGVsbTogSFRNTEVsZW1lbnQsIGZuOiAoZXY6IEhUTUxFbGVtZW50RXZlbnRNYXBbXCJjbGlja1wiXSkgPT4gYW55KSB7XG5cdGVsbS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZm4pO1xufSIsImV4cG9ydCBjbGFzcyBSZXNwb25zaXZlQ2FudmFzIHtcblx0cGFyZW50OiBIVE1MRWxlbWVudFxuXHRjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50XG5cdGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEXG5cdHNjYWxlWDogbnVtYmVyXG5cdHNjYWxlWTogbnVtYmVyXG5cdC8vIGFzcGVjdDogbnVtYmVyXG5cdGRwcjogbnVtYmVyXG5cdGNvbnN0cnVjdG9yKFxuXHRcdHBhcmVudDogSFRNTEVsZW1lbnQsXG5cdFx0Y2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCxcblx0XHRkcHI6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZCxcblx0XHQvLyBhc3BlY3Q6IG51bWJlcixcblx0KSB7XG5cdFx0dGhpcy5wYXJlbnQgPSBwYXJlbnQ7XG5cdFx0dGhpcy5jYW52YXMgPSBjYW52YXM7XG5cdFx0aWYgKGNhbnZhcy5nZXRDb250ZXh0KSB0aGlzLmN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpITtcblx0XHRlbHNlIHRocm93IFwiQ2FudmFz44GM5a++5b+c44GX44Gm44GE44Gq44GE44KI44GG44Gn44GZXCI7XG5cdFx0dGhpcy5zY2FsZVggPSAxO1xuXHRcdHRoaXMuc2NhbGVZID0gMTtcblx0XHR0aGlzLmRwciA9IChkcHIgfHwgd2luZG93LmRldmljZVBpeGVsUmF0aW8gfHwgMSk7XG5cdFx0Ly8gdGhpcy5hc3BlY3QgPSBhc3BlY3Q7XG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xuXHRcdCgoKSA9PiB7XG5cdFx0XHR2YXIgaTogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuXHRcdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsICgpID0+IHtcblx0XHRcdFx0aWYgKGkgIT09IHVuZGVmaW5lZCkgY2xlYXJUaW1lb3V0KGkpO1xuXHRcdFx0XHRpID0gc2V0VGltZW91dCgoKSA9PiB0aGlzLm9uUmVzaXplKCksIDEwMCk7XG5cdFx0XHR9KTtcblx0XHR9KSgpO1xuXHRcdHRoaXMub25SZXNpemUoKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXHRjaGFuZ2VEUFIoZHByOiBudW1iZXIpIHtcblx0XHR0aGlzLmRwciA9IGRwciB8fCB0aGlzLmRwcjtcblx0XHR0aGlzLm9uUmVzaXplKCk7XG5cdFx0Y29uc29sZS5sb2coYFtEUFI6ICR7ZHByfS8keyh3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyB8fCAxKX1gKTtcblx0fVxuXHRvblJlc2l6ZSgpIHtcblx0XHRsZXQgY2FudmFzID0gdGhpcy5jdHguY2FudmFzO1xuXHRcdGNvbnN0IG1heFdpZHRoID0gdGhpcy5wYXJlbnQuY2xpZW50V2lkdGg7XG5cdFx0Y29uc3QgbWF4SGVpZ2h0ID0gdGhpcy5wYXJlbnQuY2xpZW50SGVpZ2h0O1xuXHRcdC8qIDogLyog44Gr44GZ44KL44GL44CBIC8vKiDjgavjgZnjgovjgYvjgaflh6bnkIbjgYzlpInjgo/jgovjgIJcblx0XHRjb25zdCBzY2FsZSA9IE1hdGgubWluKG1heFdpZHRoIC8gdGhpcy5hc3BlY3QsIG1heEhlaWdodCk7XG5cdFx0Y29uc3Qgc2NhbGVYID0gc2NhbGUgKiB0aGlzLmFzcGVjdDtcblx0XHRjb25zdCBzY2FsZVkgPSBzY2FsZTtcblx0XHQvKi9cblx0XHRjb25zdCBzY2FsZVggPSBtYXhXaWR0aDtcblx0XHRjb25zdCBzY2FsZVkgPSBtYXhIZWlnaHQ7XG5cdFx0Ly8qL1xuXHRcdHRoaXMuc2NhbGVYID0gdGhpcy5kcHIgKiBzY2FsZVg7XG5cdFx0dGhpcy5zY2FsZVkgPSB0aGlzLmRwciAqIHNjYWxlWTtcblx0XHRjYW52YXMud2lkdGggPSB0aGlzLnNjYWxlWDtcblx0XHRjYW52YXMuaGVpZ2h0ID0gdGhpcy5zY2FsZVk7XG5cdFx0Y2FudmFzLnN0eWxlLndpZHRoID0gc2NhbGVYICsgXCJweFwiO1xuXHRcdGNhbnZhcy5zdHlsZS5oZWlnaHQgPSBzY2FsZVkgKyBcInB4XCI7XG5cdFx0dGhpcy5jdHgubGluZVdpZHRoID0gdGhpcy5kcHI7XG5cdH1cblx0bGluZSh4MTogbnVtYmVyLCB5MTogbnVtYmVyLCB4MjogbnVtYmVyLCB5MjogbnVtYmVyKSB7XG5cdFx0dGhpcy5jdHgubW92ZVRvKCh4MSAqIHRoaXMuc2NhbGVYKSwgKHkxICogdGhpcy5zY2FsZVkpKTtcblx0XHR0aGlzLmN0eC5saW5lVG8oKHgyICogdGhpcy5zY2FsZVgpLCAoeTIgKiB0aGlzLnNjYWxlWSkpO1xuXHR9XG5cdHJlY3QoeDogbnVtYmVyLCB5OiBudW1iZXIsIHc6IG51bWJlciwgaDogbnVtYmVyKSB7XG5cdFx0dGhpcy5jdHgucmVjdChcblx0XHRcdCh4ICogdGhpcy5zY2FsZVgpLCAoeSAqIHRoaXMuc2NhbGVZKSxcblx0XHRcdCh3ICogdGhpcy5zY2FsZVgpLCAoaCAqIHRoaXMuc2NhbGVZKVxuXHRcdCk7XG5cdH1cblx0cm91bmQoeDogbnVtYmVyLCB5OiBudW1iZXIsIHI6IG51bWJlcikge1xuXHRcdHRoaXMuY3R4LmFyYyhcblx0XHRcdCh4ICogdGhpcy5zY2FsZVgpLFxuXHRcdFx0KHkgKiB0aGlzLnNjYWxlWSksXG5cdFx0XHQociAqIE1hdGgubWluKHRoaXMuc2NhbGVYLCB0aGlzLnNjYWxlWSkpLFxuXHRcdFx0LTAuNSAqIE1hdGguUEksXG5cdFx0XHQyICogTWF0aC5QSVxuXHRcdCk7XG5cdH1cblx0bG9uZ1JvdW5kKHg6IG51bWJlciwgeTogbnVtYmVyLCBoOiBudW1iZXIsIHI6IG51bWJlcikge1xuXHRcdHRoaXMuY3R4LmFyYyhcblx0XHRcdCh4ICogdGhpcy5zY2FsZVgpLFxuXHRcdFx0KHkgKiB0aGlzLnNjYWxlWSksXG5cdFx0XHQociAqIE1hdGgubWluKHRoaXMuc2NhbGVYLCB0aGlzLnNjYWxlWSkpLFxuXHRcdFx0LU1hdGguUEksIDBcblx0XHQpO1xuXHRcdHRoaXMuY3R4LmFyYyhcblx0XHRcdCh4ICogdGhpcy5zY2FsZVgpLFxuXHRcdFx0KCh5ICsgaCkgKiB0aGlzLnNjYWxlWSksXG5cdFx0XHQociAqIE1hdGgubWluKHRoaXMuc2NhbGVYLCB0aGlzLnNjYWxlWSkpLFxuXHRcdFx0MCwgLU1hdGguUElcblx0XHQpO1xuXHRcdHRoaXMuY3R4LmxpbmVUbyhcblx0XHRcdCh4ICogdGhpcy5zY2FsZVggLSByICogTWF0aC5taW4odGhpcy5zY2FsZVgsIHRoaXMuc2NhbGVZKSksXG5cdFx0XHQoeSAqIHRoaXMuc2NhbGVZKVxuXHRcdCk7XG5cdH1cblx0YmVnaW5QYXRoKCkgeyB0aGlzLmN0eC5iZWdpblBhdGgoKSB9XG5cdGZpbGxBbGwoc3R5bGU6IHVuZGVmaW5lZCB8IHN0cmluZyA9IHVuZGVmaW5lZCkge1xuXHRcdGlmIChzdHlsZSAhPT0gdW5kZWZpbmVkKSB0aGlzLmN0eC5maWxsU3R5bGUgPSBzdHlsZTtcblx0XHR0aGlzLmN0eC5maWxsUmVjdCgwLCAwLCB0aGlzLnNjYWxlWCwgdGhpcy5zY2FsZVkpO1xuXHR9XG5cdGZpbGwoc3R5bGU6IHVuZGVmaW5lZCB8IHN0cmluZyA9IHVuZGVmaW5lZCkge1xuXHRcdGlmIChzdHlsZSAhPT0gdW5kZWZpbmVkKSB0aGlzLmN0eC5maWxsU3R5bGUgPSBzdHlsZTtcblx0XHR0aGlzLmN0eC5maWxsKCk7XG5cdH1cblx0c3Ryb2tlKHN0eWxlOiB1bmRlZmluZWQgfCBzdHJpbmcgPSB1bmRlZmluZWQpIHtcblx0XHRpZiAoc3R5bGUgIT09IHVuZGVmaW5lZCkgdGhpcy5jdHguc3Ryb2tlU3R5bGUgPSBzdHlsZTtcblx0XHR0aGlzLmN0eC5zdHJva2UoKTtcblx0fVxuXHRjbGVhckFsbCgpIHtcblx0XHR0aGlzLmN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy5zY2FsZVgsIHRoaXMuc2NhbGVZKTtcblx0fVxufSIsImltcG9ydCB7IGdlLCBvbkNsaWNrLCBjZSB9IGZyb20gXCIuL2RvbS11dGlsXCI7XG5pbXBvcnQgeyBSZXNwb25zaXZlQ2FudmFzIH0gZnJvbSBcIi4vcmVzcG9uc2l2ZS1jYW52YXNcIjtcblxuY29uc3QgcHJlZiA9IHtcblx0ZGVmYXVsdFR1cm5Db3VudDogNjQsXG59XG5cbmNsYXNzIFVJX0luZm8ge1xuXHRwcml2YXRlIGNvbnRhaW5lciA9IGdlKFwiaW5mb1wiKTtcblx0cHJpdmF0ZSBwbGF5QnRuID0gZ2UoXCJpLXBsYXlcIik7XG5cdHByaXZhdGUgb25saW5lQnRuID0gZ2UoXCJpLXN0YXJ0X29ubGluZVwiKTtcblx0cHJpdmF0ZSBqb2luQnRuID0gZ2UoXCJpLWpvaW5fb25saW5lXCIpO1xuXG5cdG9uUGxheUNsaWNrZWQgPSAoKSA9PiB7IH07XG5cdG9uT25saW5lQ2xpY2tlZCA9ICgpID0+IHsgfTtcblx0b25Kb2luQ2xpY2tlZCA9ICgpID0+IHsgfTtcblxuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRvbkNsaWNrKHRoaXMucGxheUJ0biwgKCkgPT4gdGhpcy5vblBsYXlDbGlja2VkKCkpO1xuXHRcdG9uQ2xpY2sodGhpcy5vbmxpbmVCdG4sICgpID0+IHRoaXMub25PbmxpbmVDbGlja2VkKCkpO1xuXHRcdG9uQ2xpY2sodGhpcy5qb2luQnRuLCAoKSA9PiB0aGlzLm9uSm9pbkNsaWNrZWQoKSk7XG5cdH1cblxuXHRzaG93KCkge1xuXHRcdHRoaXMuY29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRlXCIpO1xuXHR9XG5cdGhpZGUoKSB7XG5cdFx0dGhpcy5jb250YWluZXIuY2xhc3NMaXN0LmFkZChcImhpZGVcIik7XG5cdH1cbn1cbmNsYXNzIFVJX0NvbmZpZyB7XG5cdHByaXZhdGUgY29udGFpbmVyID0gZ2UoXCJjb25maWdcIik7XG5cdHByaXZhdGUgc2l6ZUlucHV0ID0gZ2U8SFRNTElucHV0RWxlbWVudD4oXCJjLXNpemVfaW5cIik7XG5cdHByaXZhdGUgc2l6ZVZpZXcgPSBnZShcImMtc2l6ZV9vdXRcIik7XG5cdHByaXZhdGUgc3RhcnRCdG4gPSBnZShcImMtc3RhcnRcIik7XG5cdHByaXZhdGUgdHVybkNvdW50ID0gcHJlZi5kZWZhdWx0VHVybkNvdW50O1xuXG5cdG9uU3RhcnRDbGlja2VkID0gKHR1cm5Db3VudDogbnVtYmVyKSA9PiB7IH07XG5cblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0b25DbGljayh0aGlzLnN0YXJ0QnRuLCAoKSA9PiB0aGlzLm9uU3RhcnRDbGlja2VkKHRoaXMudHVybkNvdW50KSk7XG5cdFx0dGhpcy5zaXplSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsICgpID0+IHRoaXMub25VcGRhdGVTaXplSW5wdXQoKSk7XG5cdFx0dGhpcy5zaXplSW5wdXQudmFsdWUgPSB0aGlzLnR1cm5Db3VudCArIFwiXCI7XG5cdFx0dGhpcy51cGRhdGVTaXplVmlldygpO1xuXHR9XG5cblx0cHJpdmF0ZSB1cGRhdGVTaXplVmlldygpIHtcblx0XHR0aGlzLnNpemVWaWV3LnRleHRDb250ZW50ID0gYFRoZSBnYW1lIHdpbGwgZmluaXNoIGluICR7dGhpcy50dXJuQ291bnR9IHR1cm5zLmA7XG5cdH1cblx0cHJpdmF0ZSBvblVwZGF0ZVNpemVJbnB1dCgpIHtcblx0XHRsZXQgdmFsdWUgPSBwYXJzZUludCh0aGlzLnNpemVJbnB1dC52YWx1ZSk7XG5cdFx0aWYgKHZhbHVlIDw9IDAgfHwgaXNOYU4odmFsdWUpKSB2YWx1ZSA9IHByZWYuZGVmYXVsdFR1cm5Db3VudDtcblx0XHRpZiAodmFsdWUgJSAyID09IDEpIHZhbHVlKys7XG5cdFx0dGhpcy50dXJuQ291bnQgPSB2YWx1ZTtcblx0XHR0aGlzLnVwZGF0ZVNpemVWaWV3KCk7XG5cdH1cblx0c2hvdygpIHtcblx0XHR0aGlzLmNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZVwiKTtcblx0fVxuXHRoaWRlKCkge1xuXHRcdHRoaXMuY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoXCJoaWRlXCIpO1xuXHR9XG59XG5jbGFzcyBVSV9NZW51IHtcblx0cHJpdmF0ZSBjb250YWluZXIgPSBnZShcImNvbnRhaW5lclwiKTtcblx0cHJpdmF0ZSBpbmZvID0gbmV3IFVJX0luZm8oKTtcblx0cHJpdmF0ZSBjb25maWcgPSBuZXcgVUlfQ29uZmlnKCk7XG5cdHByaXZhdGUgaXNPbmxpbmU6IFwieWVzXCIgfCBcIm5vXCIgfCBcIj9cIiA9IFwiP1wiO1xuXG5cdG9uUGxheUNsaWNrZWQgPSAodHVybkNvdW50OiBudW1iZXIsIGlzT25saW5lOiBib29sZWFuKSA9PiB7IH07XG5cdG9uSm9pbkNsaWNrZWQgPSAoKSA9PiB7IH07XG5cblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0dGhpcy5pbmZvLm9uSm9pbkNsaWNrZWQgPSAoKSA9PiB0aGlzLm9uSm9pbkNsaWNrZWQoKTtcblx0XHR0aGlzLmluZm8ub25PbmxpbmVDbGlja2VkID0gKCkgPT4ge1xuXHRcdFx0dGhpcy5pc09ubGluZSA9IFwieWVzXCI7XG5cdFx0XHR0aGlzLmluZm8uaGlkZSgpO1xuXHRcdFx0dGhpcy5jb25maWcuc2hvdygpO1xuXHRcdH07XG5cdFx0dGhpcy5pbmZvLm9uUGxheUNsaWNrZWQgPSAoKSA9PiB7XG5cdFx0XHR0aGlzLmlzT25saW5lID0gXCJub1wiO1xuXHRcdFx0dGhpcy5pbmZvLmhpZGUoKTtcblx0XHRcdHRoaXMuY29uZmlnLnNob3coKTtcblx0XHR9O1xuXHRcdHRoaXMuY29uZmlnLm9uU3RhcnRDbGlja2VkID0gdHVybkNvdW50ID0+IHtcblx0XHRcdGlmICh0aGlzLmlzT25saW5lID09PSBcIj9cIilcblx0XHRcdFx0dGhyb3cgXCJCVUdcIjtcblx0XHRcdHRoaXMub25QbGF5Q2xpY2tlZCh0dXJuQ291bnQsIHRoaXMuaXNPbmxpbmUgPT09IFwieWVzXCIpO1xuXHRcdH1cblx0fVxuXG5cdHNob3coKSB7XG5cdFx0dGhpcy5jb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZShcImhpZGVcIik7XG5cblx0XHR0aGlzLmlzT25saW5lID0gXCI/XCI7XG5cdFx0dGhpcy5pbmZvLnNob3coKTtcblx0XHR0aGlzLmNvbmZpZy5oaWRlKCk7XG5cdH1cblx0aGlkZSgpIHtcblx0XHR0aGlzLmNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKFwiaGlkZVwiKTtcblx0fVxufVxuY2xhc3MgVUlfR2FtZSB7XG5cdHByaXZhdGUgY29udGFpbmVyID0gZ2UoXCJnYW1lXCIpO1xuXHRwcml2YXRlIHpvb21JbkJ0biA9IGdlPEhUTUxCdXR0b25FbGVtZW50PihcImctem9vbV9pblwiKTtcblx0cHJpdmF0ZSB6b29tT3V0QnRuID0gZ2U8SFRNTEJ1dHRvbkVsZW1lbnQ+KFwiZy16b29tX291dFwiKTtcblx0cHJpdmF0ZSBwdXRCdG4gPSBnZTxIVE1MQnV0dG9uRWxlbWVudD4oXCJnLXB1dFwiKTtcblx0cHJpdmF0ZSBsb2cgPSBnZTxIVE1MVUxpc3RFbGVtZW50PihcImxvZ1wiKTtcblx0cHJpdmF0ZSBzaG9ydE1zZyA9IGdlKFwiZy1zaG9ydF9tZXNzYWdlXCIpO1xuXHRwcml2YXRlIG1lc3NhZ2UgPSBnZShcImctbWVzc2FnZVwiKTtcblx0cHJpdmF0ZSBjYW52YXNDb250YWluZXIgPSBnZTxIVE1MQ2FudmFzRWxlbWVudD4oXCJnLWNhbnZhc19wYXJlbnRcIik7XG5cdHByaXZhdGUgY2FudmFzRWxlbSA9IGdlPEhUTUxDYW52YXNFbGVtZW50PihcImctY2FudmFzXCIpO1xuXHRjYW52YXMgPSBuZXcgUmVzcG9uc2l2ZUNhbnZhcyh0aGlzLmNhbnZhc0NvbnRhaW5lciwgdGhpcy5jYW52YXNFbGVtKTtcblxuXHRvblpvb21JbkNsaWNrZWQgPSAoKSA9PiB7IH07XG5cdG9uWm9vbU91dENsaWNrZWQgPSAoKSA9PiB7IH07XG5cdG9uUHV0Q2xpY2tlZCA9ICgpID0+IHsgfTtcblxuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRvbkNsaWNrKHRoaXMuem9vbUluQnRuLCAoKSA9PiB0aGlzLm9uWm9vbUluQ2xpY2tlZCgpKTtcblx0XHRvbkNsaWNrKHRoaXMuem9vbU91dEJ0biwgKCkgPT4gdGhpcy5vblpvb21PdXRDbGlja2VkKCkpO1xuXHRcdG9uQ2xpY2sodGhpcy5wdXRCdG4sICgpID0+IHRoaXMub25QdXRDbGlja2VkKCkpO1xuXHR9XG5cdHNob3coKSB7XG5cdFx0dGhpcy5jb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZShcImhpZGVcIik7XG5cdH1cblx0aGlkZSgpIHtcblx0XHR0aGlzLmNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKFwiaGlkZVwiKTtcblx0fVxuXHRjbGVhckxvZygpIHtcblx0XHR0aGlzLmxvZy5pbm5lckhUTUwgPSBcIlwiO1xuXHR9XG5cdGFkZExvZyhlbGVtOiBIVE1MRWxlbWVudFtdKSB7XG5cdFx0dGhpcy5sb2cuYXBwZW5kQ2hpbGQoY2UoXCJsaVwiLCBbXSwgZWxlbSkpO1xuXHR9XG5cdHNldFNob3J0TXNnKG1zZzogc3RyaW5nKSB7XG5cdFx0dGhpcy5zaG9ydE1zZy50ZXh0Q29udGVudCA9IG1zZztcblx0fVxuXHRzZXRNc2cobXNnOiBzdHJpbmcpIHtcblx0XHR0aGlzLm1lc3NhZ2UudGV4dENvbnRlbnQgPSBtc2c7XG5cdH1cbn1cbmV4cG9ydCBjbGFzcyBVSSB7XG5cdHByaXZhdGUgbWVudSA9IG5ldyBVSV9NZW51KCk7XG5cdHByaXZhdGUgZ2FtZSA9IG5ldyBVSV9HYW1lKCk7XG5cblx0b25QbGF5Q2xpY2tlZCA9ICh0dXJuQ291bnQ6IG51bWJlciwgaXNPbmxpbmU6IGJvb2xlYW4pID0+IHsgfTtcblx0b25Kb2luQ2xpY2tlZCA9ICgpID0+IHsgfTtcblxuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHR0aGlzLm1lbnUub25QbGF5Q2xpY2tlZCA9ICh0dXJuQ291bnQsIGlzT25saW5lKSA9PiB0aGlzLm9uUGxheUNsaWNrZWQodHVybkNvdW50LCBpc09ubGluZSk7XG5cdFx0dGhpcy5tZW51Lm9uSm9pbkNsaWNrZWQgPSAoKSA9PiB0aGlzLm9uSm9pbkNsaWNrZWQoKTtcblx0fVxuXG5cdHNob3dNZW51KCkge1xuXHRcdHRoaXMubWVudS5zaG93KCk7XG5cdFx0dGhpcy5nYW1lLmhpZGUoKTtcblx0fVxuXHRzaG93R2FtZSgpIHtcblx0XHR0aGlzLm1lbnUuaGlkZSgpO1xuXHRcdHRoaXMuZ2FtZS5zaG93KCk7XG5cdH1cblx0Y2xlYXJMb2coKSB7XG5cdFx0dGhpcy5nYW1lLmNsZWFyTG9nKCk7XG5cdH1cblx0YWRkTG9nKGVsZW06IEhUTUxFbGVtZW50W10pIHtcblx0XHR0aGlzLmdhbWUuYWRkTG9nKGVsZW0pO1xuXHR9XG5cdHNldFNob3J0TXNnKG1zZzogc3RyaW5nKSB7XG5cdFx0dGhpcy5nYW1lLnNldFNob3J0TXNnKG1zZyk7XG5cdH1cblx0c2V0TXNnKG1zZzogc3RyaW5nKSB7XG5cdFx0dGhpcy5nYW1lLnNldE1zZyhtc2cpO1xuXHR9XG59IiwiZXhwb3J0IGZ1bmN0aW9uIGlzQ2hyb21lKCkge1xuXHRyZXR1cm4gbmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpLmluZGV4T2YoJ2Nocm9tZScpID4gLTE7XG59XG5cbi8vIG9uV2luZG93TG9hZGVkXG5leHBvcnQgZnVuY3Rpb24gb25Mb2FkKGZuOiAoKSA9PiBhbnkpIHtcblx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGZuKTtcbn1cbi8vIG9uQW5pbWF0aW9uRnJhbWVcbmV4cG9ydCBmdW5jdGlvbiBvbkFuaW0oZm46ICgpID0+IHsgY29udGludWU6IGJvb2xlYW4gfSkge1xuXHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24gdG1wKCkge1xuXHRcdGlmIChmbigpLmNvbnRpbnVlKSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodG1wKTtcblx0fSk7XG59IiwiaW1wb3J0IHsgUmVzcG9uc2l2ZUNhbnZhcyB9IGZyb20gXCIuL3Jlc3BvbnNpdmUtY2FudmFzXCI7XG5cbmNvbnN0IGNodW5rU2l6ZSA9IDE2O1xuY29uc3QgbWluU3dpcGVNb3ZlID0gNTtcblxuZXhwb3J0IGNvbnN0IGVudW0gQ2VsbCB7XG5cdG5vdGhpbmcsXG5cdGJsYWNrLFxuXHR3aGl0ZVxufVxuZXhwb3J0IHR5cGUgUGllY2UgPSBDZWxsLmJsYWNrIHwgQ2VsbC53aGl0ZTtcblxuY2xhc3MgQ2VsbENodW5rIHtcblx0Y2VsbHM6IENlbGxbXVtdXG5cdHhQb3M6IG51bWJlciAvLyAuLi4sIC1jaHVua1NpemUsIDAsIGNodW5rU2l6ZSwgY2h1bmtTaXplKjIsIC4uLlxuXHR5UG9zOiBudW1iZXIgLy8gLi4uLCAtY2h1bmtTaXplLCAwLCBjaHVua1NpemUsIGNodW5rU2l6ZSoyLCAuLi5cblxuXHRjb25zdHJ1Y3Rvcihcblx0XHR4UG9zOiBudW1iZXIsXG5cdFx0eVBvczogbnVtYmVyLFxuXHQpIHtcblx0XHR0aGlzLnhQb3MgPSB4UG9zO1xuXHRcdHRoaXMueVBvcyA9IHlQb3M7XG5cdFx0dGhpcy5jZWxscyA9IG5ldyBBcnJheShjaHVua1NpemUpLmZpbGwoMCkubWFwKFxuXHRcdFx0KCkgPT4gbmV3IEFycmF5KGNodW5rU2l6ZSkuZmlsbCgwKS5tYXAoXG5cdFx0XHRcdCgpID0+IENlbGwubm90aGluZ1xuXHRcdFx0KVxuXHRcdCk7XG5cdH1cbn1cblxuY2xhc3MgQm9hcmQge1xuXHRwcml2YXRlIGNodW5rczogTWFwPG51bWJlciwgTWFwPG51bWJlciwgQ2VsbENodW5rPj4gLy8ga2V5OiAuLi4sIC1jaHVua1NpemUsIDAsIGNodW5rU2l6ZSwgY2h1bmtTaXplKjIsIC4uLlxuXG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHRoaXMuY2h1bmtzID0gbmV3IE1hcCgpO1xuXHR9XG5cdGdldENlbGwoeDogbnVtYmVyLCB5OiBudW1iZXIpOiBDZWxsIHtcblx0XHRjb25zdCBwb3NYID0gcXVhbnRpemUoeCwgY2h1bmtTaXplKTtcblx0XHRjb25zdCBwb3NZID0gcXVhbnRpemUoeSwgY2h1bmtTaXplKTtcblxuXHRcdGxldCB0bXAgPSB0aGlzLmNodW5rcy5nZXQocG9zWC5xdWFudGl6ZWQpO1xuXHRcdGlmICghdG1wKVxuXHRcdFx0cmV0dXJuIENlbGwubm90aGluZztcblxuXHRcdGxldCBjaHVuayA9IHRtcC5nZXQocG9zWS5xdWFudGl6ZWQpO1xuXHRcdGlmICghY2h1bmspXG5cdFx0XHRyZXR1cm4gQ2VsbC5ub3RoaW5nO1xuXG5cdFx0cmV0dXJuIGNodW5rLmNlbGxzW3Bvc1gubW9kXVtwb3NZLm1vZF07XG5cdH1cblx0c2V0Q2VsbCh4OiBudW1iZXIsIHk6IG51bWJlciwgY2VsbDogQ2VsbCk6IHZvaWQge1xuXHRcdGNvbnN0IHBvc1ggPSBxdWFudGl6ZSh4LCBjaHVua1NpemUpO1xuXHRcdGNvbnN0IHBvc1kgPSBxdWFudGl6ZSh5LCBjaHVua1NpemUpO1xuXG5cdFx0bGV0IHRtcCA9IHRoaXMuY2h1bmtzLmdldChwb3NYLnF1YW50aXplZCk7XG5cdFx0aWYgKCF0bXApXG5cdFx0XHR0aGlzLmNodW5rcy5zZXQoXG5cdFx0XHRcdHBvc1gucXVhbnRpemVkLFxuXHRcdFx0XHR0bXAgPSBuZXcgTWFwKClcblx0XHRcdCk7XG5cblx0XHRsZXQgY2h1bmsgPSB0bXAuZ2V0KHBvc1kucXVhbnRpemVkKTtcblx0XHRpZiAoIWNodW5rKVxuXHRcdFx0dG1wLnNldChcblx0XHRcdFx0cG9zWS5xdWFudGl6ZWQsXG5cdFx0XHRcdGNodW5rID0gbmV3IENlbGxDaHVuayhwb3NYLnF1YW50aXplZCwgcG9zWS5xdWFudGl6ZWQpXG5cdFx0XHQpO1xuXG5cdFx0Y2h1bmsuY2VsbHNbcG9zWC5tb2RdW3Bvc1kubW9kXSA9IGNlbGw7XG5cdH1cblx0cmVzZXQoKTogdm9pZCB7XG5cdFx0dGhpcy5jaHVua3MgPSBuZXcgTWFwKCk7XG5cdH1cbn1cblxudHlwZSBEaTJEID0gW251bWJlciwgbnVtYmVyXTsgLy8gRGlyZWN0aW9uIDJEXG5jb25zdCBkaTg6IERpMkRbXVxuXHQ9IFtbLTEsIC0xXSwgWy0xLCAwXSwgWy0xLCAxXSwgWzAsIC0xXSwgWzAsIDFdLCBbMSwgLTFdLCBbMSwgMF0sIFsxLCAtMV1dO1xuXG5leHBvcnQgY2xhc3MgUmV2ZXJzaUJvYXJkIGV4dGVuZHMgQm9hcmQge1xuXHRjb25zdHJ1Y3Rvcihpbml0aWFsaXplID0gdHJ1ZSkge1xuXHRcdHN1cGVyKCk7XG5cdFx0aWYgKGluaXRpYWxpemUpXG5cdFx0XHR0aGlzLnJlc2V0KCk7XG5cdH1cblx0cmVzZXQoKTogdm9pZCB7XG5cdFx0c3VwZXIucmVzZXQoKTtcblxuXHRcdC8vIOKXiyDil48gOiBXaGl0ZSBCbGFja1xuXHRcdC8vIOKXjyDil4sgOiBCbGFjayBXaGl0ZVxuXHRcdHRoaXMuc2V0Q2VsbCgwLCAwLCBDZWxsLndoaXRlKTtcblx0XHR0aGlzLnNldENlbGwoLTEsIC0xLCBDZWxsLmJsYWNrKTtcblx0XHR0aGlzLnNldENlbGwoLTEsIDAsIENlbGwuYmxhY2spO1xuXHRcdHRoaXMuc2V0Q2VsbCgwLCAwLCBDZWxsLndoaXRlKTtcblx0fVxuXHRjYW5QdXQoeDogbnVtYmVyLCB5OiBudW1iZXIsIHBpZWNlOiBQaWVjZSk6IGJvb2xlYW4ge1xuXHRcdGlmICh0aGlzLmdldENlbGwoeCwgeSkgIT09IENlbGwubm90aGluZylcblx0XHRcdHJldHVybiBmYWxzZTtcblxuXHRcdGNvbnN0IG9wcG9uZW50ID0gb3Bwb25lbnRQaWVjZShwaWVjZSk7XG5cdFx0cmV0dXJuIGRpOC5zb21lKGRpID0+IHRoaXMuY2FuUmV2ZXJzZURpKHgsIHksIHBpZWNlLCBkaSkpO1xuXHR9XG5cdHB1dCh4OiBudW1iZXIsIHk6IG51bWJlciwgcGllY2U6IFBpZWNlKTogdm9pZCB7XG5cdFx0aWYgKCF0aGlzLmNhblB1dCh4LCB5LCBwaWVjZSkpIHRocm93IFwiQlVHXCI7XG5cdFx0ZGk4LmZvckVhY2goZGkgPT4ge1xuXHRcdFx0aWYgKHRoaXMuY2FuUmV2ZXJzZURpKHgsIHksIHBpZWNlLCBkaSkpXG5cdFx0XHRcdHRoaXMucmV2ZXJzZURpKHgsIHksIHBpZWNlLCBkaSk7XG5cdFx0fSk7XG5cdH1cblx0Ly8gW3grZGlbMF0sIHkrZGlbMV1dIOS7pemZjeOBrumDqOWIhuOBruOBv+OCkuimi+OBpuWIpOaWreOBl+OBvuOBmeOAglxuXHRwcml2YXRlIGNhblJldmVyc2VEaSh4OiBudW1iZXIsIHk6IG51bWJlciwgcGllY2U6IFBpZWNlLCBkaTogRGkyRCk6IGJvb2xlYW4ge1xuXHRcdGNvbnN0IG9wcG9uZW50ID0gb3Bwb25lbnRQaWVjZShwaWVjZSk7XG5cblx0XHRsZXQgY1ggPSB4LCBjWSA9IHk7XG5cdFx0bGV0IGNudCA9IDA7XG5cdFx0d2hpbGUgKHRydWUpIHtcblx0XHRcdGNYICs9IGRpWzBdOyBjWSArPSBkaVsxXTtcblx0XHRcdGNvbnN0IGNDZWxsID0gdGhpcy5nZXRDZWxsKGNYLCBjWSk7XG5cdFx0XHRpZiAoY0NlbGwgPT09IG9wcG9uZW50KVxuXHRcdFx0XHRjbnQrKztcblx0XHRcdGVsc2UgaWYgKGNDZWxsID09PSBwaWVjZSlcblx0XHRcdFx0cmV0dXJuIGNudCA+IDA7XG5cdFx0XHRlbHNlXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdH1cblx0cHJpdmF0ZSByZXZlcnNlRGkoeDogbnVtYmVyLCB5OiBudW1iZXIsIHBpZWNlOiBQaWVjZSwgZGk6IERpMkQpOiB2b2lkIHtcblx0XHRjb25zdCBvcHBvbmVudCA9IG9wcG9uZW50UGllY2UocGllY2UpO1xuXG5cdFx0bGV0IGNYID0geCwgY1kgPSB5O1xuXHRcdGxldCBjbnQgPSAwO1xuXHRcdHdoaWxlICh0cnVlKSB7XG5cdFx0XHRjWCArPSBkaVswXTsgY1kgKz0gZGlbMV07XG5cdFx0XHRjb25zdCBjQ2VsbCA9IHRoaXMuZ2V0Q2VsbChjWCwgY1kpO1xuXHRcdFx0aWYgKGNDZWxsID09PSBvcHBvbmVudClcblx0XHRcdFx0dGhpcy5zZXRDZWxsKGNYLCBjWSwgcGllY2UpO1xuXHRcdFx0ZWxzZSBpZiAoY0NlbGwgPT09IHBpZWNlKVxuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHRlbHNlXG5cdFx0XHRcdHRocm93IFwiQlVHXCI7XG5cdFx0fVxuXHR9XG59XG5cbi8vIFRPRE86IHNldENlbGwg44Gn44Gv44CB6Ieq5YuV55qE44GqIHJlbmRlciDjgYzooYzjgo/jgozjgarjgYTku7ZcbmV4cG9ydCBjbGFzcyBEcmF3YWJsZVJldmVyc2lCb2FyZCBleHRlbmRzIFJldmVyc2lCb2FyZCB7XG5cdHByaXZhdGUgY2FudmFzOiBSZXNwb25zaXZlQ2FudmFzIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuXHRwcml2YXRlIHpvb21GYWN0b3IgPSAxO1xuXHRwcml2YXRlIHZpZXdDZW50ZXIgPSBbMCwgMF07XG5cdHByaXZhdGUgc2VsZWN0ZWQ6IHVuZGVmaW5lZCB8IFtudW1iZXIsIG51bWJlcl0gPSB1bmRlZmluZWQ7XG5cblx0b25DZWxsQ2xpY2tlZCA9ICh4OiBudW1iZXIsIHk6IG51bWJlcikgPT4geyB9O1xuXG5cdGJpbmRDYW52YXMoY2FudmFzOiBSZXNwb25zaXZlQ2FudmFzKSB7XG5cdFx0dGhpcy5jYW52YXMgPSBjYW52YXM7XG5cdFx0Y2FudmFzLm9uUmVzaXplID0gKCkgPT4ge1xuXHRcdFx0dGhpcy5yZW5kZXIoKTtcblx0XHR9O1xuXHRcdGxldCBzdGFydFBvcyA9IFswLCAwXTtcblx0XHRjYW52YXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJwb2ludGVyZG93blwiLCBlID0+IHtcblx0XHRcdHN0YXJ0UG9zID0gW2UuY2xpZW50WCwgZS5jbGllbnRZXTtcblx0XHR9KTtcblx0XHRjYW52YXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJwb2ludGVybW92ZVwiLCBlID0+IHtcblx0XHRcdGNvbnN0IG9mZnNldDogW251bWJlciwgbnVtYmVyXSA9IFtcblx0XHRcdFx0ZS5jbGllbnRYIC0gc3RhcnRQb3NbMF0sXG5cdFx0XHRcdGUuY2xpZW50WSAtIHN0YXJ0UG9zWzFdXTtcblx0XHRcdGlmIChNYXRoLmh5cG90KC4uLm9mZnNldCkgPCBtaW5Td2lwZU1vdmUpIHJldHVybjtcblx0XHRcdGNvbnN0IG5ld1ZpZXdDZW50ZXI6IFtudW1iZXIsIG51bWJlcl0gPSBbXG5cdFx0XHRcdG9mZnNldFswXSArIHRoaXMudmlld0NlbnRlclswXSxcblx0XHRcdFx0b2Zmc2V0WzFdICsgdGhpcy52aWV3Q2VudGVyWzFdXTtcblx0XHRcdHRoaXMucmVuZGVyKG5ld1ZpZXdDZW50ZXIpO1xuXHRcdH0pO1xuXHRcdGNhbnZhcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcInBvaW50ZXJ1cFwiLCBlID0+IHtcblx0XHRcdGNvbnN0IG9mZnNldDogW251bWJlciwgbnVtYmVyXSA9IFtcblx0XHRcdFx0ZS5jbGllbnRYIC0gc3RhcnRQb3NbMF0sXG5cdFx0XHRcdGUuY2xpZW50WSAtIHN0YXJ0UG9zWzFdXTtcblx0XHRcdGlmIChNYXRoLmh5cG90KC4uLm9mZnNldCkgPCBtaW5Td2lwZU1vdmUpIHtcblx0XHRcdFx0Ly8gVE9ET1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc3QgbmV3Vmlld0NlbnRlcjogW251bWJlciwgbnVtYmVyXSA9IFtcblx0XHRcdFx0XHRvZmZzZXRbMF0gKyB0aGlzLnZpZXdDZW50ZXJbMF0sXG5cdFx0XHRcdFx0b2Zmc2V0WzFdICsgdGhpcy52aWV3Q2VudGVyWzFdXTtcblx0XHRcdH1cblx0XHRcdHRoaXMucmVuZGVyKCk7XG5cdFx0fSk7XG5cdFx0dGhpcy5yZW5kZXIoKTtcblx0fVxuXHRnZXRab29tKCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMuem9vbUZhY3Rvcjtcblx0fVxuXHRzZXRab29tKGZhY3RvcjogbnVtYmVyKTogdm9pZCB7XG5cdFx0dGhpcy56b29tRmFjdG9yID0gZmFjdG9yO1xuXHRcdHRoaXMucmVuZGVyKCk7XG5cdH1cblx0cHV0KHg6IG51bWJlciwgeTogbnVtYmVyLCBwaWVjZTogUGllY2UpOiB2b2lkIHtcblx0XHRzdXBlci5wdXQoeCwgeSwgcGllY2UpO1xuXHRcdHRoaXMucmVuZGVyKCk7XG5cdH1cblx0cmVuZGVyKHZpZXdDZW50ZXI/OiBbbnVtYmVyLCBudW1iZXJdKSB7XG5cdFx0aWYgKCF0aGlzLmNhbnZhcykgcmV0dXJuO1xuXHRcdC8vIFRPRE9cblx0fVxufVxuXG5mdW5jdGlvbiBxdWFudGl6ZShudW06IG51bWJlciwgZGl2aXNvcjogbnVtYmVyKSB7XG5cdGNvbnN0IHF1YW50aXplZCA9IE1hdGguZmxvb3IobnVtIC8gZGl2aXNvcikgKiBkaXZpc29yO1xuXHRjb25zdCBtb2QgPSBudW0gLSBxdWFudGl6ZWQ7XG5cdHJldHVybiB7IHF1YW50aXplZCwgbW9kIH07XG59XG5leHBvcnQgZnVuY3Rpb24gb3Bwb25lbnRQaWVjZShwaWVjZTogUGllY2UpOiBQaWVjZSB7XG5cdGlmIChwaWVjZSA9PT0gQ2VsbC5ibGFjaykgcmV0dXJuIENlbGwud2hpdGU7XG5cdGlmIChwaWVjZSA9PT0gQ2VsbC53aGl0ZSkgcmV0dXJuIENlbGwuYmxhY2s7XG5cdHRocm93IFwiQlVHXCI7XG59XG4iLCJpbXBvcnQgeyBVSSB9IGZyb20gXCIuL3VpXCI7XG5pbXBvcnQgeyBvbkxvYWQsIGlzQ2hyb21lIH0gZnJvbSBcIi4vdXRpbFwiO1xuaW1wb3J0IHsgRHJhd2FibGVSZXZlcnNpQm9hcmQgfSBmcm9tIFwiLi9yZXZlcnNpXCI7XG5cbmZ1bmN0aW9uIHNob3dDb25zb2xlQmFubmVyKCkge1xuXHRpZiAoaXNDaHJvbWUoKSkge1xuXHRcdGNvbnNvbGUubG9nKFxuXHRcdFx0XCJcXG5cIiArXG5cdFx0XHRcIiVjICVjIEluZmluaXRlIFJldmVyc2kgXFxuXCIgK1xuXHRcdFx0XCIlYyAlYyBNYWRlIGJ5IG9tYXNha3VuIG9uIDIwMTlcXG5cIiArXG5cdFx0XHRcIiVjICVjIEdpdEh1YjogaHR0cHM6Ly9naXRodWIuY29tL29tYXNha3VuL2luZl9yZXZlcnNpXFxuXCIgK1xuXHRcdFx0XCIlYyAlYyBFbmpveSFcXG5cIixcblx0XHRcdFwiY29sb3I6ICMxMzBmNDA7IGJhY2tncm91bmQtY29sb3I6ICNhNzk5ZWY7IGxpbmUtaGVpZ2h0OiAyO1wiLFxuXHRcdFx0XCJjb2xvcjogI2RkZDZmZjsgYmFja2dyb3VuZC1jb2xvcjogIzUyNDk4MzsgbGluZS1oZWlnaHQ6IDI7XCIsXG5cdFx0XHRcImNvbG9yOiAjMTMwZjQwOyBiYWNrZ3JvdW5kLWNvbG9yOiAjYTc5OWVmOyBsaW5lLWhlaWdodDogMS41O1wiLFxuXHRcdFx0XCJcIixcblx0XHRcdFwiY29sb3I6ICMxMzBmNDA7IGJhY2tncm91bmQtY29sb3I6ICNhNzk5ZWY7IGxpbmUtaGVpZ2h0OiAxLjU7XCIsXG5cdFx0XHRcIlwiLFxuXHRcdFx0XCJjb2xvcjogIzEzMGY0MDsgYmFja2dyb3VuZC1jb2xvcjogI2E3OTllZjsgbGluZS1oZWlnaHQ6IDEuNTtcIixcblx0XHRcdFwiZm9udC13ZWlnaHQ6IGJvbGRcIlxuXHRcdCk7XG5cdH0gZWxzZSB7XG5cdFx0Y29uc29sZS5sb2coXG5cdFx0XHRcIlxcblwiICtcblx0XHRcdFwi4pSDICMjIyBJbmZpbml0ZSBSZXZlcnNpICMjIyBcXG5cIiArXG5cdFx0XHRcIuKUgyBcXG5cIiArXG5cdFx0XHRcIuKUgyBNYWRlIGJ5IG9tYXNha3VuIG9uIDIwMTlcXG5cIiArXG5cdFx0XHRcIuKUgyBHaXRIdWI6IGh0dHBzOi8vZ2l0aHViLmNvbS9vbWFzYWt1blxcblwiICtcblx0XHRcdFwi4pSDIEVuam95IVxcblwiXG5cdFx0KTtcblx0fVxufVxuXG5cbi8vI2VuZHJlZ2lvblxuXG5zaG93Q29uc29sZUJhbm5lcigpO1xub25Mb2FkKCgpID0+IHtcblx0Y29uc3QgdWkgPSBuZXcgVUkoKTtcblx0Y29uc29sZS5sb2codWkpO1xuXHR1aS5zaG93TWVudSgpO1xufSk7XG5sZXQgYm9hcmQgPSBuZXcgRHJhd2FibGVSZXZlcnNpQm9hcmQoKTsiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IlNBR2dCLEVBQUUsQ0FBc0MsRUFBVTtJQUNqRSxPQUFPLFFBQVEsQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFNLENBQUM7Q0FDeEM7QUFFRCxTQVFnQixFQUFFLENBQXdDLE9BQVUsRUFBRSxVQUFvQixFQUFFLEVBQUUsV0FBMEIsRUFBRTtJQUN6SCxNQUFNLENBQUMsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNqQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDeEMsT0FBTyxDQUFDLENBQUM7Q0FDVDtBQUVELFNBYWdCLElBQUksQ0FBQyxHQUFnQixFQUFFLEdBQVc7SUFDakQsR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7Q0FDdkI7QUFFRCxTQUtnQixPQUFPLENBQUMsR0FBZ0IsRUFBRSxFQUE2QztJQUN0RixHQUFHLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0NBQ2xDOztNQzlDWSxnQkFBZ0I7SUFRNUIsWUFDQyxNQUFtQixFQUNuQixNQUF5QixFQUN6QixNQUEwQixTQUFTO1FBR25DLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksTUFBTSxDQUFDLFVBQVU7WUFBRSxJQUFJLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFFLENBQUM7O1lBQ3RELE1BQU0sb0JBQW9CLENBQUM7UUFDaEMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFDaEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFDaEIsSUFBSSxDQUFDLEdBQUcsSUFBSSxHQUFHLElBQUksTUFBTSxDQUFDLGdCQUFnQixJQUFJLENBQUMsQ0FBQyxDQUFDO1FBR2pELENBQUM7WUFDQSxJQUFJLENBQUMsR0FBdUIsU0FBUyxDQUFDO1lBQ3RDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUU7Z0JBQ2pDLElBQUksQ0FBQyxLQUFLLFNBQVM7b0JBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNyQyxDQUFDLEdBQUcsVUFBVSxDQUFDLE1BQU0sSUFBSSxDQUFDLFFBQVEsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDO2FBQzNDLENBQUMsQ0FBQztTQUNILEdBQUcsQ0FBQztRQUNMLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNoQixPQUFPLElBQUksQ0FBQztLQUNaO0lBQ0QsU0FBUyxDQUFDLEdBQVc7UUFDcEIsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQztRQUMzQixJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDaEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsS0FBSyxNQUFNLENBQUMsZ0JBQWdCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUM5RDtJQUNELFFBQVE7UUFDUCxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQztRQUM3QixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQztRQUN6QyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQztRQU0zQyxNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUM7UUFDeEIsTUFBTSxNQUFNLEdBQUcsU0FBUyxDQUFDO1FBRXpCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUM7UUFDaEMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQztRQUNoQyxNQUFNLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDM0IsTUFBTSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQzVCLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLE1BQU0sR0FBRyxJQUFJLENBQUM7UUFDbkMsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsTUFBTSxHQUFHLElBQUksQ0FBQztRQUNwQyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDO0tBQzlCO0lBQ0QsSUFBSSxDQUFDLEVBQVUsRUFBRSxFQUFVLEVBQUUsRUFBVSxFQUFFLEVBQVU7UUFDbEQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxHQUFHLElBQUksQ0FBQyxNQUFNLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUN4RCxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxFQUFFLEdBQUcsSUFBSSxDQUFDLE1BQU0sSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0tBQ3hEO0lBQ0QsSUFBSSxDQUFDLENBQVMsRUFBRSxDQUFTLEVBQUUsQ0FBUyxFQUFFLENBQVM7UUFDOUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQ1gsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLElBQ2xDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUNuQyxDQUFDO0tBQ0Y7SUFDRCxLQUFLLENBQUMsQ0FBUyxFQUFFLENBQVMsRUFBRSxDQUFTO1FBQ3BDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUNWLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxJQUNmLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxJQUNmLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUN2QyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsRUFBRSxFQUNkLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUNYLENBQUM7S0FDRjtJQUNELFNBQVMsQ0FBQyxDQUFTLEVBQUUsQ0FBUyxFQUFFLENBQVMsRUFBRSxDQUFTO1FBQ25ELElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUNWLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxJQUNmLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxJQUNmLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUN2QyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUNYLENBQUM7UUFDRixJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFDVixDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sSUFDZixDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sSUFDckIsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQ3ZDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQ1gsQ0FBQztRQUNGLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUNiLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUN4RCxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFDaEIsQ0FBQztLQUNGO0lBQ0QsU0FBUyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLENBQUEsRUFBRTtJQUNwQyxPQUFPLENBQUMsUUFBNEIsU0FBUztRQUM1QyxJQUFJLEtBQUssS0FBSyxTQUFTO1lBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO1FBQ3BELElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDbEQ7SUFDRCxJQUFJLENBQUMsUUFBNEIsU0FBUztRQUN6QyxJQUFJLEtBQUssS0FBSyxTQUFTO1lBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO1FBQ3BELElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7S0FDaEI7SUFDRCxNQUFNLENBQUMsUUFBNEIsU0FBUztRQUMzQyxJQUFJLEtBQUssS0FBSyxTQUFTO1lBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO1FBQ3RELElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUM7S0FDbEI7SUFDRCxRQUFRO1FBQ1AsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUNuRDtDQUNEOztBQzVHRCxNQUFNLElBQUksR0FBRztJQUNaLGdCQUFnQixFQUFFLEVBQUU7Q0FDcEIsQ0FBQTtBQUVELE1BQU0sT0FBTztJQVVaO1FBVFEsY0FBUyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN2QixZQUFPLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3ZCLGNBQVMsR0FBRyxFQUFFLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUNqQyxZQUFPLEdBQUcsRUFBRSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBRXRDLGtCQUFhLEdBQUcsU0FBUyxDQUFDO1FBQzFCLG9CQUFlLEdBQUcsU0FBUyxDQUFDO1FBQzVCLGtCQUFhLEdBQUcsU0FBUyxDQUFDO1FBR3pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE1BQU0sSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUM7UUFDbEQsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsTUFBTSxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQztRQUN0RCxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxNQUFNLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDO0tBQ2xEO0lBRUQsSUFBSTtRQUNILElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUN4QztJQUNELElBQUk7UUFDSCxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDckM7Q0FDRDtBQUNELE1BQU0sU0FBUztJQVNkO1FBUlEsY0FBUyxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN6QixjQUFTLEdBQUcsRUFBRSxDQUFtQixXQUFXLENBQUMsQ0FBQztRQUM5QyxhQUFRLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzVCLGFBQVEsR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDekIsY0FBUyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztRQUUxQyxtQkFBYyxHQUFHLENBQUMsU0FBaUIsUUFBUSxDQUFDO1FBRzNDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztRQUNsRSxJQUFJLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxNQUFNLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUM7UUFDekUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7UUFDM0MsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO0tBQ3RCO0lBRU8sY0FBYztRQUNyQixJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsR0FBRywyQkFBMkIsSUFBSSxDQUFDLFNBQVMsU0FBUyxDQUFDO0tBQy9FO0lBQ08saUJBQWlCO1FBQ3hCLElBQUksS0FBSyxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzNDLElBQUksS0FBSyxJQUFJLENBQUMsSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDO1lBQUUsS0FBSyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztRQUM5RCxJQUFJLEtBQUssR0FBRyxDQUFDLElBQUksQ0FBQztZQUFFLEtBQUssRUFBRSxDQUFDO1FBQzVCLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztLQUN0QjtJQUNELElBQUk7UUFDSCxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDeEM7SUFDRCxJQUFJO1FBQ0gsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQ3JDO0NBQ0Q7QUFDRCxNQUFNLE9BQU87SUFTWjtRQVJRLGNBQVMsR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDNUIsU0FBSSxHQUFHLElBQUksT0FBTyxFQUFFLENBQUM7UUFDckIsV0FBTSxHQUFHLElBQUksU0FBUyxFQUFFLENBQUM7UUFDekIsYUFBUSxHQUF1QixHQUFHLENBQUM7UUFFM0Msa0JBQWEsR0FBRyxDQUFDLFNBQWlCLEVBQUUsUUFBaUIsUUFBUSxDQUFDO1FBQzlELGtCQUFhLEdBQUcsU0FBUyxDQUFDO1FBR3pCLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxHQUFHLE1BQU0sSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ3JELElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxHQUFHO1lBQzNCLElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO1lBQ3RCLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDakIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztTQUNuQixDQUFDO1FBQ0YsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEdBQUc7WUFDekIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7WUFDckIsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNqQixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO1NBQ25CLENBQUM7UUFDRixJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsR0FBRyxTQUFTO1lBQ3JDLElBQUksSUFBSSxDQUFDLFFBQVEsS0FBSyxHQUFHO2dCQUN4QixNQUFNLEtBQUssQ0FBQztZQUNiLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxRQUFRLEtBQUssS0FBSyxDQUFDLENBQUM7U0FDdkQsQ0FBQTtLQUNEO0lBRUQsSUFBSTtRQUNILElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUV4QyxJQUFJLENBQUMsUUFBUSxHQUFHLEdBQUcsQ0FBQztRQUNwQixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7S0FDbkI7SUFDRCxJQUFJO1FBQ0gsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQ3JDO0NBQ0Q7QUFDRCxNQUFNLE9BQU87SUFnQlo7UUFmUSxjQUFTLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3ZCLGNBQVMsR0FBRyxFQUFFLENBQW9CLFdBQVcsQ0FBQyxDQUFDO1FBQy9DLGVBQVUsR0FBRyxFQUFFLENBQW9CLFlBQVksQ0FBQyxDQUFDO1FBQ2pELFdBQU0sR0FBRyxFQUFFLENBQW9CLE9BQU8sQ0FBQyxDQUFDO1FBQ3hDLFFBQUcsR0FBRyxFQUFFLENBQW1CLEtBQUssQ0FBQyxDQUFDO1FBQ2xDLGFBQVEsR0FBRyxFQUFFLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUNqQyxZQUFPLEdBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzFCLG9CQUFlLEdBQUcsRUFBRSxDQUFvQixpQkFBaUIsQ0FBQyxDQUFDO1FBQzNELGVBQVUsR0FBRyxFQUFFLENBQW9CLFVBQVUsQ0FBQyxDQUFDO1FBQ3ZELFdBQU0sR0FBRyxJQUFJLGdCQUFnQixDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRXJFLG9CQUFlLEdBQUcsU0FBUyxDQUFDO1FBQzVCLHFCQUFnQixHQUFHLFNBQVMsQ0FBQztRQUM3QixpQkFBWSxHQUFHLFNBQVMsQ0FBQztRQUd4QixPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxNQUFNLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDO1FBQ3RELE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLE1BQU0sSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQztRQUN4RCxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxNQUFNLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDO0tBQ2hEO0lBQ0QsSUFBSTtRQUNILElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUN4QztJQUNELElBQUk7UUFDSCxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDckM7SUFDRCxRQUFRO1FBQ1AsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO0tBQ3hCO0lBQ0QsTUFBTSxDQUFDLElBQW1CO1FBQ3pCLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7S0FDekM7SUFDRCxXQUFXLENBQUMsR0FBVztRQUN0QixJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsR0FBRyxHQUFHLENBQUM7S0FDaEM7SUFDRCxNQUFNLENBQUMsR0FBVztRQUNqQixJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsR0FBRyxHQUFHLENBQUM7S0FDL0I7Q0FDRDtBQUNELE1BQWEsRUFBRTtJQU9kO1FBTlEsU0FBSSxHQUFHLElBQUksT0FBTyxFQUFFLENBQUM7UUFDckIsU0FBSSxHQUFHLElBQUksT0FBTyxFQUFFLENBQUM7UUFFN0Isa0JBQWEsR0FBRyxDQUFDLFNBQWlCLEVBQUUsUUFBaUIsUUFBUSxDQUFDO1FBQzlELGtCQUFhLEdBQUcsU0FBUyxDQUFDO1FBR3pCLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxHQUFHLENBQUMsU0FBUyxFQUFFLFFBQVEsS0FBSyxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUMzRixJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsR0FBRyxNQUFNLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztLQUNyRDtJQUVELFFBQVE7UUFDUCxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7S0FDakI7SUFDRCxRQUFRO1FBQ1AsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNqQixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0tBQ2pCO0lBQ0QsUUFBUTtRQUNQLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7S0FDckI7SUFDRCxNQUFNLENBQUMsSUFBbUI7UUFDekIsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDdkI7SUFDRCxXQUFXLENBQUMsR0FBVztRQUN0QixJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUMzQjtJQUNELE1BQU0sQ0FBQyxHQUFXO1FBQ2pCLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ3RCO0NBQ0Q7O1NDOUtlLFFBQVE7SUFDdkIsT0FBTyxTQUFTLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztDQUNoRTtBQUdELFNBQWdCLE1BQU0sQ0FBQyxFQUFhO0lBQ25DLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUM7Q0FDcEM7O0FDTEQsTUFBTSxTQUFTLEdBQUcsRUFBRSxDQUFDO0FBQ3JCLE1BQU0sWUFBWSxHQUFHLENBQUMsQ0FBQztBQUV2QixBQUFBLElBQWtCLElBSWpCO0FBSkQsV0FBa0IsSUFBSTtJQUNyQixxQ0FBTyxDQUFBO0lBQ1AsaUNBQUssQ0FBQTtJQUNMLGlDQUFLLENBQUE7Q0FDTCxFQUppQixJQUFJLEtBQUosSUFBSSxRQUlyQjtBQUdELE1BQU0sU0FBUztJQUtkLFlBQ0MsSUFBWSxFQUNaLElBQVk7UUFFWixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNqQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNqQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQzVDLE1BQU0sSUFBSSxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FDckMsT0FBa0IsQ0FDbEIsQ0FDRCxDQUFDO0tBQ0Y7Q0FDRDtBQUVELE1BQU0sS0FBSztJQUdWO1FBQ0MsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO0tBQ3hCO0lBQ0QsT0FBTyxDQUFDLENBQVMsRUFBRSxDQUFTO1FBQzNCLE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDcEMsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUVwQyxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDMUMsSUFBSSxDQUFDLEdBQUc7WUFDUCxTQUFvQjtRQUVyQixJQUFJLEtBQUssR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNwQyxJQUFJLENBQUMsS0FBSztZQUNULFNBQW9CO1FBRXJCLE9BQU8sS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ3ZDO0lBQ0QsT0FBTyxDQUFDLENBQVMsRUFBRSxDQUFTLEVBQUUsSUFBVTtRQUN2QyxNQUFNLElBQUksR0FBRyxRQUFRLENBQUMsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ3BDLE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFFcEMsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzFDLElBQUksQ0FBQyxHQUFHO1lBQ1AsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQ2QsSUFBSSxDQUFDLFNBQVMsRUFDZCxHQUFHLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FDZixDQUFDO1FBRUgsSUFBSSxLQUFLLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDcEMsSUFBSSxDQUFDLEtBQUs7WUFDVCxHQUFHLENBQUMsR0FBRyxDQUNOLElBQUksQ0FBQyxTQUFTLEVBQ2QsS0FBSyxHQUFHLElBQUksU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUNyRCxDQUFDO1FBRUgsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQztLQUN2QztJQUNELEtBQUs7UUFDSixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7S0FDeEI7Q0FDRDtBQUdELE1BQU0sR0FBRyxHQUNOLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxF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

import { MyCanvas } from "./mycanvas";

const chunkSize = 16;
const minSwipeMove = 5;

export const enum Cell {
	nothing,
	black,
	white
}
export type Piece = Cell.black | Cell.white;

class CellChunk {
	cells: Cell[][]
	xPos: number // ..., -chunkSize, 0, chunkSize, chunkSize*2, ...
	yPos: number // ..., -chunkSize, 0, chunkSize, chunkSize*2, ...

	constructor(
		xPos: number,
		yPos: number,
	) {
		this.xPos = xPos;
		this.yPos = yPos;
		this.cells = new Array(chunkSize).fill(0).map(
			() => new Array(chunkSize).fill(0).map(
				() => Cell.nothing
			)
		);
	}
	some(fn: (x: number, y: number) => boolean): boolean {
		for (let i = 0; i < chunkSize; i++) {
			for (let j = 0; j < chunkSize; j++) {
				if (fn(i, j)) return true;
			}
		}
		return false;
	}
	sum(fn: (x: number, y: number) => number): number {
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
	private chunks: Map<number, Map<number, CellChunk>> // key: ..., -chunkSize, 0, chunkSize, chunkSize*2, ...

	constructor() {
		this.chunks = new Map();
	}
	getCell(x: number, y: number): Cell {
		const posX = quantize(x, chunkSize);
		const posY = quantize(y, chunkSize);

		let tmp = this.chunks.get(posX.quantized);
		if (!tmp)
			return Cell.nothing;

		let chunk = tmp.get(posY.quantized);
		if (!chunk)
			return Cell.nothing;

		return chunk.cells[posX.mod][posY.mod];
	}
	setCell(x: number, y: number, cell: Cell): void {
		const posX = quantize(x, chunkSize);
		const posY = quantize(y, chunkSize);

		let tmp = this.chunks.get(posX.quantized);
		if (!tmp)
			this.chunks.set(
				posX.quantized,
				tmp = new Map()
			);

		let chunk = tmp.get(posY.quantized);
		if (!chunk)
			tmp.set(
				posY.quantized,
				chunk = new CellChunk(posX.quantized, posY.quantized)
			);

		chunk.cells[posX.mod][posY.mod] = cell;
	}
	some(fn: (x: number, y: number) => boolean): boolean {
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
	sum(fn: (x: number, y: number) => number): number {
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
	reset(): void {
		this.chunks = new Map();
	}
}

type Di2D = [number, number]; // Direction 2D
const di8: Di2D[]
	= [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];

export class ReversiBoard extends Board {
	onAfterPut = (x: number, y: number, piece: Piece) => { };
	constructor(initialize = true) {
		super();
		if (initialize)
			this.reset();
	}
	reset(): void {
		super.reset();

		// ○ ● : White Black
		// ● ○ : Black White
		this.setCell(0, 0, Cell.white);
		this.setCell(-1, -1, Cell.white);
		this.setCell(-1, 0, Cell.black);
		this.setCell(0, -1, Cell.black);
	}
	canPut(x: number, y: number, piece: Piece): boolean {
		if (this.getCell(x, y) !== Cell.nothing)
			return false;

		const opponent = opponentPiece(piece);
		return di8.some(di => this.canReverseDi(x, y, piece, di));
	}
	canPutSomewhere(piece: Piece): boolean {
		// TODO: Performance improvement
		return this.some((x, y) => this.canPut(x, y, piece));
	}
	countPiece(piece: Piece): number {
		// TODO: Performance improvement
		return this.sum((x, y) => this.getCell(x, y) === piece ? 1 : 0);
	}
	put(x: number, y: number, piece: Piece): void {
		if (!this.canPut(x, y, piece)) throw "BUG";
		di8.forEach(di => {
			if (this.canReverseDi(x, y, piece, di))
				this.reverseDi(x, y, piece, di);
		});
		this.setCell(x, y, piece);
		this.onAfterPut(x, y, piece);
	}
	isFinished(): boolean {
		return !this.canPutSomewhere(Cell.black) && !this.canPutSomewhere(Cell.white);
	}
	// [x+di[0], y+di[1]] 以降の部分のみを見て判断します。
	private canReverseDi(x: number, y: number, piece: Piece, di: Di2D): boolean {
		const opponent = opponentPiece(piece);

		let cX = x, cY = y;
		let cnt = 0;
		while (true) {
			cX += di[0]; cY += di[1];
			const cCell = this.getCell(cX, cY);
			if (cCell === opponent)
				cnt++;
			else if (cCell === piece)
				return cnt > 0;
			else
				return false;
		}
	}
	private reverseDi(x: number, y: number, piece: Piece, di: Di2D): void {
		const opponent = opponentPiece(piece);

		let cX = x, cY = y;
		let cnt = 0;
		while (true) {
			cX += di[0]; cY += di[1];
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

// TODO: setCell では、自動的な render が行われない件
export class DrawableReversiBoard extends ReversiBoard {
	private canvas: MyCanvas | undefined = undefined;
	private cellSize = 1;
	private originPixel: [number, number] = [0, 0]; // 盤面の[0,0]がどこの座標に描画されるべきかを示す。[0,0]ならば、canvasの中央から[0,0]平行移動した位置に描画する。
	private selected: undefined | [number, number] = undefined;
	private playerPiece: Piece | undefined = undefined;
	maxTurnCount: number | undefined = undefined;

	onCellClicked = (x: number, y: number) => { };

	bindCanvas(canvas: MyCanvas) {
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
				const offset: [number, number] = [
					(e.offsetX - startPos[0]) * canvas.dpr,
					(e.offsetY - startPos[1]) * canvas.dpr];
				const newOriginPixel: [number, number] = [
					offset[0] + this.originPixel[0],
					offset[1] + this.originPixel[1]];
				this.render(newOriginPixel);
				e.preventDefault();
			}
		});
		canvas.canvas.addEventListener("pointerup", e => {
			const offset: [number, number] = [
				(e.offsetX - startPos[0]) * canvas.dpr,
				(e.offsetY - startPos[1]) * canvas.dpr];
			if (Math.hypot(...offset) < minSwipeMove) {
				// select
				const pos = this.pixel2cell(startPos[0] * canvas.dpr, startPos[1] * canvas.dpr);
				this.selected = [Math.floor(pos.x), Math.floor(pos.y)];
			} else {
				const newOriginPixel: [number, number] = [
					offset[0] + this.originPixel[0],
					offset[1] + this.originPixel[1]];
				this.originPixel = newOriginPixel;
			}
			this.render();
		});

		this.render();
	}
	getCellSize(): number {
		return this.cellSize;
	}
	setCellSize(pixels: number): void {
		const factor = pixels / this.cellSize;
		this.originPixel = [
			this.originPixel[0] * factor,
			this.originPixel[1] * factor,
		]
		this.cellSize = pixels;
		this.render();
	}
	getplayerPiece(): Piece | undefined {
		return this.playerPiece;
	}
	setPlayerPiece(piece: Piece | undefined) {
		this.playerPiece = piece;
		this.render();
	}
	getSelected(): { x: number, y: number } | undefined {
		if (this.selected) return { x: this.selected[0], y: this.selected[1] };
		return undefined;
	}
	setSelected(pos: { x: number, y: number } | undefined) {
		if (pos) this.selected = [pos.x, pos.y];
		else this.selected = undefined;
	}
	put(x: number, y: number, piece: Piece): void {
		super.put(x, y, piece);
		this.render();
	}
	render(originPixel = this.originPixel, playerPiece = this.playerPiece) {
		if (!this.canvas) return;
		const
			canvas = this.canvas,
			width = canvas.width,
			height = canvas.height,
			cellSize = this.cellSize;
		const cell2pixel = (x: number, y: number) => this.cell2pixel(x, y, originPixel);
		const pixel2cell = (x: number, y: number) => this.pixel2cell(x, y, originPixel);
		const boardVP = { // viewport
			left: Math.floor(pixel2cell(0, 0).x),
			top: Math.floor(pixel2cell(0, 0).y),
			right: Math.ceil(pixel2cell(width, height).x),
			bottom: Math.ceil(pixel2cell(width, height).y),
		};

		// render

		// 1. background
		canvas.fillAll("#eee");

		// 2. selected cell
		if (this.selected) {
			const pixel = cell2pixel(this.selected[0], this.selected[1]);
			canvas.beginPath();
			this.canvas.rect(pixel.left, pixel.top, cellSize, cellSize);
			canvas.fill("#cdc");
		}

		// 3. grid lines
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

		// 4. pieces & puttable cells 
		const
			radius = (cellSize / 2) * 0.8,
			suggestRadius = Math.max(1, radius * 0.2);
		for (let x = boardVP.left; x <= boardVP.right; x++) {
			for (let y = boardVP.top; y <= boardVP.bottom; y++) {
				const pixel = cell2pixel(x, y);
				const
					centerX = pixel.left + cellSize / 2,
					centerY = pixel.top + cellSize / 2;

				const piece = this.getCell(x, y);
				if (piece === Cell.black) {
					canvas.beginPath();
					this.canvas.round(centerX, centerY, radius);
					canvas.fill("#555");
				} else if (piece === Cell.white) {
					canvas.beginPath();
					this.canvas.round(centerX, centerY, radius);
					canvas.stroke("#555");
				} else if (piece === Cell.nothing) {
					if (playerPiece && this.canPut(x, y, playerPiece)) {
						canvas.beginPath();
						this.canvas.round(centerX, centerY, suggestRadius);
						canvas.fill("#555");
					}
				} else throw "BUG";
			}
		}
	}
	private cell2pixel(x: number, y: number, originPixel = this.originPixel) {
		if (!this.canvas) throw "BUG";
		const
			canvas = this.canvas,
			width = canvas.width,
			height = canvas.height,
			cellSize = this.cellSize;
		return ({
			left: originPixel[0] + x * cellSize + width / 2,
			top: originPixel[1] + y * cellSize + height / 2,
		})
	};
	private pixel2cell(x: number, y: number, originPixel = this.originPixel) {
		if (!this.canvas) throw "BUG";
		const
			canvas = this.canvas,
			width = canvas.width,
			height = canvas.height,
			cellSize = this.cellSize;
		return ({
			x: (x - width / 2 - originPixel[0]) / cellSize,
			y: (y - height / 2 - originPixel[1]) / cellSize,
		});
	}
}

function quantize(num: number, divisor: number) {
	const quantized = Math.floor(num / divisor) * divisor;
	const mod = num - quantized;
	return { quantized, mod };
}
export function opponentPiece(piece: Piece): Piece {
	if (piece === Cell.black) return Cell.white;
	if (piece === Cell.white) return Cell.black;
	throw "BUG";
}

import { ResponsiveCanvas } from "./responsive-canvas";

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
	reset(): void {
		this.chunks = new Map();
	}
}

type Di2D = [number, number]; // Direction 2D
const di8: Di2D[]
	= [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, -1]];

export class ReversiBoard extends Board {
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
		this.setCell(-1, -1, Cell.black);
		this.setCell(-1, 0, Cell.black);
		this.setCell(0, 0, Cell.white);
	}
	canPut(x: number, y: number, piece: Piece): boolean {
		if (this.getCell(x, y) !== Cell.nothing)
			return false;

		const opponent = opponentPiece(piece);
		return di8.some(di => this.canReverseDi(x, y, piece, di));
	}
	put(x: number, y: number, piece: Piece): void {
		if (!this.canPut(x, y, piece)) throw "BUG";
		di8.forEach(di => {
			if (this.canReverseDi(x, y, piece, di))
				this.reverseDi(x, y, piece, di);
		});
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
	private canvas: ResponsiveCanvas | undefined = undefined;
	private zoomFactor = 1;
	private viewCenter = [0, 0];
	private selected: undefined | [number, number] = undefined;

	onCellClicked = (x: number, y: number) => { };

	bindCanvas(canvas: ResponsiveCanvas) {
		this.canvas = canvas;
		canvas.onResize = () => {
			this.render();
		};
		let startPos = [0, 0];
		canvas.canvas.addEventListener("pointerdown", e => {
			startPos = [e.clientX, e.clientY];
		});
		canvas.canvas.addEventListener("pointermove", e => {
			const offset: [number, number] = [
				e.clientX - startPos[0],
				e.clientY - startPos[1]];
			if (Math.hypot(...offset) < minSwipeMove) return;
			const newViewCenter: [number, number] = [
				offset[0] + this.viewCenter[0],
				offset[1] + this.viewCenter[1]];
			this.render(newViewCenter);
		});
		canvas.canvas.addEventListener("pointerup", e => {
			const offset: [number, number] = [
				e.clientX - startPos[0],
				e.clientY - startPos[1]];
			if (Math.hypot(...offset) < minSwipeMove) {
				// TODO
			} else {
				const newViewCenter: [number, number] = [
					offset[0] + this.viewCenter[0],
					offset[1] + this.viewCenter[1]];
			}
			this.render();
		});
		this.render();
	}
	getZoom(): number {
		return this.zoomFactor;
	}
	setZoom(factor: number): void {
		this.zoomFactor = factor;
		this.render();
	}
	put(x: number, y: number, piece: Piece): void {
		super.put(x, y, piece);
		this.render();
	}
	render(viewCenter?: [number, number]) {
		if (!this.canvas) return;
		// TODO
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

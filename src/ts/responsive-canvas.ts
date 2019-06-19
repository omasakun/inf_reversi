export class ResponsiveCanvas {
	parent: HTMLElement
	canvas: HTMLCanvasElement
	ctx: CanvasRenderingContext2D
	scaleX: number
	scaleY: number
	// aspect: number
	dpr: number
	constructor(
		parent: HTMLElement,
		canvas: HTMLCanvasElement,
		dpr: number | undefined = undefined,
		// aspect: number,
	) {
		this.parent = parent;
		this.canvas = canvas;
		if (canvas.getContext) this.ctx = canvas.getContext('2d')!;
		else throw "Canvasが対応していないようです";
		this.scaleX = 1;
		this.scaleY = 1;
		this.dpr = (dpr || window.devicePixelRatio || 1);
		// this.aspect = aspect;
		var self = this;
		(() => {
			var i: number | undefined = undefined;
			window.addEventListener('resize', () => {
				if (i !== undefined) clearTimeout(i);
				i = setTimeout(() => this.onResize(), 100);
			});
		})();
		this.onResize();
		return this;
	}
	changeDPR(dpr: number) {
		this.dpr = dpr || this.dpr;
		this.onResize();
		console.log(`[DPR: ${dpr}/${(window.devicePixelRatio || 1)}`);
	}
	onResize() {
		let canvas = this.ctx.canvas;
		const maxWidth = this.parent.clientWidth;
		const maxHeight = this.parent.clientHeight;
		/* : /* にするか、 //* にするかで処理が変わる。
		const scale = Math.min(maxWidth / this.aspect, maxHeight);
		const scaleX = scale * this.aspect;
		const scaleY = scale;
		/*/
		const scaleX = maxWidth;
		const scaleY = maxHeight;
		//*/
		this.scaleX = this.dpr * scaleX;
		this.scaleY = this.dpr * scaleY;
		canvas.width = this.scaleX;
		canvas.height = this.scaleY;
		canvas.style.width = scaleX + "px";
		canvas.style.height = scaleY + "px";
		this.ctx.lineWidth = this.dpr;
	}
	line(x1: number, y1: number, x2: number, y2: number) {
		this.ctx.moveTo((x1 * this.scaleX), (y1 * this.scaleY));
		this.ctx.lineTo((x2 * this.scaleX), (y2 * this.scaleY));
	}
	rect(x: number, y: number, w: number, h: number) {
		this.ctx.rect(
			(x * this.scaleX), (y * this.scaleY),
			(w * this.scaleX), (h * this.scaleY)
		);
	}
	round(x: number, y: number, r: number) {
		this.ctx.arc(
			(x * this.scaleX),
			(y * this.scaleY),
			(r * Math.min(this.scaleX, this.scaleY)),
			-0.5 * Math.PI,
			2 * Math.PI
		);
	}
	longRound(x: number, y: number, h: number, r: number) {
		this.ctx.arc(
			(x * this.scaleX),
			(y * this.scaleY),
			(r * Math.min(this.scaleX, this.scaleY)),
			-Math.PI, 0
		);
		this.ctx.arc(
			(x * this.scaleX),
			((y + h) * this.scaleY),
			(r * Math.min(this.scaleX, this.scaleY)),
			0, -Math.PI
		);
		this.ctx.lineTo(
			(x * this.scaleX - r * Math.min(this.scaleX, this.scaleY)),
			(y * this.scaleY)
		);
	}
	beginPath() { this.ctx.beginPath() }
	fillAll(style: undefined | string = undefined) {
		if (style !== undefined) this.ctx.fillStyle = style;
		this.ctx.fillRect(0, 0, this.scaleX, this.scaleY);
	}
	fill(style: undefined | string = undefined) {
		if (style !== undefined) this.ctx.fillStyle = style;
		this.ctx.fill();
	}
	stroke(style: undefined | string = undefined) {
		if (style !== undefined) this.ctx.strokeStyle = style;
		this.ctx.stroke();
	}
	clearAll() {
		this.ctx.clearRect(0, 0, this.scaleX, this.scaleY);
	}
}
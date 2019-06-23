export class MyCanvas {
	parent: HTMLElement
	canvas: HTMLCanvasElement
	ctx: CanvasRenderingContext2D
	width: number
	height: number
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
		this.width = 1;
		this.height = 1;
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
		const width = maxWidth;
		const height = maxHeight;
		//*/
		this.width = this.dpr * width;
		this.height = this.dpr * height;
		canvas.width = this.width;
		canvas.height = this.height;
		canvas.style.width = width + "px";
		canvas.style.height = height + "px";
		this.ctx.lineWidth = this.dpr;
	}
	line(x1: number, y1: number, x2: number, y2: number) {
		const scaleX = 1, scaleY = 1;
		this.ctx.moveTo((x1 * scaleX), (y1 * scaleY));
		this.ctx.lineTo((x2 * scaleX), (y2 * scaleY));
	}
	rect(x: number, y: number, w: number, h: number) {
		const scaleX = 1, scaleY = 1;
		this.ctx.rect(
			(x * scaleX), (y * scaleY),
			(w * scaleX), (h * scaleY)
		);
	}
	round(x: number, y: number, r: number) {
		const scaleX = 1, scaleY = 1;
		this.ctx.arc(
			(x * scaleX),
			(y * scaleY),
			(r * Math.min(scaleX, scaleY)),
			-0.5 * Math.PI,
			2 * Math.PI
		);
	}
	longRound(x: number, y: number, h: number, r: number) {
		const scaleX = 1, scaleY = 1;
		this.ctx.arc(
			(x * scaleX),
			(y * scaleY),
			(r * Math.min(scaleX, scaleY)),
			-Math.PI, 0
		);
		this.ctx.arc(
			(x * scaleX),
			((y + h) * scaleY),
			(r * Math.min(scaleX, scaleY)),
			0, -Math.PI
		);
		this.ctx.lineTo(
			(x * scaleX - r * Math.min(scaleX, scaleY)),
			(y * scaleY)
		);
	}
	beginPath() { this.ctx.beginPath() }
	fillAll(style: undefined | string = undefined) {
		if (style !== undefined) this.ctx.fillStyle = style;
		this.ctx.fillRect(0, 0, this.width, this.height);
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
		const scaleX = 1, scaleY = 1;
		this.ctx.clearRect(0, 0, this.width, this.height);
	}
}
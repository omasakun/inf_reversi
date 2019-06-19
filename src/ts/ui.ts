import { ge, onClick, ce } from "./dom-util";
import { ResponsiveCanvas } from "./responsive-canvas";

const pref = {
	defaultTurnCount: 64,
}

class UI_Info {
	private container = ge("info");
	private playBtn = ge("i-play");
	private onlineBtn = ge("i-start_online");
	private joinBtn = ge("i-join_online");

	onPlayClicked = () => { };
	onOnlineClicked = () => { };
	onJoinClicked = () => { };

	constructor() {
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
	private container = ge("config");
	private sizeInput = ge<HTMLInputElement>("c-size_in");
	private sizeView = ge("c-size_out");
	private startBtn = ge("c-start");
	private turnCount = pref.defaultTurnCount;

	onStartClicked = (turnCount: number) => { };

	constructor() {
		onClick(this.startBtn, () => this.onStartClicked(this.turnCount));
		this.sizeInput.addEventListener("input", () => this.onUpdateSizeInput());
		this.sizeInput.value = this.turnCount + "";
		this.updateSizeView();
	}

	private updateSizeView() {
		this.sizeView.textContent = `The game will finish in ${this.turnCount} turns.`;
	}
	private onUpdateSizeInput() {
		let value = parseInt(this.sizeInput.value);
		if (value <= 0 || isNaN(value)) value = pref.defaultTurnCount;
		if (value % 2 == 1) value++;
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
	private container = ge("container");
	private info = new UI_Info();
	private config = new UI_Config();
	private isOnline: "yes" | "no" | "?" = "?";

	onPlayClicked = (turnCount: number, isOnline: boolean) => { };
	onJoinClicked = () => { };

	constructor() {
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
		}
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
	private container = ge("game");
	private zoomInBtn = ge<HTMLButtonElement>("g-zoom_in");
	private zoomOutBtn = ge<HTMLButtonElement>("g-zoom_out");
	private putBtn = ge<HTMLButtonElement>("g-put");
	private log = ge<HTMLUListElement>("log");
	private shortMsg = ge("g-short_message");
	private message = ge("g-message");
	private canvasContainer = ge<HTMLCanvasElement>("g-canvas_parent");
	private canvasElem = ge<HTMLCanvasElement>("g-canvas");
	canvas = new ResponsiveCanvas(this.canvasContainer, this.canvasElem);

	onZoomInClicked = () => { };
	onZoomOutClicked = () => { };
	onPutClicked = () => { };

	constructor() {
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
	addLog(elem: HTMLElement[]) {
		this.log.appendChild(ce("li", [], elem));
	}
	setShortMsg(msg: string) {
		this.shortMsg.textContent = msg;
	}
	setMsg(msg: string) {
		this.message.textContent = msg;
	}
}
export class UI {
	private menu = new UI_Menu();
	private game = new UI_Game();

	onPlayClicked = (turnCount: number, isOnline: boolean) => { };
	onJoinClicked = () => { };

	constructor() {
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
	addLog(elem: HTMLElement[]) {
		this.game.addLog(elem);
	}
	setShortMsg(msg: string) {
		this.game.setShortMsg(msg);
	}
	setMsg(msg: string) {
		this.game.setMsg(msg);
	}
}